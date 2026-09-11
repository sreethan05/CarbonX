"""Redis-backed short-lived OTP storage."""

import hmac
import os

import redis

OTP_TTL_SECONDS = 3 * 60
OTP_KEY_PREFIX = "carbonx:otp:"

_client: redis.Redis | None = None


def _redis_client() -> redis.Redis:
    global _client
    if _client is None:
        redis_url = os.getenv("REDIS_URL", "redis://localhost:4000").strip()
        _client = redis.Redis.from_url(redis_url, decode_responses=True)
    return _client


def _key(phone: str) -> str:
    return f"{OTP_KEY_PREFIX}{phone}"


def store_otp(phone: str, otp: str) -> None:
    client = _redis_client()
    client.setex(_key(phone), OTP_TTL_SECONDS, otp)


def verify_otp(phone: str, otp: str) -> bool:
    client = _redis_client()
    key = _key(phone)
    stored_otp = client.get(key)
    if not stored_otp or not hmac.compare_digest(str(stored_otp), str(otp)):
        return False
    return bool(client.delete(key))


def clear_otp(phone: str) -> None:
    _redis_client().delete(_key(phone))


def health_check() -> bool:
    return bool(_redis_client().ping())
