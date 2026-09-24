"""Redis-backed short-lived OTP storage with in-memory fallback."""

import hmac
import os
import sqlite3
import time
from pathlib import Path
import redis

OTP_TTL_SECONDS = 10 * 60
OTP_MAX_ATTEMPTS = 5
OTP_KEY_PREFIX = "carbonx:otp:"
OTP_ATTEMPT_PREFIX = "carbonx:otp_attempts:"

_client: redis.Redis | None = None
_memory_store: dict[str, tuple[str, float, int]] = {}
_SQLITE_PATH = Path(__file__).resolve().parents[2] / ".runtime" / "otp.sqlite3"


def _sqlite_connection() -> sqlite3.Connection:
    _SQLITE_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(_SQLITE_PATH, timeout=5)
    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS otp_store (
            phone TEXT PRIMARY KEY,
            otp TEXT NOT NULL,
            expires_at REAL NOT NULL,
            attempts INTEGER NOT NULL DEFAULT 0
        )
        """
    )
    connection.commit()
    return connection


def _redis_client() -> redis.Redis | None:
    global _client
    if _client is not None:
        return _client
    try:
        redis_url = os.getenv("REDIS_URL", "redis://localhost:4000").strip()
        client = redis.Redis.from_url(redis_url, decode_responses=True, socket_timeout=1.0)
        client.ping()
        _client = client
        return _client
    except Exception:
        return None


def _key(phone: str) -> str:
    return f"{OTP_KEY_PREFIX}{phone}"


def _attempt_key(phone: str) -> str:
    return f"{OTP_ATTEMPT_PREFIX}{phone}"


def store_otp(phone: str, otp: str) -> None:
    client = _redis_client()
    if client:
        try:
            client.set(_key(phone), otp, ex=OTP_TTL_SECONDS)
            client.delete(_attempt_key(phone))
            return
        except Exception:
            pass
    expires_at = time.time() + OTP_TTL_SECONDS
    try:
        with _sqlite_connection() as connection:
            connection.execute(
                "INSERT OR REPLACE INTO otp_store(phone, otp, expires_at, attempts) VALUES (?, ?, ?, 0)",
                (phone, otp, expires_at),
            )
            connection.commit()
        return
    except sqlite3.Error:
        # Last-resort fallback for an unavailable local filesystem.
        _memory_store[phone] = (otp, expires_at, 0)


def verify_otp(phone: str, otp: str) -> bool:
    client = _redis_client()
    if client:
        try:
            key = _key(phone)
            stored_otp = client.get(key)
            if not stored_otp:
                return False
            if not hmac.compare_digest(str(stored_otp), str(otp)):
                attempts = int(client.incr(_attempt_key(phone)))
                client.expire(_attempt_key(phone), OTP_TTL_SECONDS)
                if attempts >= OTP_MAX_ATTEMPTS:
                    client.delete(key, _attempt_key(phone))
                return False
            client.delete(key)
            client.delete(_attempt_key(phone))
            return True
        except Exception:
            pass
    try:
        with _sqlite_connection() as connection:
            row = connection.execute(
                "SELECT otp, expires_at, attempts FROM otp_store WHERE phone = ?",
                (phone,),
            ).fetchone()
            if not row:
                return False
            stored_otp, expires_at, attempts = row
            if time.time() > expires_at:
                connection.execute("DELETE FROM otp_store WHERE phone = ?", (phone,))
                connection.commit()
                return False
            if not hmac.compare_digest(str(stored_otp), str(otp)):
                attempts += 1
                if attempts >= OTP_MAX_ATTEMPTS:
                    connection.execute("DELETE FROM otp_store WHERE phone = ?", (phone,))
                else:
                    connection.execute(
                        "UPDATE otp_store SET attempts = ? WHERE phone = ?",
                        (attempts, phone),
                    )
                connection.commit()
                return False
            connection.execute("DELETE FROM otp_store WHERE phone = ?", (phone,))
            connection.commit()
            return True
    except sqlite3.Error:
        pass

    # Last-resort in-memory fallback.
    stored = _memory_store.get(phone)
    if not stored:
        return False
    val, exp, attempts = stored
    if time.time() > exp:
        _memory_store.pop(phone, None)
        return False
    if not hmac.compare_digest(str(val), str(otp)):
        attempts += 1
        if attempts >= OTP_MAX_ATTEMPTS:
            _memory_store.pop(phone, None)
        else:
            _memory_store[phone] = (val, exp, attempts)
        return False
    _memory_store.pop(phone, None)
    return True


def clear_otp(phone: str) -> None:
    client = _redis_client()
    if client:
        try:
            client.delete(_key(phone))
            client.delete(_attempt_key(phone))
        except Exception:
            pass
    try:
        with _sqlite_connection() as connection:
            connection.execute("DELETE FROM otp_store WHERE phone = ?", (phone,))
            connection.commit()
    except sqlite3.Error:
        pass
    _memory_store.pop(phone, None)


def health_check() -> bool:
    client = _redis_client()
    if client:
        try:
            return bool(client.ping())
        except Exception:
            return False
    return False
