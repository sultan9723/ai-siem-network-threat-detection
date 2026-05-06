"""Authentication, JWT token handling, and password security.

All passwords are hashed using bcrypt. No plaintext passwords are stored
or compared in source code. Credentials are loaded from environment variables.
"""

import os
from datetime import datetime, timedelta

from jose import jwt
from passlib.context import CryptContext
from dotenv import load_dotenv

_backend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv(os.path.join(_backend_dir, ".env"))

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError(
        "SECRET_KEY environment variable is required. "
        "Set it in your .env file before starting the server."
    )

ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD_HASH = os.getenv("ADMIN_PASSWORD_HASH")

if not ADMIN_PASSWORD_HASH:
    raise ValueError(
        "ADMIN_PASSWORD_HASH environment variable is required. "
        "Generate a bcrypt hash and set it in your .env file. "
        "See .env.example for instructions."
    )


def hash_password(password: str) -> str:
    """Generate a bcrypt hash from a plaintext password.

    Args:
        password: Plaintext password to hash.

    Returns:
        bcrypt hash string.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a stored bcrypt hash.

    Args:
        plain_password: User-provided plaintext password.
        hashed_password: Stored bcrypt hash.

    Returns:
        True if password matches, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)


def authenticate(username: str, password: str) -> bool:
    """Validate credentials using username lookup and bcrypt password verification.

    Args:
        username: Provided username.
        password: Provided plaintext password.

    Returns:
        True if credentials are valid, False otherwise.
    """
    if not username or not password:
        return False

    if username != ADMIN_USERNAME:
        return False

    try:
        return verify_password(password, ADMIN_PASSWORD_HASH)
    except Exception:
        return False


def create_token(data: dict) -> str:
    """Create a JWT token with automatic expiration.

    Args:
        data: Payload to encode (typically includes 'sub' for username).

    Returns:
        Encoded JWT token string.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
