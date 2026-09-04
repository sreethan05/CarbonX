from pathlib import Path

from dotenv import load_dotenv

APP_DIR = Path(__file__).resolve().parent
BACKEND_DIR = APP_DIR.parent
ROOT_DIR = BACKEND_DIR.parent

load_dotenv(ROOT_DIR / ".env", override=True)
load_dotenv(BACKEND_DIR / ".env", override=True)

from fastapi import FastAPI, Header, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta, timezone
import os

from app.security import create_access_token, decode_token
from app.phone_service import generate_otp, send_phone_otp
from app import supabase_db as db

app = FastAPI(title="CarbonX API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    _require_database()
    expires = datetime.now(timezone.utc) + timedelta(minutes=10)
    db.store_otp(phone, otp, expires)


def _verify_otp(phone: str, otp: str) -> bool:
    _require_database()
    return db.verify_otp_db(phone, otp)


def _clear_otp(phone: str):
    if db.is_ready():
        db.clear_otp(phone)


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
    preferred_language: Optional[str] = "en"


class LoginOtpModel(BaseModel):
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
    preferred_language: Optional[str] = None


class CreateListingModel(BaseModel):
    carbon_credits: float
    biodiversity_credits: float
    price_per_credit: float = 520
    farm_id: Optional[str] = None
    crop: Optional[str] = ""
    token_id: Optional[str] = None
    tx_hash: Optional[str] = None


def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload


def _user_response(user: dict, phone: str):
    return {
        "phone": phone,
        "name": user.get("name", ""),
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
        "version": "4.0",
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


@app.post("/register")
def register(data: RegisterModel):
    try:
        phone = data.phone.strip().replace(" ", "")
        if not _verify_otp(phone, data.otp):
            return {"success": False, "message": "Invalid or expired OTP"}
        existing = _get_user(phone)
        lang = (data.preferred_language or "en")[:2]
        if existing:
            db.update_profile(phone, {
                "name": data.name or existing.get("name"),
                "state": data.state,
                "district": data.district,
                "village": data.village,
                "upi": data.upi,
                "aadhaar_last4": data.aadhaar[-4:],
                "preferred_language": lang,
            })
            user = _get_user(phone)
            token = create_access_token({"phone": phone, "name": user.get("name", "")})
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
            "role": "farmer",
        }
        _save_user(user)
        token = create_access_token({"phone": phone, "name": data.name})
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
        token = create_access_token({"phone": phone, "name": user.get("name", "")})
        return {"success": True, "token": token, "user": _user_response(user, phone)}
    except HTTPException:
        raise
    except Exception as e:
        return {"success": False, "message": str(e)}


@app.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    phone = current_user.get("phone")
    user = _get_user(phone)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    farms = _get_user_farms(phone)
    return {"success": True, "user": _user_response(user, phone), "farms": farms}


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
        record = {
            "owner_phone": phone,
            "name": farm.get("name", "My Farm"),
            "crop_type": farm.get("crop_type", "Mixed Crop"),
            "irrigation": farm.get("irrigation", "Drip"),
            "geojson": geojson,
            "area_hectares": area_hectares,
            "ndvi": farm.get("ndvi", 0),
            "evi": farm.get("evi", 0),
            "carbon_tonnes": carbon,
            "biodiversity_score": bio_score,
            "biodiversity_credits": credits["biodiversity_credits"],
            "total_credits": credits["total_credits"],
            "tree_cover": farm.get("tree_cover", 0),
            "soil_moisture": farm.get("soil_moisture", 0),
            "vegetation_health": farm.get("vegetation_health", ""),
            "ai_confidence": farm.get("ai_confidence", 0),
            "satellite_source": farm.get("satellite_source", ""),
            "status": farm.get("status", "Verified"),
            "token_id": farm.get("token_id"),
        }
        saved = db.insert_farm(record)
        if not saved or not saved.get("id"):
            return {"success": False, "message": "Failed to save farm to database"}
        return {"success": True, "message": "Farm saved", "farm": saved}
    except HTTPException:
        raise
    except Exception as e:
        return {"success": False, "message": str(e)}


@app.get("/marketplace/listings")
def marketplace_listings():
    try:
        _require_database()
        return {"success": True, "listings": db.get_listings()}
    except HTTPException:
        raise
    except Exception as e:
        return {"success": False, "message": str(e), "listings": []}


@app.post("/marketplace/listings")
def create_listing(data: CreateListingModel, current_user: dict = Depends(get_current_user)):
    try:
        _require_database()
        phone = current_user.get("phone")
        user = _get_user(phone)
        if not user:
            return {"success": False, "message": "User not found"}
        total = round(float(data.carbon_credits) + float(data.biodiversity_credits), 2)
        listing = {
            "farmer_phone": phone,
            "farmer_name": user.get("name", "Farmer"),
            "location": f"{user.get('village', '')}, {user.get('district', '')}".strip(", "),
            "crop": data.crop or "Mixed Crop",
            "size_label": "",
            "carbon_credits": data.carbon_credits,
            "biodiversity_credits": data.biodiversity_credits,
            "total_credits": total,
            "price_per_credit": data.price_per_credit,
            "current_bid": data.price_per_credit * total,
            "bids_count": 0,
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


@app.post("/marketplace/listings/{listing_id}/bid")
def place_bid(listing_id: str, current_user: dict = Depends(get_current_user)):
    try:
        _require_database()
        db.increment_listing_bids(listing_id)
        return {"success": True, "message": "Bid recorded"}
    except Exception as e:
        return {"success": False, "message": str(e)}


@app.post("/predict")
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
