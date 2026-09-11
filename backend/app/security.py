import os
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from fastapi import Depends, Header, HTTPException
from typing import Optional

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "carbonx_dev_secret_change_in_production")
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(str(password)[:50])

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(str(plain_password)[:50], hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    to_encode["exp"] = datetime.now(timezone.utc) + timedelta(hours=72)
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None


def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload


def require_role(*allowed_roles):
    def _check(current_user: dict = Depends(get_current_user)):
        role = current_user.get("role", "farmer")
        if role not in allowed_roles:
            raise HTTPException(status_code=403, detail=f"Access denied. Required role: {', '.join(allowed_roles)}")
        return current_user
    return _check
