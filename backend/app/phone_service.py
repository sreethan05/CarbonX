"""OTP SMS via Textplate (primary) with Twilio fallback.

Flow: app generates a 6-digit OTP -> stores it in Redis/SQLite ->
tries Textplate first -> on failure tries Twilio -> verifies on submit.
Set TEXTPLATE_API_TOKEN + TEXTPLATE_TEMPLATE_ID in backend/.env (primary).
Set TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_PHONE_NUMBER (fallback).
Without either, dev-mode fallback logs the OTP and returns dev_otp.
"""

import os
import re
import secrets

TEXTPLATE_URL = "https://api.textplate.in/v1/send-sms"
OTP_TTL_MINUTES = 10


def generate_otp() -> str:
    return f"{secrets.randbelow(900000) + 100000:06d}"


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
        or "your_twilio" in low
        or low.startswith("acxx")
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
    """True when at least one SMS provider (Textplate or Twilio) is set."""
    return textplate_configured() or twilio_configured()


def textplate_configured() -> bool:
    cfg = _config()
    return not _is_placeholder(cfg["token"]) and not _is_placeholder(cfg["template_id"])


def twilio_config() -> dict:
    return {
        "sid": os.getenv("TWILIO_ACCOUNT_SID", "").strip(),
        "token": os.getenv("TWILIO_AUTH_TOKEN", "").strip(),
        "from_number": os.getenv("TWILIO_PHONE_NUMBER", "").strip()
        or os.getenv("TWILIO_FROM_NUMBER", "").strip(),
    }


def twilio_configured() -> bool:
    cfg = twilio_config()
    return (
        not _is_placeholder(cfg["sid"])
        and not _is_placeholder(cfg["token"])
        and not _is_placeholder(cfg["from_number"])
    )


def normalize_indian_mobile(phone: str) -> str:
    """Return the canonical 10-digit Indian mobile number used by the app."""
    digits = re.sub(r"\D", "", phone or "")
    if len(digits) == 12 and digits.startswith("91"):
        digits = digits[2:]
    elif len(digits) == 11 and digits.startswith("0"):
        digits = digits[1:]
    return digits if re.fullmatch(r"[6-9]\d{9}", digits) else ""


def _normalize_mobile(phone: str) -> str:
    """Textplate expects +91XXXXXXXXXX (per their API examples)."""
    digits = normalize_indian_mobile(phone)
    return f"+91{digits}" if digits else ""


def _send_via_textplate(mobile: str, otp: str, cfg: dict) -> tuple[bool, str | None]:
    """Try Textplate. Returns (sent, error_detail)."""
    try:
        import requests

        form_fields = {
            "mobileNumber": mobile,
            "templateId": cfg["template_id"],
            "otpValue": str(otp),
            "expiryValue": str(cfg["expiry"]),
        }
        if cfg["detail"]:
            form_fields["detailValue"] = str(cfg["detail"])
        resp = requests.post(
            TEXTPLATE_URL,
            headers={"Authorization": f"Bearer {cfg['token']}"},
            data=form_fields,
            timeout=15,
        )
        body = resp.text[:500]
        try:
            payload = resp.json()
        except ValueError:
            payload = {}
        provider_status = str(payload.get("status", "")).strip().lower()
        provider_message = str(payload.get("message", "")).strip() or None
        rejected = provider_status in {"failed", "failure", "error", "rejected"} or payload.get("success") is False
        ok = 200 <= resp.status_code < 300 and not rejected
        if not ok:
            print(f"[TEXTPLATE ERROR] HTTP {resp.status_code} response={body}")
            return False, provider_message or f"Textplate HTTP {resp.status_code}"
        print(f"[TEXTPLATE] send to {mobile}: HTTP {resp.status_code} accepted")
        return True, None
    except Exception as e:
        print(f"[SMS ERROR] Textplate send failed for {mobile}: {e}")
        return False, str(e)


def _send_via_twilio(mobile: str, otp: str, cfg: dict) -> tuple[bool, str | None]:
    """Try Twilio Messages API via requests (no twilio package needed)."""
    try:
        import requests

        url = f"https://api.twilio.com/2010-04-01/Accounts/{cfg['sid']}/Messages.json"
        body = (
            f"Your CarbonX OTP is {otp}. "
            f"Valid for {OTP_TTL_MINUTES} minutes. Do not share this code."
        )
        resp = requests.post(
            url,
            auth=(cfg["sid"], cfg["token"]),
            data={"To": mobile, "From": cfg["from_number"], "Body": body},
            timeout=15,
        )
        text = resp.text[:500]
        if 200 <= resp.status_code < 300:
            try:
                sid = resp.json().get("sid", "")
            except ValueError:
                sid = ""
            print(f"[TWILIO] SMS sent to {mobile}, SID: {sid}")
            return True, None
        try:
            err = resp.json().get("message", "")
        except ValueError:
            err = ""
        print(f"[TWILIO ERROR] HTTP {resp.status_code} response={text}")
        return False, err or f"Twilio HTTP {resp.status_code}"
    except Exception as e:
        print(f"[TWILIO ERROR] Failed to send SMS to {mobile}: {e}")
        return False, str(e)


def send_phone_otp(phone: str, otp: str) -> tuple[bool, str | None]:
    """Send OTP via Textplate, falling back to Twilio.

    Returns (sent, info): info is the provider name ("textplate"/"twilio")
    on success, an error detail on failure, or None when no provider is
    configured (dev mode).
    """
    mobile = _normalize_mobile(phone)
    if not re.fullmatch(r"\+91\d{10}", mobile):
        print(f"[SMS ERROR] Invalid mobile number: {phone}")
        return False, "Invalid mobile number"

    textplate_ok = textplate_configured()
    twilio_ok = twilio_configured()
    if not textplate_ok and not twilio_ok:
        print(f"[DEV MODE] No SMS provider configured. OTP for {mobile}: {otp}")
        return False, None

    errors: list[str] = []
    if textplate_ok:
        print(f"[TEXTPLATE] sending mobileNumber={mobile!r}")
        sent, err = _send_via_textplate(mobile, otp, _config())
        if sent:
            return True, "textplate"
        if err:
            errors.append(f"Textplate: {err}")
    if twilio_ok:
        print(f"[TWILIO] sending to {mobile!r} (fallback)")
        sent, err = _send_via_twilio(mobile, otp, twilio_config())
        if sent:
            return True, "twilio"
        if err:
            errors.append(f"Twilio: {err}")
    return False, "; ".join(errors) if errors else "SMS delivery failed"
