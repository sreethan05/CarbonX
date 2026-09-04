import os
from datetime import datetime, timezone
from typing import Optional

_supabase = None
_ready = False


def _client():
    global _supabase, _ready
    if _supabase is not None:
        return _supabase
    url = os.getenv("SUPABASE_URL", "").strip() or os.getenv("VITE_SUPABASE_URL", "").strip()
    key = (
        os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()
        or os.getenv("SUPABASE_ANON_KEY", "").strip()
        or os.getenv("VITE_SUPABASE_ANON_KEY", "").strip()
    )
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


def is_ready() -> bool:
    return _client() is not None


def health_check() -> dict:
    sb = _client()
    if not sb:
        return {"ready": False, "tables": {}, "message": "Supabase client is not configured"}
    tables = {}
    for table in ("profiles", "farms", "marketplace_listings", "otp_codes"):
        try:
            sb.table(table).select("*").limit(1).execute()
            tables[table] = True
        except Exception as e:
            tables[table] = False
            print(f"Supabase health check failed for {table}: {e}")
    return {"ready": all(tables.values()), "tables": tables}


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


def insert_listing(listing: dict) -> Optional[dict]:
    sb = _client()
    if not sb:
        return None
    res = sb.table("marketplace_listings").insert(listing).execute()
    rows = res.data or []
    return rows[0] if rows else listing


def increment_listing_bids(listing_id: str) -> bool:
    sb = _client()
    if not sb:
        return False
    res = sb.table("marketplace_listings").select("bids_count").eq("id", listing_id).limit(1).execute()
    rows = res.data or []
    if not rows:
        return False
    count = (rows[0].get("bids_count") or 0) + 1
    sb.table("marketplace_listings").update({"bids_count": count}).eq("id", listing_id).execute()
    return True


def compute_credits(carbon_tonnes: float, biodiversity_score: float) -> dict:
    carbon = round(float(carbon_tonnes or 0), 2)
    bio = round(float(biodiversity_score or 0) / 40.0, 2)
    return {
        "carbon_credits": carbon,
        "biodiversity_credits": bio,
        "total_credits": round(carbon + bio, 2),
    }
