import os
import random


def generate_otp() -> str:
    return str(random.randint(100000, 999999))


def send_phone_otp(phone: str, otp: str) -> bool:
    """
    Send OTP via Twilio SMS if credentials are configured,
    otherwise fall back to dev-mode console log.
    Returns True if SMS was sent, False if dev-mode fallback used.
    """
    account_sid = os.getenv("TWILIO_ACCOUNT_SID", "").strip()
    auth_token = os.getenv("TWILIO_AUTH_TOKEN", "").strip()
    from_number = os.getenv("TWILIO_PHONE_NUMBER", "").strip()

    if account_sid and auth_token and from_number:
        try:
            from twilio.rest import Client

            client = Client(account_sid, auth_token)
            message = client.messages.create(
                body=f"Your CarbonX OTP is: {otp}. Valid for 10 minutes. Do not share this code.",
                from_=from_number,
                to=f"+91{phone}",
            )
            print(f"[TWILIO] SMS sent to +91{phone}, SID: {message.sid}")
            return True
        except Exception as e:
            print(f"[TWILIO ERROR] Failed to send SMS to +91{phone}: {e}")
            print(f"[DEV FALLBACK] OTP for +91{phone}: {otp}")
            return False

    print(f"[DEV MODE] Twilio not configured. OTP for +91{phone}: {otp}")
    return False
