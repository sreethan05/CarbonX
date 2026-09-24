"""Seed Tier 1/2/3 demo farmers for the land-verification flow.

Tier 1 (registry hit):  phone 9000000011 / Ramesh Kumar / Kazipet
    -> survey 101/A exists in land_registry (1A, geometry available).
Tier 2 (registry miss): phone 9000000012 / Lakshmi Narayana / Geesugonda
    -> survey 999/Z is NOT in the registry: upload Pahani + draw boundary.
Tier 3 (FPO review):    phone 9000000013 / Mallaiah Yadav / Sangem
    -> one PENDING farm (FPO confirm) + one FLAGGED farm (FPO review).

Idempotent: upserts profiles, recreates the tier demo farms.
Run:  C:\\CARBONXGEMZ\\CarbonX\\backend\\.venv\\Scripts\\python.exe scripts/seed_tier_demo.py
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from dotenv import load_dotenv

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(ROOT, ".env"), override=False)
load_dotenv(os.path.join(ROOT, "backend", ".env"), override=True)

from app.supabase_db import _client  # noqa: E402

TIER1_PHONE = "9000000011"
TIER2_PHONE = "9000000012"
TIER3_PHONE = "9000000013"


def poly(lng, lat, size=0.01):
    return {
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [lng, lat], [lng + size, lat], [lng + size, lat + size],
                [lng, lat + size], [lng, lat],
            ]],
        },
    }


def main():
    sb = _client()
    assert sb is not None, "Supabase not configured"

    # ── Profiles (upsert by phone) ──
    profiles = [
        {"phone": TIER1_PHONE, "name": "Ramesh Kumar", "role": "farmer",
         "state": "Telangana", "district": "Hanamkonda", "village": "Kazipet",
         "preferred_language": "en"},
        {"phone": TIER2_PHONE, "name": "Lakshmi Narayana", "role": "farmer",
         "state": "Telangana", "district": "Warangal", "village": "Geesugonda",
         "preferred_language": "en"},
        {"phone": TIER3_PHONE, "name": "Mallaiah Yadav", "role": "farmer",
         "state": "Telangana", "district": "Warangal", "village": "Sangem",
         "preferred_language": "en"},
    ]
    for p in profiles:
        sb.table("profiles").upsert(p, on_conflict="phone").execute()
    print(f"upserted {len(profiles)} tier profiles")

    # ── Clear old tier demo farms/kyc for these phones ──
    for phone in (TIER1_PHONE, TIER2_PHONE, TIER3_PHONE):
        sb.table("farms").delete().eq("owner_phone", phone).execute()
        sb.table("kyc_verifications").delete().eq("owner_phone", phone).execute()
    print("cleared old tier demo farms + kyc rows")

    # ── Tier 1: verified registry farm (101/A, area 3.87 ha) ──
    t1 = sb.table("farms").insert({
        "owner_phone": TIER1_PHONE,
        "name": "Survey 101/A — Registry Farm",
        "crop_type": "Paddy",
        "irrigation": "Canal",
        "geojson": poly(79.50, 17.90),
        "area_hectares": 3.87,
        "ndvi": 0.72, "evi": 0.58, "soil_moisture": 38.0, "tree_cover": 22.0,
        "vegetation_health": "Good", "satellite_source": "Google Earth Engine · Sentinel-2 SR",
        "ai_confidence": 94.0, "carbon_tonnes": 41.5,
        "biodiversity_score": 78.0, "biodiversity_credits": 9.6,
        "total_credits": 51.1,
        "status": "VERIFIED", "badge": "REGISTRY",
    }).execute().data[0]
    sb.table("kyc_verifications").insert({
        "owner_phone": TIER1_PHONE,
        "document_name": "registry-auto 101/A",
        "document_sha256": f"seed-tier1-{t1['id']}",
        "status": "VERIFIED",
        "checks": {"path": "registry", "tier": "1A", "badge": "REGISTRY"},
        "extracted_fields": {"tier": "1A", "badge": "REGISTRY", "survey_number": "101/A",
                             "status": "VERIFIED", "marketplace_eligible": True},
        "reasons": [],
    }).execute()
    print(f"tier1 farm {t1['id']} (VERIFIED/REGISTRY)")

    # ── Tier 3: PENDING farm (FPO confirm) + FLAGGED farm (FPO review) ──
    p1 = sb.table("farms").insert({
        "owner_phone": TIER3_PHONE,
        "name": "Survey 999/Z — Pending Parcel",
        "crop_type": "Cotton",
        "irrigation": "Borewell",
        "geojson": poly(79.30, 17.70),
        "area_hectares": 2.10,
        "status": "PENDING", "badge": None,
    }).execute().data[0]
    sb.table("kyc_verifications").insert({
        "owner_phone": TIER3_PHONE,
        "document_name": "fpo-path",
        "document_sha256": f"seed-tier3-pending-{p1['id']}",
        "status": "PENDING",
        "checks": {"path": "fpo"},
        "extracted_fields": {"tier": None, "badge": None, "status": "PENDING",
                             "farm_id": p1["id"]},
        "reasons": ["Awaiting FPO confirmation"],
    }).execute()
    f1 = sb.table("farms").insert({
        "owner_phone": TIER3_PHONE,
        "name": "Survey 999/Y — Flagged Parcel",
        "crop_type": "Maize",
        "irrigation": "Rainfed",
        "geojson": poly(79.32, 17.72),
        "area_hectares": 1.40,
        "status": "FLAGGED", "badge": None,
    }).execute().data[0]
    sb.table("kyc_verifications").insert({
        "owner_phone": TIER3_PHONE,
        "document_name": "pahani-upload",
        "document_sha256": f"seed-tier3-flagged-{f1['id']}",
        "status": "FLAGGED",
        "checks": {"failed_checks": ["pahani_location_mismatch"]},
        "extracted_fields": {"tier": "2", "badge": None, "status": "FLAGGED",
                             "farm_id": f1["id"]},
        "reasons": ["pahani_location_mismatch"],
    }).execute()
    print(f"tier3 farms {p1['id']} (PENDING) + {f1['id']} (FLAGGED)")

    print("done: tier1=9000000011 (101/A) tier2=9000000012 (999/Z) tier3=9000000013")


if __name__ == "__main__":
    main()
