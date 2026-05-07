"""Authentication, JWT token handling, and password security.

Credentials are loaded from environment variables. No plaintext passwords
are stored or compared in source code.
"""

import os
import logging
from datetime import datetime, timedelta

from jose import jwt
from passlib.context import CryptContext
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

# Load .env from same directory as this file
_backend_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_backend_dir, ".env"))

# --- JWT configuration (fail fast if missing) ---

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError(
        "SECRET_KEY is not set. Add it to backend_python/.env "
        "or your deployment environment."
    )

ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# --- Password hashing (bcrypt) ---

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- Admin credentials from environment (fail fast if missing) ---

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")
if not ADMIN_USERNAME:
    raise RuntimeError(
        "ADMIN_USERNAME is not set. Add it to backend_python/.env."
    )

ADMIN_PASSWORD_HASH = os.getenv("ADMIN_PASSWORD_HASH")
if not ADMIN_PASSWORD_HASH:
    raise RuntimeError(
        "Missing ADMIN_PASSWORD_HASH or SECRET_KEY. "
        "Generate credentials with: python generate_credentials.py"
    )


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


def authenticate(username: str, password: str) -> bool:
    """Validate credentials using env-based username and bcrypt hash.

    Returns True only when username matches AND password hash verifies.
    Handles empty/None inputs safely.
    """
    if not username or not password:
        logger.debug("❌ Auth failed: empty username or password")
        return False

    if username != ADMIN_USERNAME:
        logger.debug(f"❌ Auth failed: username mismatch. Got: '{username}', Expected: '{ADMIN_USERNAME}'")
        return False

    try:
        result = verify_password(password, ADMIN_PASSWORD_HASH)
        if result:
            logger.debug(f"✅ Auth success: password verified for user '{username}'")
        else:
            logger.debug(f"❌ Auth failed: password verification failed for user '{username}'")
        return result
    except Exception as e:
        logger.debug(f"❌ Auth failed: hash verification error for user '{username}': {str(e)}")
        return False


def create_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Create a JWT token with expiration.

    Args:
        data: Payload to encode (typically includes 'sub' for username).
        expires_delta: Optional custom expiration timedelta. If None, uses
                        ACCESS_TOKEN_EXPIRE_MINUTES.

    Returns:
        Encoded JWT token string.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(username: str) -> str:
    """Create a long-lived refresh token (30 days) for 'Remember Me'."""
    expires = timedelta(days=30)
    return create_token({"sub": username, "type": "refresh"}, expires_delta=expires)
