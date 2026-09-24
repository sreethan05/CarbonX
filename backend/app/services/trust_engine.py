"""Single source of truth for verification tier, badge, status, and eligibility.

The frontend must never assign badges. This module decides:

- path FPO (no survey number) -> status PENDING, badge None until FPO confirms
- survey + registry geom + owner/area match -> tier 1A, badge REGISTRY
- survey + registry owner/area, geom missing -> tier 1B, badge REGISTRY_DOC
- survey not in registry -> tier 2, badge DOCUMENT
- fraud/three-source failure -> status FLAGGED, route to FPO
"""
from typing import Optional

from app.services.kyc_service import _match_name
from app.services.polygon_service import area_delta_pct

MARKETPLACE_BADGES = ("REGISTRY", "REGISTRY_DOC", "DOCUMENT", "FPO")
AREA_TOLERANCE_PCT = 20.0


def names_match(left: str, right: str) -> bool:
    if not left or not right:
        return False
    _score, ok = _match_name(left, right)
    return ok


def decide_tier(
    *,
    fpo_path: bool,
    survey_number: str = "",
    registry: Optional[dict] = None,
    owner_name: str = "",
    ocr_owner: str = "",
    claimed_area_ha: Optional[float] = None,
) -> dict:
    """Return {tier, badge, path} before fraud is applied.

    Strict ownership rule: the logged-in profile name must match BOTH the
    registry owner and the document owner. A document belonging to someone
    else (e.g. Ramesh's Pahani uploaded under Mallaiah's profile) must never
    yield Tier 1 — it is flagged via ``owner_mismatch`` so ``verify-land``
    can force FLAGGED / NOT VERIFIED.
    """
    if fpo_path or not (survey_number or "").strip():
        return {"tier": None, "badge": None, "path": "fpo", "owner_mismatch": False}

    found = bool(registry and registry.get("found"))
    if not found:
        # Tier 2 still requires doc owner == profile owner.
        profile_doc_ok = names_match(owner_name, ocr_owner) if ocr_owner else True
        return {
            "tier": "2",
            "badge": "DOCUMENT",
            "path": "registry",
            "owner_mismatch": not profile_doc_ok,
        }

    has_geom = bool(registry.get("registry_geometry_available") or registry.get("geojson"))
    registry_owner = registry.get("owner_name") or ""
    profile_matches_registry = names_match(owner_name, registry_owner)
    ocr_given = bool((ocr_owner or "").strip())
    doc_matches_registry = names_match(ocr_owner, registry_owner) if ocr_given else True
    profile_matches_doc = names_match(owner_name, ocr_owner) if ocr_given else True
    owner_mismatch = not (profile_matches_registry and doc_matches_registry and profile_matches_doc)
    area_ok = True
    if claimed_area_ha and registry.get("area_ha"):
        delta = area_delta_pct(float(registry["area_ha"]), float(claimed_area_ha))
        area_ok = delta is None or delta <= AREA_TOLERANCE_PCT

    if has_geom and not owner_mismatch and area_ok:
        return {"tier": "1A", "badge": "REGISTRY", "path": "registry", "owner_mismatch": False}
    return {
        "tier": "1B",
        "badge": "REGISTRY_DOC",
        "path": "registry",
        "owner_mismatch": owner_mismatch,
    }


def apply_fraud(decision: dict, fraud: dict) -> dict:
    """Merge fraud outcome. FPO path stays PENDING until confirm."""
    if decision.get("path") == "fpo":
        return {
            "tier": None,
            "badge": None,
            "risk": "LOW",
            "status": "PENDING",
            "failed_checks": [],
            "marketplace_eligible": False,
            "credits_blocked": True,
        }
    failed = list(fraud.get("failed_checks") or [])
    # Hard ownership rule: doc/registry must belong to the logged-in profile.
    if decision.get("owner_mismatch"):
        failed = list(dict.fromkeys([*failed, "profile_owner_mismatch"]))
    status = fraud.get("status") or "VERIFIED"
    risk = fraud.get("risk") or "LOW"
    if "profile_owner_mismatch" in failed:
        status, risk = "FLAGGED", "HIGH"
    flagged = status == "FLAGGED"
    badge = None if flagged else decision.get("badge")
    return {
        "tier": decision.get("tier"),
        "badge": badge,
        "risk": risk,
        "status": status,
        "failed_checks": failed,
        "marketplace_eligible": (not flagged) and badge in MARKETPLACE_BADGES,
        "credits_blocked": flagged,
    }


def fpo_confirmed_result() -> dict:
    return {
        "tier": None,
        "badge": "FPO",
        "risk": "LOW",
        "status": "VERIFIED",
        "failed_checks": [],
        "marketplace_eligible": True,
        "credits_blocked": False,
    }


def farm_may_list(farm: Optional[dict], badge: Optional[str] = None) -> tuple[bool, str]:
    if not farm:
        return True, ""
    status = str(farm.get("status") or "").upper()
    if status in ("PENDING", "FLAGGED"):
        return False, f"Farm status {status} cannot be listed"
    farm_badge = badge or farm.get("badge")
    if farm_badge and farm_badge not in MARKETPLACE_BADGES:
        return False, f"Badge {farm_badge} is not marketplace-eligible"
    return True, ""
