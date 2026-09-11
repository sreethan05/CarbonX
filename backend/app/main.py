from pathlib import Path

from dotenv import load_dotenv

APP_DIR = Path(__file__).resolve().parent
BACKEND_DIR = APP_DIR.parent
ROOT_DIR = BACKEND_DIR.parent

load_dotenv(ROOT_DIR / ".env", override=True)
load_dotenv(BACKEND_DIR / ".env", override=True)

from fastapi import FastAPI, File, Header, HTTPException, Depends, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta, timezone
import os

from app.security import create_access_token, decode_token
from app.phone_service import generate_otp, send_phone_otp
from app import supabase_db as db
from app import redis_store
from app import sample_data
from app.services.kyc_service import analyse_document, validate_aadhaar

app = FastAPI(title="CarbonX API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

earth_engine_ready = False
try:
    import ee
    ee.Initialize(project=os.getenv("GEE_PROJECT", "carbonsetu-496709"))
    earth_engine_ready = True
    print("Earth Engine initialized")
except Exception as e:
    print(f"Earth Engine not available: {e}")


def _twilio_ready() -> bool:
    return all(
        os.getenv(k, "").strip()
        for k in ("TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_PHONE_NUMBER")
    )


def _require_database():
    if not db.is_ready():
        raise HTTPException(
            status_code=503,
            detail="Database is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env.",
        )


def _get_user(phone: str):
    _require_database()
    return db.get_profile(phone)


def _save_user(user: dict):
    _require_database()
    db.upsert_profile(user)


def _get_user_farms(phone: str):
    _require_database()
    return db.get_farms(phone)


def _save_farm(farm: dict):
    _require_database()
    return db.insert_farm(farm)


def _store_otp(phone: str, otp: str):
    redis_store.store_otp(phone, otp)


def _verify_otp(phone: str, otp: str) -> bool:
    return redis_store.verify_otp(phone, otp)


def _clear_otp(phone: str):
    redis_store.clear_otp(phone)


def _polygon_area_hectares(geojson: dict) -> float:
    import math

    geometry = geojson.get("geometry", {})
    if geometry.get("type") != "Polygon":
        raise ValueError("GeoJSON must be a Polygon")
    rings = geometry.get("coordinates") or []
    ring = rings[0] if rings else []
    if len(ring) < 4:
        raise ValueError("Polygon must have at least 3 points")
    if ring[0] != ring[-1]:
        ring = [*ring, ring[0]]
    lat_mid = sum(float(point[1]) for point in ring[:-1]) / (len(ring) - 1)
    meters_per_degree_lng = 111320 * math.cos(math.radians(lat_mid))
    meters_per_degree_lat = 110540
    area_m2 = 0
    projected = [
        (float(lng) * meters_per_degree_lng, float(lat) * meters_per_degree_lat)
        for lng, lat in ring
    ]
    for i in range(len(projected) - 1):
        x1, y1 = projected[i]
        x2, y2 = projected[i + 1]
        area_m2 += x1 * y2 - x2 * y1
    return round(abs(area_m2) / 20000, 2)


class SendOtpModel(BaseModel):
    phone: str


class RegisterModel(BaseModel):
    phone: str
    otp: str
    name: str
    aadhaar: str
    state: str
    district: str
    village: str
    upi: str
    role: Optional[str] = "farmer"
    preferred_language: Optional[str] = "en"
    otp_verification_token: Optional[str] = ""


class LoginOtpModel(BaseModel):
    phone: str
    otp: str


class RegistrationOtpVerifyModel(BaseModel):
    phone: str
    otp: str


class AnalyzeModel(BaseModel):
    geojson: dict
    farm_name: Optional[str] = "My Farm"
    crop_type: Optional[str] = "Mixed Crop"
    irrigation: Optional[str] = "Drip"


class SaveFarmModel(BaseModel):
    farm: dict


class UpdateProfileModel(BaseModel):
    name: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    village: Optional[str] = None
    upi: Optional[str] = None
    role: Optional[str] = None
    preferred_language: Optional[str] = None


class CreateListingModel(BaseModel):
    carbon_credits: Optional[float] = None
    biodiversity_credits: Optional[float] = None
    credits: Optional[float] = None
    price_per_credit: float = 520
    farm_id: Optional[str] = None
    crop: Optional[str] = ""
    token_id: Optional[str] = None
    tx_hash: Optional[str] = None


class LandVerificationModel(BaseModel):
    document_name: Optional[str] = "document.png"
    document_content_base64: Optional[str] = ""
    extracted_text: Optional[str] = ""
    survey_number: Optional[str] = ""
    village: Optional[str] = ""
    district: Optional[str] = ""
    area_acres: Optional[float] = None
    area_hectares: Optional[float] = None
    path: Optional[str] = None
    fpo_id: Optional[str] = None
    farm_id: Optional[str] = None
    geojson: Optional[dict] = None
    aadhaar: Optional[str] = None
    confirm_polygon: Optional[bool] = False


class AutoDrawModel(BaseModel):
    survey_number: Optional[str] = None
    village: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    area_hectares: Optional[float] = None


class CheckFarmlandModel(BaseModel):
    geojson: dict


class FpoReviewModel(BaseModel):
    action: str
    notes: Optional[str] = ""


def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload


def require_role(*allowed_roles):
    """Dependency factory: only allow users with one of the specified roles."""
    def _check(current_user: dict = Depends(get_current_user)):
        role = current_user.get("role", "farmer")
        if role not in allowed_roles:
            raise HTTPException(status_code=403, detail=f"Access denied. Required role: {', '.join(allowed_roles)}")
        return current_user
    return _check


def _user_response(user: dict, phone: str):
    return {
        "phone": phone,
        "name": user.get("name", ""),
        "role": user.get("role", "farmer"),
        "state": user.get("state", ""),
        "district": user.get("district", ""),
        "village": user.get("village", ""),
        "upi": user.get("upi", ""),
        "aadhaar_last4": user.get("aadhaar_last4") or user.get("aadhaar", ""),
        "preferred_language": user.get("preferred_language", "en"),
    }


def _send_otp_flow(phone: str):
    otp = generate_otp()
    _store_otp(phone, otp)
    sms_sent = send_phone_otp(phone, otp)
    response = {"success": True, "message": "OTP sent to your phone via SMS" if sms_sent else "OTP generated (dev mode)"}
    if not sms_sent:
        response["dev_otp"] = otp
    return response


@app.get("/")
def root():
    return {
        "message": "CarbonX API running",
        "version": "5.0",
        "supabase": db.is_ready(),
        "twilio": _twilio_ready(),
        "earth_engine": earth_engine_ready,
    }


@app.get("/health")
def health():
    database = db.health_check()
    return {
        "success": database["ready"],
        "database": database,
        "twilio": {"ready": _twilio_ready(), "provider": "Twilio"},
        "earth_engine": {"ready": earth_engine_ready},
    }


@app.post("/send-otp")
def send_otp(data: SendOtpModel):
    try:
        phone = data.phone.strip().replace(" ", "")
        if len(phone) != 10 or not phone.isdigit():
            return {"success": False, "message": "Enter a valid 10-digit phone number"}
        return _send_otp_flow(phone)
    except HTTPException:
        raise
    except Exception as e:
        return {"success": False, "message": str(e)}


@app.post("/register/verify-otp")
def verify_registration_otp(data: RegistrationOtpVerifyModel):
    try:
        phone = data.phone.strip().replace(" ", "")
        otp = data.otp.strip()
        if len(phone) != 10 or not phone.isdigit():
            return {"success": False, "message": "Enter a valid 10-digit phone number"}
        if len(otp) != 6 or not otp.isdigit():
            return {"success": False, "message": "Enter the complete 6-digit OTP"}
        if not _verify_otp(phone, otp):
            return {"success": False, "message": "Invalid or expired OTP"}

        verification_token = create_access_token(
            {
                "phone": phone,
                "purpose": "registration_otp_verified",
            },
            expires_delta=timedelta(minutes=30),
        )
        return {
            "success": True,
            "message": "OTP verified",
            "verification_token": verification_token,
        }
    except HTTPException:
        raise
    except Exception as e:
        return {"success": False, "message": str(e)}


@app.post("/register")
def register(data: RegisterModel):
    try:
        phone = data.phone.strip().replace(" ", "")
        if not validate_aadhaar(data.aadhaar):
            return {"success": False, "message": "Enter a valid 12-digit Aadhaar number"}
        token_payload = decode_token(data.otp_verification_token) if data.otp_verification_token else None
        token_verified = bool(
            token_payload
            and token_payload.get("purpose") == "registration_otp_verified"
            and token_payload.get("phone") == phone
        )
        if not token_verified and not _verify_otp(phone, data.otp):
            return {"success": False, "message": "Invalid or expired OTP"}
        existing = _get_user(phone)
        lang = (data.preferred_language or "en")[:2]
        role = data.role or "farmer"
        if existing:
            db.update_profile(phone, {
                "name": data.name or existing.get("name"),
                "state": data.state,
                "district": data.district,
                "village": data.village,
                "upi": data.upi,
                "aadhaar_last4": data.aadhaar[-4:],
                "preferred_language": lang,
                "role": role,
            })
            user = _get_user(phone)
            token = create_access_token({"phone": phone, "name": user.get("name", ""), "role": user.get("role", "farmer")})
            return {
                "success": True,
                "message": "Profile updated, logged in",
                "token": token,
                "user": _user_response(user, phone),
            }
        user = {
            "phone": phone,
            "name": data.name,
            "aadhaar_last4": data.aadhaar[-4:],
            "state": data.state,
            "district": data.district,
            "village": data.village,
            "upi": data.upi,
            "preferred_language": lang,
            "role": role,
        }
        _save_user(user)
        token = create_access_token({"phone": phone, "name": data.name, "role": role})
        return {
            "success": True,
            "message": "Registration successful",
            "token": token,
            "user": _user_response(user, phone),
        }
    except HTTPException:
        raise
    except Exception as e:
        return {"success": False, "message": str(e)}


@app.post("/login/send-otp")
def login_send_otp(data: SendOtpModel):
    try:
        phone = data.phone.strip().replace(" ", "")
        existing = _get_user(phone)
        if not existing:
            return {"success": False, "message": "Phone not registered. Please sign up first."}
        result = _send_otp_flow(phone)
        if result.get("success"):
            result["message"] = "OTP sent"
        return result
    except HTTPException:
        raise
    except Exception as e:
        return {"success": False, "message": str(e)}


@app.post("/login")
def login(data: LoginOtpModel):
    try:
        phone = data.phone.strip().replace(" ", "")
        if not _verify_otp(phone, data.otp):
            return {"success": False, "message": "Invalid or expired OTP"}
        user = _get_user(phone)
        if not user:
            return {"success": False, "message": "Phone not registered"}
        token = create_access_token({"phone": phone, "name": user.get("name", ""), "role": user.get("role", "farmer")})
        return {"success": True, "token": token, "user": _user_response(user, phone)}
    except HTTPException:
        raise
    except Exception as e:
        return {"success": False, "message": str(e)}


def _claimed_area_ha(data: LandVerificationModel) -> Optional[float]:
    if data.area_hectares is not None:
        return float(data.area_hectares)
    if data.area_acres is not None:
        return round(float(data.area_acres) * 0.404686, 4)
    return None


def _patch_farm(farm_id: Optional[str], fields: dict):
    if not farm_id:
        return None
    try:
        return db.update_farm(farm_id, fields)
    except Exception:
        fields.pop("badge", None)
        try:
            return db.update_farm(farm_id, fields)
        except Exception as exc:
            print(f"farm patch failed: {exc}")
            return None


@app.get("/land/registry/{survey}")
def land_registry_lookup(survey: str, current_user: dict = Depends(get_current_user)):
    """Look up a survey number in the Supabase land_registry mock table."""
    from app.services.registry_service import lookup_survey

    _require_database()
    result = lookup_survey(survey)
    if result.get("error") == "permission_denied":
        raise HTTPException(status_code=503, detail=result["message"])
    return {"success": True, **result}


@app.post("/auto-draw")
def auto_draw_polygon(data: AutoDrawModel, current_user: dict = Depends(get_current_user)):
    """Return a locked registry polygon (1A) or an approximate village square (1B/2)."""
    from app.services.geocoding_service import geocode_village
    from app.services.polygon_service import approximate_square
    from app.services.registry_service import lookup_survey

    _require_database()
    locked = False
    geojson = None
    source = None
    registry = None
    if data.survey_number:
        registry = lookup_survey(data.survey_number)
        if registry.get("error") == "permission_denied":
            raise HTTPException(status_code=503, detail=registry["message"])
        if registry.get("geojson"):
            geojson = registry["geojson"]
            locked = True
            source = "registry"
    if geojson is None:
        phone = current_user.get("phone")
        profile = _get_user(phone) or {}
        village = data.village or profile.get("village", "")
        district = data.district or profile.get("district", "")
        state = data.state or profile.get("state", "")
        geo = geocode_village(village, district, state)
        if not geo:
            return {"success": False, "message": "Could not geocode village for an approximate polygon"}
        area = data.area_hectares or (registry or {}).get("area_ha") or 1.0
        geojson = approximate_square(geo["lat"], geo["lon"], area)
        source = "approximate"
        locked = False
    return {
        "success": True,
        "locked": locked,
        "source": source,
        "geojson": geojson,
        "registry": registry,
    }


@app.post("/check-farmland")
def check_farmland(data: CheckFarmlandModel, current_user: dict = Depends(get_current_user)):
    """NDVI farmland check for a drawn/auto polygon."""
    from app.services.gee_service import get_ndvi_at_point
    from app.services.polygon_service import ring_from_geojson, polygon_area_hectares
    from app.services.fraud_engine import NDVI_FARMLAND_MIN

    ring = ring_from_geojson(data.geojson)
    if len(ring) < 3:
        raise HTTPException(status_code=400, detail="Valid polygon GeoJSON is required")
    lat = sum(float(p[1]) for p in ring[:-1]) / (len(ring) - 1)
    lon = sum(float(p[0]) for p in ring[:-1]) / (len(ring) - 1)
    ndvi = get_ndvi_at_point(lat, lon)
    value = float(ndvi.get("ndvi") or 0)
    return {
        "success": True,
        "is_farmland": value >= NDVI_FARMLAND_MIN,
        "ndvi": ndvi,
        "area_hectares": polygon_area_hectares(data.geojson),
        "centroid": {"lat": lat, "lon": lon},
    }


@app.post("/verify-land")
def verify_land_document(data: LandVerificationModel, current_user: dict = Depends(get_current_user)):
    """Run the trust engine. Backend assigns tier, badge, status, and eligibility."""
    try:
        from app.services.fraud_engine import run_fraud_checks
        from app.services.registry_service import lookup_survey
        from app.services.trust_engine import apply_fraud, decide_tier

        _require_database()
        phone = current_user.get("phone")
        profile = _get_user(phone)
        if not profile:
            raise HTTPException(status_code=404, detail="User not found")
        village = data.village or profile.get("village", "")
        district = data.district or profile.get("district", "")
        state = profile.get("state", "")
        fpo_path = (data.path or "").lower() == "fpo"
        claimed_ha = _claimed_area_ha(data)

        if fpo_path:
            if data.fpo_id:
                db.update_profile(phone, {"fpo_id": data.fpo_id})
            trust = apply_fraud(decide_tier(fpo_path=True), {"status": "PENDING", "risk": "LOW", "failed_checks": []})
            record = {
                "owner_phone": phone,
                "status": "PENDING",
                "reasons": ["Awaiting FPO confirmation"],
                "checks": {"path": "fpo", "fpo_id": data.fpo_id},
                "extracted_fields": {
                    "path": "fpo",
                    "fpo_id": data.fpo_id,
                    "farm_id": data.farm_id,
                    **trust,
                },
                "document_name": (data.document_name or "fpo-path")[:255],
                "document_sha256": "fpo-path",
                "perceptual_hash": None,
            }
            saved = db.insert_kyc_verification(record)
            _patch_farm(data.farm_id, {"status": "PENDING"})
            return {"success": True, **trust, "verification": saved, "checks": record["checks"], "reasons": record["reasons"]}

        checks = analyse_document(
            data.document_content_base64,
            data.document_name,
            profile.get("name", ""),
            data.extracted_text or "",
            db.get_document_hashes(),
            village=village,
            district=district,
            state=state,
        )
        registry = lookup_survey(data.survey_number) if data.survey_number else {"found": False}
        if registry.get("error") == "permission_denied":
            registry = {"found": False, "survey_number": data.survey_number, "message": registry.get("message")}

        ocr_text = f"{checks.get('ocr_text_preview') or ''} {data.extracted_text or ''}"
        decision = decide_tier(
            fpo_path=False,
            survey_number=data.survey_number or "",
            registry=registry,
            owner_name=profile.get("name", ""),
            ocr_owner=ocr_text,
            claimed_area_ha=claimed_ha or registry.get("area_ha"),
        )
        fraud = run_fraud_checks(
            aadhaar=data.aadhaar or profile.get("aadhaar_last4") or "",
            checks=checks,
            owner_name=profile.get("name", ""),
            ocr_text=ocr_text,
            village=village,
            geojson=data.geojson,
            other_farm_geojsons=db.farm_geojsons_except(phone) if data.geojson else [],
            claimed_area_ha=claimed_ha or registry.get("area_ha"),
        )
        trust = apply_fraud(decision, fraud)
        reasons = list(trust["failed_checks"])
        record = {
            "owner_phone": phone,
            "status": trust["status"],
            "reasons": reasons,
            "checks": {**checks, "registry": registry, "fraud": fraud, "trust": trust},
            "extracted_fields": {
                "survey_number": data.survey_number,
                "village": village,
                "district": district,
                "area_acres": data.area_acres,
                "area_hectares": claimed_ha,
                "ocr_text_preview": checks.get("ocr_text_preview", ""),
                "geocoded_location": checks.get("geocoded_location"),
                "satellite_ndvi": checks.get("satellite_ndvi") or {},
                "farm_id": data.farm_id,
                "confirm_polygon": data.confirm_polygon,
                **trust,
            },
            "document_name": (data.document_name or "document")[:255],
            "document_sha256": checks["document_sha256"],
            "perceptual_hash": checks["perceptual_hash"] or None,
        }
        saved = db.insert_kyc_verification(record)
        farm_fields = {"status": trust["status"]}
        if trust.get("badge"):
            farm_fields["badge"] = trust["badge"]
        _patch_farm(data.farm_id, farm_fields)
        return {
            "success": True,
            **trust,
            "checks": checks,
            "reasons": reasons,
            "registry": registry,
            "fraud": fraud,
            "verification": saved,
        }
    except HTTPException:
        raise
    except ValueError as exc:
        return {"success": False, "message": str(exc)}
    except Exception as exc:
        return {"success": False, "message": str(exc)}


@app.get("/kyc/status/{phone}")
def get_kyc_status(phone: str, current_user: dict = Depends(get_current_user)):
    """Return the latest KYC verification record for a farmer."""
    try:
        _require_database()
        record = db.get_kyc_status(phone)
        if not record:
            return {"success": True, "status": "PENDING", "message": "No KYC verification found."}
        extracted = record.get("extracted_fields") or {}
        return {
            "success": True,
            "status": record.get("status"),
            "tier": extracted.get("tier"),
            "badge": extracted.get("badge"),
            "risk": extracted.get("risk"),
            "failed_checks": extracted.get("failed_checks") or record.get("reasons") or [],
            "marketplace_eligible": extracted.get("marketplace_eligible"),
            "credits_blocked": extracted.get("credits_blocked"),
            "verification": record,
        }
    except HTTPException:
        raise
    except Exception as exc:
        return {"success": False, "message": str(exc)}


@app.get("/fpos")
def list_fpos(current_user: dict = Depends(get_current_user)):
    _require_database()
    return {"success": True, "fpos": db.list_fpos()}


@app.get("/fpo/farms")
def fpo_farms(
    status: str = Query("PENDING"),
    current_user: dict = Depends(require_role("fpo", "verifier", "admin")),
):
    """Pending confirmations or flagged farms for FPO review."""
    _require_database()
    reviewer = _get_user(current_user.get("phone")) or {}
    fpo_id = reviewer.get("fpo_id")
    phones = None
    if fpo_id:
        phones = [p.get("phone") for p in db.list_profiles_by_fpo(fpo_id) if p.get("phone")]
    farms = db.list_farms_by_status(status, owner_phones=phones)
    return {"success": True, "status": status, "farms": farms}


@app.post("/fpo/confirm/{farm_id}")
def fpo_confirm_farm(farm_id: str, current_user: dict = Depends(require_role("fpo", "verifier", "admin"))):
    """Confirm a PENDING FPO-path farm. Badge becomes FPO; satellite scan can start."""
    from app.services.trust_engine import fpo_confirmed_result

    _require_database()
    farm = db.get_farm(farm_id)
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    trust = fpo_confirmed_result()
    updated = _patch_farm(farm_id, {"status": trust["status"], "badge": trust["badge"]})
    db.insert_kyc_verification({
        "owner_phone": farm.get("owner_phone"),
        "status": trust["status"],
        "reasons": [],
        "checks": {"reviewed_by": current_user.get("phone"), "action": "confirm"},
        "extracted_fields": {**trust, "farm_id": farm_id, "reviewed_by": current_user.get("phone")},
        "document_name": "fpo-confirm",
        "document_sha256": f"fpo-confirm-{farm_id}",
        "perceptual_hash": None,
    })
    return {"success": True, **trust, "farm": updated or farm}


@app.post("/fpo/review/{farm_id}")
def fpo_review_farm(
    farm_id: str,
    data: FpoReviewModel,
    current_user: dict = Depends(require_role("fpo", "verifier", "admin")),
):
    """Approve or reject a FLAGGED farm. Approve sets badge FPO."""
    from app.services.trust_engine import fpo_confirmed_result

    _require_database()
    farm = db.get_farm(farm_id)
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    action = (data.action or "").strip().lower()
    if action not in ("approve", "reject"):
        raise HTTPException(status_code=400, detail="action must be approve or reject")
    if action == "approve":
        trust = fpo_confirmed_result()
        status, badge = trust["status"], trust["badge"]
    else:
        trust = {
            "tier": None,
            "badge": None,
            "risk": "HIGH",
            "status": "FLAGGED",
            "failed_checks": ["fpo_rejected"],
            "marketplace_eligible": False,
            "credits_blocked": True,
        }
        status, badge = "FLAGGED", None
    fields = {"status": status}
    if badge:
        fields["badge"] = badge
    updated = _patch_farm(farm_id, fields)
    db.insert_kyc_verification({
        "owner_phone": farm.get("owner_phone"),
        "status": status,
        "reasons": [data.notes] if data.notes else [],
        "checks": {"reviewed_by": current_user.get("phone"), "action": action},
        "extracted_fields": {**trust, "farm_id": farm_id, "reviewed_by": current_user.get("phone"), "notes": data.notes},
        "document_name": f"fpo-review-{action}",
        "document_sha256": f"fpo-review-{action}-{farm_id}",
        "perceptual_hash": None,
    })
    return {"success": True, **trust, "action": action, "farm": updated or farm}


@app.post("/documents/analyze")
def analyze_document_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """Extract text from an uploaded document image via Azure Document Intelligence.

    Uses the ``prebuilt-layout`` model (see app/services/document_intelligence_service.py).
    Requires a logged-in user (Bearer token). Accepts an image (jpeg/png/webp/...)
    or PDF and returns the extracted text as JSON. If Azure cannot be reached,
    returns the retry-or-send-to-FPO fallback payload.
    """
    from app.services.document_intelligence_service import (
        analyze_document_bytes,
        azure_unavailable_response,
        validate_upload,
    )

    try:
        file_bytes = file.file.read()
    finally:
        file.file.close()
    filename = file.filename
    content_type = file.content_type

    try:
        validate_upload(content_type, file_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    try:
        return analyze_document_bytes(file_bytes, filename=filename)
    except RuntimeError as exc:
        msg = str(exc)
        if "not configured" in msg or "not installed" in msg:
            raise HTTPException(status_code=503, detail=msg)
        return azure_unavailable_response(msg)


@app.post("/documents/parse-pahani")
def parse_pahani_document(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """OCR a Pahani (Adangal) record and return structured fields as JSON.

    Runs Azure Document Intelligence, filters out Telugu-script content, and
    extracts layout-aware fields (survey no, pattadar, extents, coords, ...).
    Fields absent from the image come back as null and are listed in
    ``missing_fields``. Requires a logged-in user (Bearer token). If Azure
    cannot be reached, returns the retry-or-send-to-FPO fallback payload.
    """
    from app.services.document_intelligence_service import (
        analyze_document_bytes,
        azure_unavailable_response,
        validate_upload,
    )
    from app.services.pahani_parser import parse_pahani

    try:
        file_bytes = file.file.read()
    finally:
        file.file.close()

    try:
        validate_upload(file.content_type, file_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    try:
        azure_result = analyze_document_bytes(file_bytes, filename=file.filename)
    except RuntimeError as exc:
        msg = str(exc)
        if "not configured" in msg or "not installed" in msg:
            raise HTTPException(status_code=503, detail=msg)
        return azure_unavailable_response(msg)

    parsed = parse_pahani(azure_result)
    return {
        "success": True,
        "model": azure_result.get("model"),
        "filename": file.filename,
        "fields": parsed["fields"],
        "missing_fields": parsed["missing_fields"],
        "english_text": parsed["english_text"],
    }


@app.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    phone = current_user.get("phone")
    user = _get_user(phone)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    farms = _get_user_farms(phone)
    kyc = db.get_kyc_status(phone) if db.is_ready() else None
    return {"success": True, "user": _user_response(user, phone), "farms": farms, "kyc": kyc}


@app.patch("/profile")
def update_profile(data: UpdateProfileModel, current_user: dict = Depends(get_current_user)):
    try:
        phone = current_user.get("phone")
        fields = {k: v for k, v in data.model_dump().items() if v is not None}
        if not fields:
            return {"success": False, "message": "No fields to update"}
        if "preferred_language" in fields:
            fields["preferred_language"] = fields["preferred_language"][:2]
        updated = db.update_profile(phone, fields)
        if not updated:
            return {"success": False, "message": "Profile update failed"}
        return {"success": True, "user": _user_response(updated, phone)}
    except Exception as e:
        return {"success": False, "message": str(e)}


@app.post("/analyze")
def analyze(data: AnalyzeModel):
    try:
        geojson = data.geojson
        if not geojson:
            return {"success": False, "message": "GeoJSON polygon missing"}

        if earth_engine_ready:
            import ee
            coordinates = geojson["geometry"]["coordinates"]
            polygon = ee.Geometry.Polygon(coordinates)
            collection = (
                ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
                .filterBounds(polygon)
                .filterDate("2024-01-01", "2025-12-31")
                .sort("CLOUDY_PIXEL_PERCENTAGE")
            )
            image = collection.first()
            ndvi = image.normalizedDifference(["B8", "B4"]).rename("NDVI")
            ndvi_value = ndvi.reduceRegion(
                reducer=ee.Reducer.mean(), geometry=polygon, scale=10, maxPixels=1e13,
            ).get("NDVI").getInfo()
            evi = image.expression(
                "2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))",
                {"NIR": image.select("B8"), "RED": image.select("B4"), "BLUE": image.select("B2")},
            )
            evi_value = evi.reduceRegion(
                reducer=ee.Reducer.mean(), geometry=polygon, scale=10, maxPixels=1e13,
            ).values().get(0).getInfo()
            area_hectares = round(polygon.area().getInfo() / 10000, 2)
            try:
                from app.services.ml_service import predict_biodiversity
                ml_result = predict_biodiversity(ndvi=ndvi_value, evi=evi_value, area_ha=area_hectares)
                biodiversity_score = ml_result["biodiversity_score"]
            except Exception:
                biodiversity_score = round(min(max(ndvi_value * 100, 30), 98), 1)
            satellite_source = "Google Earth Engine · Sentinel-2 SR"
        else:
            coords = geojson.get("geometry", {}).get("coordinates", [[]])
            area_hectares = _polygon_area_hectares(geojson)
            seed = hash(str(coords)) % 1000
            ndvi_value = round(0.45 + (seed % 40) / 100.0, 3)
            evi_value = round(ndvi_value * 0.85, 3)
            try:
                from app.services.ml_service import predict_biodiversity
                ml_result = predict_biodiversity(ndvi=ndvi_value, evi=evi_value, area_ha=area_hectares)
                biodiversity_score = ml_result["biodiversity_score"]
            except Exception:
                biodiversity_score = round(min(max(ndvi_value * 110, 40), 95), 1)
            satellite_source = "Estimated (GEE offline)"

        tree_cover = round(min(max(ndvi_value * 100, 0), 100), 2)
        soil_moisture = round(min(max(evi_value * 25, 0), 100), 2)
        carbon_tonnes = round(area_hectares * tree_cover * 0.12, 2)
        credits = db.compute_credits(carbon_tonnes, biodiversity_score)
        veg_health = (
            "Excellent" if ndvi_value >= 0.7 else "Good" if ndvi_value >= 0.5
            else "Moderate" if ndvi_value >= 0.3 else "Low"
        )
        return {
            "success": True,
            "ndvi": round(ndvi_value, 3),
            "evi": round(evi_value, 3),
            "tree_cover": tree_cover,
            "soil_moisture": soil_moisture,
            "carbon_tonnes": carbon_tonnes,
            "carbon_credits": credits["carbon_credits"],
            "biodiversity_credits": credits["biodiversity_credits"],
            "total_credits": credits["total_credits"],
            "area_hectares": area_hectares,
            "vegetation_health": veg_health,
            "biodiversity_score": biodiversity_score,
            "ai_confidence": round(min(85 + ndvi_value * 20, 99.5), 1),
            "satellite_source": satellite_source,
        }
    except Exception as e:
        return {"success": False, "message": str(e)}


@app.post("/save-farm")
def save_farm(data: SaveFarmModel, current_user: dict = Depends(get_current_user)):
    try:
        phone = current_user.get("phone")
        farm = data.farm
        geojson = farm.get("geojson")
        if not geojson or not geojson.get("geometry"):
            return {"success": False, "message": "Farm boundary (GeoJSON) is required"}
        area_hectares = float(farm.get("area_hectares") or _polygon_area_hectares(geojson))
        carbon = float(farm.get("carbon_tonnes") or 0)
        bio_score = float(farm.get("biodiversity_score") or 0)
        credits = db.compute_credits(carbon, bio_score)
        path = (farm.get("path") or "").lower()
        fpo_path = path == "fpo"
        if fpo_path and farm.get("fpo_id"):
            db.update_profile(phone, {"fpo_id": farm.get("fpo_id")})
        latest = db.get_kyc_status(phone) if db.is_ready() else None
        extracted = (latest or {}).get("extracted_fields") or {}
        if fpo_path or extracted.get("path") == "fpo" and (latest or {}).get("status") == "PENDING":
            status = "PENDING"
            badge = None
            credits_blocked = True
        elif latest and latest.get("status") in ("FLAGGED", "PENDING", "VERIFIED"):
            status = latest.get("status")
            badge = extracted.get("badge")
            credits_blocked = bool(extracted.get("credits_blocked")) or status in ("PENDING", "FLAGGED")
        else:
            status = farm.get("status") or "Verified"
            badge = farm.get("badge")
            credits_blocked = status in ("PENDING", "FLAGGED")
        if credits_blocked:
            credits = {"carbon_credits": 0, "biodiversity_credits": 0, "total_credits": 0}
        record = {
            "owner_phone": phone,
            "name": farm.get("name", "My Farm"),
            "crop_type": farm.get("crop_type", "Mixed Crop"),
            "irrigation": farm.get("irrigation", "Drip"),
            "geojson": geojson,
            "area_hectares": area_hectares,
            "ndvi": farm.get("ndvi", 0),
            "evi": farm.get("evi", 0),
            "carbon_tonnes": 0 if credits_blocked else carbon,
            "biodiversity_score": bio_score,
            "biodiversity_credits": credits["biodiversity_credits"],
            "total_credits": credits["total_credits"],
            "tree_cover": farm.get("tree_cover", 0),
            "soil_moisture": farm.get("soil_moisture", 0),
            "vegetation_health": farm.get("vegetation_health", ""),
            "ai_confidence": farm.get("ai_confidence", 0),
            "satellite_source": farm.get("satellite_source", ""),
            "status": status,
            "token_id": farm.get("token_id"),
        }
        if badge:
            record["badge"] = badge
        saved = db.insert_farm_safe(record)
        if not saved or not saved.get("id"):
            return {"success": False, "message": "Failed to save farm to database"}
        return {
            "success": True,
            "message": "Farm saved",
            "farm": saved,
            "credits_blocked": credits_blocked,
            "badge": badge,
        }
    except HTTPException:
        raise
    except Exception as e:
        return {"success": False, "message": str(e)}


@app.get("/marketplace/listings")
def marketplace_listings(
    status: Optional[str] = Query(
        "Active",
        description="Filter by listing status. Use 'all' to return every status (Active, Sold, Expired, ...).",
    ),
    crop: Optional[str] = Query(None, description="Partial, case-insensitive match on crop, e.g. ?crop=rice"),
    location: Optional[str] = Query(None, description="Partial, case-insensitive match on location, e.g. ?location=khammam"),
    farmer_phone: Optional[str] = Query(None, description="Exact farmer phone, e.g. ?farmer_phone=9876543210"),
    farm_id: Optional[str] = Query(None, description="Exact farm UUID"),
    listing_model: Optional[str] = Query(None, description="Partial match on listing model, e.g. ?listing_model=fixed"),
    min_price: Optional[float] = Query(None, description="Minimum price_per_credit (inclusive)"),
    max_price: Optional[float] = Query(None, description="Maximum price_per_credit (inclusive)"),
    min_credits: Optional[float] = Query(None, description="Minimum total_credits (inclusive)"),
    max_credits: Optional[float] = Query(None, description="Maximum total_credits (inclusive)"),
    search: Optional[str] = Query(None, description="Free-text search across farmer_name, crop and location"),
    sort: str = Query(
        "created_at",
        description=f"Sort column. One of: {', '.join(sorted(db.LISTING_SORT_COLUMNS))}",
    ),
    order: str = Query("desc", pattern="^(asc|desc)$", description="Sort direction: asc or desc"),
    limit: int = Query(50, ge=1, le=200, description="Page size (max 200)"),
    offset: int = Query(0, ge=0, description="Page offset for pagination"),
):
    try:
        query_kwargs = {
            "status": status,
            "crop": crop,
            "location": location,
            "farmer_phone": farmer_phone,
            "farm_id": farm_id,
            "listing_model": listing_model,
            "min_price": min_price,
            "max_price": max_price,
            "min_credits": min_credits,
            "max_credits": max_credits,
            "search": search,
            "sort": sort,
            "order": order,
            "limit": limit,
            "offset": offset,
        }
        applied = {k: v for k, v in query_kwargs.items() if v is not None}

        result = None
        source = "live_db"
        if db.is_ready():
            try:
                result = db.get_listings_filtered(**query_kwargs)
            except Exception as e:
                print(f"[marketplace/listings] LIVE DB query failed ({e}) — serving FALLBACK sample data")
                result = None
        else:
            print("[marketplace/listings] LIVE DB not configured — serving FALLBACK sample data")
        if result is None:
            source = "fallback"
            result = sample_data.filter_listings(sample_data.FALLBACK_LISTINGS, **query_kwargs)

        print(
            f"[marketplace/listings] source={'LIVE DB' if source == 'live_db' else 'FALLBACK sample data'} "
            f"| matched={result['total']} | returned={len(result['listings'])} | filters={applied or 'default'}"
        )
        return {
            "success": True,
            "source": source,
            "total": result["total"],
            "count": len(result["listings"]),
            "filters": applied,
            "listings": result["listings"],
        }
    except Exception as e:
        return {"success": False, "message": str(e), "source": "error", "total": 0, "count": 0, "listings": []}


@app.post("/marketplace/listings")
def create_listing(data: CreateListingModel, current_user: dict = Depends(get_current_user)):
    try:
        _require_database()
        phone = current_user.get("phone")
        user = _get_user(phone)
        if not user:
            return {"success": False, "message": "User not found"}
        if data.farm_id:
            from app.services.trust_engine import farm_may_list

            farm = db.get_farm(data.farm_id)
            if farm and farm.get("owner_phone") != phone:
                return {"success": False, "message": "Farm does not belong to this user"}
            latest = db.get_kyc_status(phone)
            badge = ((latest or {}).get("extracted_fields") or {}).get("badge") or (farm or {}).get("badge")
            ok, reason = farm_may_list(farm, badge)
            if not ok:
                return {"success": False, "message": reason}
        c_credits = data.carbon_credits
        b_credits = data.biodiversity_credits
        if c_credits is None and b_credits is None and data.credits is not None:
            c_credits = round(float(data.credits) * 0.8, 2)
            b_credits = round(float(data.credits) * 0.2, 2)
        else:
            c_credits = float(c_credits or 0)
            b_credits = float(b_credits or 0)
        total = round(c_credits + b_credits, 2)
        listing = {
            "farmer_phone": phone,
            "farmer_name": user.get("name", "Farmer"),
            "location": f"{user.get('village', '')}, {user.get('district', '')}".strip(", "),
            "crop": data.crop or "Mixed Crop",
            "size_label": "",
            "carbon_credits": c_credits,
            "biodiversity_credits": b_credits,
            "total_credits": total,
            "price_per_credit": data.price_per_credit,
            "listing_model": "Fixed Price",
            "status": "Active",
            "farm_id": data.farm_id,
            "token_id": data.token_id,
            "tx_hash": data.tx_hash,
            "image_url": "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=400",
        }
        saved = db.insert_listing(listing)
        if not saved or not saved.get("id"):
            return {"success": False, "message": "Failed to save listing"}
        if data.farm_id and data.token_id:
            db.update_farm(data.farm_id, {"token_id": data.token_id})
        return {"success": True, "listing": saved}
    except HTTPException:
        raise
    except Exception as e:
        return {"success": False, "message": str(e)}


@app.api_route("/predict", methods=["GET", "POST"])
def predict(longitude: float, latitude: float):
    try:
        from app.services.ml_service import predict_biodiversity
        import math
        ndvi = round(0.5 + math.sin(longitude * 0.1) * 0.2 + math.cos(latitude * 0.1) * 0.15, 3)
        ndvi = min(max(ndvi, 0.1), 0.9)
        result = predict_biodiversity(ndvi=ndvi)
        credits = db.compute_credits(ndvi * 10, result["biodiversity_score"])
        return {
            "success": True,
            "location": {"longitude": longitude, "latitude": latitude},
            "biodiversity_score": result["biodiversity_score"],
            "status": result["status"],
            "biodiversity_credits": credits["biodiversity_credits"],
            "total_credits": credits["total_credits"],
        }
    except Exception as e:
        return {"success": False, "message": str(e)}
