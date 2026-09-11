"""OTP SMS via Textplate API (https://api.textplate.in/v1/send-sms).

Flow: app generates a 6-digit OTP -> stores it in Redis (3-min TTL) ->
sends it via Textplate -> verifies against Redis on submit.
Set TEXTPLATE_API_TOKEN + TEXTPLATE_TEMPLATE_ID in backend/.env.
Without them, dev-mode fallback logs the OTP and returns dev_otp.
"""

import os
import random
import re

TEXTPLATE_URL = "https://api.textplate.in/v1/send-sms"
OTP_TTL_MINUTES = 3


def generate_otp() -> str:
    return str(random.randint(100000, 999999))


def _is_placeholder(v: str) -> bool:
    v = (v or "").strip()
    if not v:
        return True
    low = v.lower()
    return (
        low.startswith("your-")
        or "your_" in low
        or "your-textplate" in low
        or "your-twilio" in low
        or low in ("xxx", "test", "changeme")
    )


def _config() -> dict:
    token = os.getenv("TEXTPLATE_API_TOKEN", "").strip() or os.getenv("TEXTPLATE", "").strip()
    return {
        "token": token,
        "template_id": os.getenv("TEXTPLATE_TEMPLATE_ID", "").strip(),
        "expiry": os.getenv("TEXTPLATE_EXPIRY_VALUE", str(OTP_TTL_MINUTES)).strip() or str(OTP_TTL_MINUTES),
        "detail": os.getenv("TEXTPLATE_DETAIL_VALUE", "CarbonX login").strip() or "CarbonX login",
    }


def sms_configured() -> bool:
    cfg = _config()
    return not _is_placeholder(cfg["token"]) and not _is_placeholder(cfg["template_id"])


def _normalize_mobile(phone: str) -> str:
    """Textplate expects +91XXXXXXXXXX (per their API examples)."""
    digits = re.sub(r"\D", "", phone or "")
    if len(digits) > 10:
        digits = digits[-10:]
    return f"+91{digits}" if len(digits) == 10 else digits


def send_phone_otp(phone: str, otp: str) -> bool:
    """Send OTP via Textplate. Returns True on accepted, False otherwise."""
    cfg = _config()
    mobile = _normalize_mobile(phone)
    print(f"[TEXTPLATE] sending mobileNumber={mobile!r}")
    if not re.fullmatch(r"\+91\d{10}", mobile):
        print(f"[SMS ERROR] Invalid mobile number: {phone}")
        return False
    if not sms_configured():
        print(f"[DEV MODE] Textplate not configured. OTP for {mobile}: {otp}")
        return False
    try:
        import requests

        resp = requests.post(
            TEXTPLATE_URL,
            headers={"Authorization": f"Bearer {cfg['token']}"},
            files={},
            data={
                "mobileNumber": mobile,
                "templateId": cfg["template_id"],
                "otpValue": str(otp),
                "expiryValue": str(cfg["expiry"]),
                "detailValue": str(cfg["detail"]),
            },
            timeout=15,
        )
        ok = 200 <= resp.status_code < 300
        print(f"[TEXTPLATE] send to {mobile}: HTTP {resp.status_code} ok={ok} body={resp.text[:300]}")
        return ok
    except Exception as e:
        print(f"[SMS ERROR] Textplate send failed for {mobile}: {e}")
        return False


# Backwards-compat alias (old Twilio-era imports).
twilio_ready = sms_configured
