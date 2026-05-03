import os
from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
from dotenv import load_dotenv

# Load env from parent or local dir
load_dotenv()

# ✅ TASK 1: Secrets from environment
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-not-safe")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# ✅ TASK 3: Use passlib bcrypt hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Hardcoded admin (for demo/SOC training purposes, but hashed)
ADMIN_USERNAME = "admin"
# In a real system, this would come from a secure DB
ADMIN_HASHED_PASSWORD = pwd_context.hash("admin123")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def authenticate(username, password):
    """
    Validates credentials against hashed admin password.
    """
    if username != ADMIN_USERNAME:
        return False
    return verify_password(password, ADMIN_HASHED_PASSWORD)

def create_token(data: dict):
    """
    ✅ TASK 2: Create JWT with automatic expiration
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
