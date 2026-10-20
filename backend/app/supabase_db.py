import os
import threading
import time
from datetime import datetime, timezone
from typing import Optional
from urllib.parse import urlparse

import httpx

_supabase = None
_ready = False

# A paused Supabase project drops its DNS record, so every DB-backed request
# used to die with a raw "[Errno -2] Name or service not known". Probing the
# REST API lets the app tell "paused/unreachable" apart from "wrong config"
# and answer with an actionable message instead of an OS errno.
_PROBE_TTL_SECONDS = 30.0
_probe_lock = threading.Lock()
_probe_state: dict = {"checked_at": 0.0, "reachable": False, "reason": None, "host": ""}


def _config() -> tuple[str, str]:
    url = os.getenv("SUPABASE_URL", "").strip() or os.getenv("VITE_SUPABASE_URL", "").strip()
    key = (
        os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()
        or os.getenv("SUPABASE_ANON_KEY", "").strip()
        or os.getenv("VITE_SUPABASE_ANON_KEY", "").strip()
    )
    return url, key


def _classify(exc: Exception) -> str:
    text = str(exc).lower()
    if any(token in text for token in ("name or service not known", "getaddrinfo", "nodename nor servname", "name resolution", "temporary failure")):
        return "dns_unresolved"
    if "connection refused" in text:
        return "connection_refused"
    if "timeout" in text or "timed out" in text:
        return "timeout"
    return "unreachable"


def probe(timeout: float = 4.0, attempts: int = 2) -> dict:
    """Check that the Supabase host resolves and the REST API answers.

    Returns {"reachable", "reason", "host", "checked_at"}. Cached for 30s so
    hot paths do not pay for a network round-trip on every request, and retried
    once because some resolvers intermittently return a stale NXDOMAIN.
    """
    url, key = _config()
    host = urlparse(url).hostname or "" if url else ""
    if not url or not key:
        return {"reachable": False, "reason": "not_configured", "host": host, "checked_at": time.time()}

    now = time.time()
    with _probe_lock:
        if now - _probe_state["checked_at"] < _PROBE_TTL_SECONDS:
            return dict(_probe_state)

    state: dict = {"checked_at": time.time(), "reachable": False, "reason": None, "host": host}
    for attempt in range(max(1, attempts)):
        try:
            response = httpx.get(
                f"{url.rstrip('/')}/rest/v1/profiles?select=id&limit=1",
                headers={"apikey": key, "Authorization": f"Bearer {key}"},
                timeout=timeout,
            )
            if response.status_code == 429:
                state["reason"] = "project_paused"
            elif response.status_code >= 500:
                state["reason"] = "server_error"
            else:
                state["reachable"] = True
                state["reason"] = None
            break
        except Exception as exc:
            state["reason"] = _classify(exc)
            state["detail"] = str(exc)
            if attempt + 1 < attempts:
                time.sleep(0.4)

    with _probe_lock:
        _probe_state.update(state)
    return dict(state)


def _client():
    global _supabase, _ready
    if _supabase is not None:
        return _supabase
    url, key = _config()
    if not url or not key:
        print("Supabase not configured (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)")
        _ready = False
        return None
    try:
        from supabase import create_client
        _supabase = create_client(url, key)
        _ready = True
        print("Supabase connected")
        return _supabase
    except Exception as e:
        print(f"Supabase init failed: {e}")
        _ready = False
        return None


def is_configured() -> bool:
    """True when a Supabase client can be built (no network access involved)."""
    return _client() is not None


def is_ready() -> bool:
    """True only when Supabase is configured AND actually reachable.

    create_client() never touches the network, so checking for a client alone
    reported "ready" even for a paused (DNS-less) project. This costs a probe
    round-trip, so it is meant for health/status reporting rather than hot paths.
    """
    if _client() is None:
        return False
    return bool(probe()["reachable"])


def health_check() -> dict:
    sb = _client()
    state = probe()
    if not sb:
        return {"ready": False, "tables": {}, "message": "Supabase client is not configured"}
    if not state["reachable"]:
        return {
            "ready": False,
            "tables": {},
            "host": state["host"],
            "reason": state["reason"],
            "message": f"Supabase is unreachable ({state['reason']})",
        }
    tables = {}
    for table in (
        "profiles",
        "fpos",
        "corporates",
        "farms",
        "marketplace_listings",
        "otp_codes",
        "kyc_verifications",
    ):
        try:
            sb.table(table).select("*").limit(1).execute()
            tables[table] = True
        except Exception as e:
            tables[table] = False
            print(f"Supabase health check failed for {table}: {e}")
    return {"ready": all(tables.values()), "tables": tables, "host": state["host"], "reason": state["reason"]}


def get_profile(phone: str) -> Optional[dict]:
    sb = _client()
    if not sb:
        return None
    res = sb.table("profiles").select("*").eq("phone", phone).limit(1).execute()
    rows = res.data or []
    return rows[0] if rows else None


def upsert_profile(profile: dict) -> bool:
    sb = _client()
    if not sb:
        return False
    profile["updated_at"] = datetime.now(timezone.utc).isoformat()
    sb.table("profiles").upsert(profile, on_conflict="phone").execute()
    return True


def update_profile(phone: str, fields: dict) -> Optional[dict]:
    sb = _client()
    if not sb:
        return None
    fields["updated_at"] = datetime.now(timezone.utc).isoformat()
    res = sb.table("profiles").update(fields).eq("phone", phone).execute()
    rows = res.data or []
    if rows:
        return rows[0]
    return get_profile(phone)


def get_document_hashes() -> list[str]:
    sb = _client()
    if not sb:
        return []
    res = sb.table("kyc_verifications").select("document_sha256").execute()
    return [row["document_sha256"] for row in (res.data or []) if row.get("document_sha256")]


def sha_owner_phones(sha: str) -> list:
    """All phones that previously submitted this document hash (fraud context)."""
    sb = _client()
    if not sb or not sha:
        return []
    res = sb.table("kyc_verifications").select("owner_phone").eq("document_sha256", sha).execute()
    return [row.get("owner_phone") for row in (res.data or []) if row.get("owner_phone")]


def verified_kyc_for_survey(phone: str, survey_number: str) -> Optional[dict]:
    """Most recent VERIFIED record for this phone + survey, if any.

    A standing VERIFIED record protects the parcel from being downgraded by
    later noisy re-attempts — only FPO review may change verified status.
    """
    sb = _client()
    if not sb or not (survey_number or "").strip():
        return None
    res = (
        sb.table("kyc_verifications")
        .select("*")
        .eq("owner_phone", phone)
        .eq("status", "VERIFIED")
        .order("created_at", desc=True)
        .limit(10)
        .execute()
    )
    want = survey_number.strip().lower()
    for row in res.data or []:
        ef = row.get("extracted_fields") or {}
        if str(ef.get("survey_number") or "").strip().lower() == want:
            return row
    return None


def insert_kyc_verification(record: dict) -> Optional[dict]:
    sb = _client()
    if not sb:
        return None
    res = sb.table("kyc_verifications").insert(record).execute()
    rows = res.data or []
    return rows[0] if rows else None


def get_kyc_status(phone: str) -> Optional[dict]:
    """Fetch the most recent KYC verification record for a phone number."""
    sb = _client()
    if not sb:
        return None
    res = (
        sb.table("kyc_verifications")
        .select("*")
        .eq("owner_phone", phone)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    rows = res.data or []
    return rows[0] if rows else None


def store_otp(phone: str, otp: str, expires_at: datetime) -> bool:
    sb = _client()
    if not sb:
        return False
    sb.table("otp_codes").upsert({
        "phone": phone,
        "otp": otp,
        "expires_at": expires_at.isoformat(),
    }, on_conflict="phone").execute()
    return True


def verify_otp_db(phone: str, otp: str) -> bool:
    sb = _client()
    if not sb:
        return False
    res = sb.table("otp_codes").select("*").eq("phone", phone).limit(1).execute()
    rows = res.data or []
    if not rows:
        return False
    row = rows[0]
    exp = datetime.fromisoformat(row["expires_at"].replace("Z", "+00:00"))
    if datetime.now(timezone.utc) > exp:
        sb.table("otp_codes").delete().eq("phone", phone).execute()
        return False
    if row["otp"] != otp:
        return False
    sb.table("otp_codes").delete().eq("phone", phone).execute()
    return True


def clear_otp(phone: str) -> bool:
    sb = _client()
    if not sb:
        return False
    sb.table("otp_codes").delete().eq("phone", phone).execute()
    return True


def get_farms(phone: str) -> list:
    sb = _client()
    if not sb:
        return []
    res = (
        sb.table("farms")
        .select("*")
        .eq("owner_phone", phone)
        .order("created_at", desc=True)
        .execute()
    )
    return res.data or []


def insert_farm(farm: dict) -> Optional[dict]:
    sb = _client()
    if not sb:
        return None
    try:
        res = sb.table("farms").insert(farm).execute()
        rows = res.data or []
        return rows[0] if rows else None
    except Exception as e:
        print(f"Supabase insert_farm failed: {e}")
        return None


def update_farm(farm_id: str, fields: dict) -> Optional[dict]:
    sb = _client()
    if not sb:
        return None
    fields["updated_at"] = datetime.now(timezone.utc).isoformat()
    res = sb.table("farms").update(fields).eq("id", farm_id).execute()
    rows = res.data or []
    return rows[0] if rows else None


def get_listings(status: Optional[str] = "Active") -> list:
    sb = _client()
    if not sb:
        return []
    q = sb.table("marketplace_listings").select("*").order("created_at", desc=True)
    if status:
        q = q.eq("status", status)
    res = q.execute()
    return res.data or []


LISTING_SORT_COLUMNS = {
    "created_at",
    "updated_at",
    "price_per_credit",
    "total_credits",
    "carbon_credits",
    "biodiversity_credits",
    "expires_at",
}


def get_listings_filtered(
    status: Optional[str] = "Active",
    crop: Optional[str] = None,
    location: Optional[str] = None,
    farmer_phone: Optional[str] = None,
    farm_id: Optional[str] = None,
    listing_model: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_credits: Optional[float] = None,
    max_credits: Optional[float] = None,
    search: Optional[str] = None,
    sort: str = "created_at",
    order: str = "desc",
    limit: int = 50,
    offset: int = 0,
) -> dict:
    sb = _client()
    if not sb:
        return {"total": 0, "listings": []}

    q = sb.table("marketplace_listings").select("*", count="exact")

    if status and status.strip().lower() != "all":
        q = q.eq("status", status)
    if crop:
        q = q.ilike("crop", f"*{crop}*")
    if location:
        q = q.ilike("location", f"*{location}*")
    if farmer_phone:
        q = q.eq("farmer_phone", farmer_phone)
    if farm_id:
        q = q.eq("farm_id", farm_id)
    if listing_model:
        q = q.ilike("listing_model", f"*{listing_model}*")
    if min_price is not None:
        q = q.gte("price_per_credit", min_price)
    if max_price is not None:
        q = q.lte("price_per_credit", max_price)
    if min_credits is not None:
        q = q.gte("total_credits", min_credits)
    if max_credits is not None:
        q = q.lte("total_credits", max_credits)
    if search:
        clean = "".join(ch for ch in search if ch not in ",()*")
        if clean:
            pattern = f"*{clean}*"
            q = q.or_(
                f"farmer_name.ilike.{pattern},crop.ilike.{pattern},location.ilike.{pattern}"
            )

    sort_col = sort if sort in LISTING_SORT_COLUMNS else "created_at"
    descending = str(order).lower() != "asc"
    limit = max(1, limit)
    res = q.order(sort_col, desc=descending).range(offset, offset + limit - 1).execute()

    return {"total": res.count, "listings": res.data or []}


def insert_listing(listing: dict) -> Optional[dict]:
    sb = _client()
    if not sb:
        return None
    res = sb.table("marketplace_listings").insert(listing).execute()
    rows = res.data or []
    return rows[0] if rows else listing


def compute_credits(carbon_tonnes: float, biodiversity_score: float) -> dict:
    carbon = round(float(carbon_tonnes or 0), 2)
    bio = round(float(biodiversity_score or 0) / 40.0, 2)
    return {
        "carbon_credits": carbon,
        "biodiversity_credits": bio,
        "total_credits": round(carbon + bio, 2),
    }


def get_land_registry(survey_number: str) -> Optional[dict]:
    sb = _client()
    if not sb:
        return None
    try:
        res = (
            sb.table("land_registry")
            .select("*")
            .ilike("survey_number", survey_number.strip())
            .limit(1)
            .execute()
        )
    except Exception as exc:
        msg = str(exc)
        if "permission denied" in msg.lower() or "42501" in msg:
            raise PermissionError(
                "permission denied for table land_registry. "
                "Run: GRANT SELECT ON public.land_registry TO service_role;"
            ) from exc
        raise
    rows = res.data or []
    return rows[0] if rows else None


def get_farm(farm_id: str) -> Optional[dict]:
    sb = _client()
    if not sb:
        return None
    res = sb.table("farms").select("*").eq("id", farm_id).limit(1).execute()
    rows = res.data or []
    return rows[0] if rows else None


def list_fpos() -> list:
    sb = _client()
    if not sb:
        return []
    try:
        res = sb.table("fpos").select("id,name,registration_no,created_at").order("name").execute()
        return res.data or []
    except Exception as exc:
        print(f"list_fpos failed: {exc}")
        return []


def list_farms_by_status(status: str, owner_phones: Optional[list] = None) -> list:
    sb = _client()
    if not sb:
        return []
    q = sb.table("farms").select("*").eq("status", status).order("created_at", desc=True)
    if owner_phones:
        q = q.in_("owner_phone", owner_phones)
    res = q.execute()
    return res.data or []


def list_profiles_by_fpo(fpo_id: str) -> list:
    sb = _client()
    if not sb:
        return []
    res = sb.table("profiles").select("*").eq("fpo_id", fpo_id).execute()
    return res.data or []


def farm_geojsons_except(owner_phone: str) -> list:
    sb = _client()
    if not sb:
        return []
    res = sb.table("farms").select("id,geojson,owner_phone").neq("owner_phone", owner_phone).execute()
    return [row.get("geojson") for row in (res.data or []) if row.get("geojson")]


def insert_farm_safe(farm: dict) -> Optional[dict]:
    """Insert a farm, dropping unknown columns (badge) if the DB rejects them."""
    saved = insert_farm(farm)
    if saved:
        return saved
    stripped = {k: v for k, v in farm.items() if k != "badge"}
    if stripped != farm:
        return insert_farm(stripped)
    return None
