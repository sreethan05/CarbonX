from jose import jwt, JWTError
from datetime import datetime, timedelta
from passlib.context import CryptContext

SECRET_KEY = "carbonx_jwt_secret_2026"
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(str(password)[:50])

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(str(plain_password)[:50], hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    to_encode["exp"] = datetime.utcnow() + timedelta(hours=72)
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None
