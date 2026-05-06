"""Generate production-ready admin credentials for the AI SIEM backend.

Usage:
    python generate_credentials.py

Output:
    1. A strong random password (displayed once)
    2. Its bcrypt hash (for .env)
    3. A random SECRET_KEY (for .env)
    4. Ready-to-paste .env block

Run this script once during setup. Copy the output into backend_python/.env
and keep the plaintext password secure.
"""

import secrets
import string
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def generate_strong_password(length: int = 18) -> str:
    """Generate a cryptographically secure random password.

    Guaranteed to include uppercase, lowercase, digits, and symbols.
    """
    uppercase = string.ascii_uppercase
    lowercase = string.ascii_lowercase
    digits = string.digits
    symbols = "!@#$%^&*()-_=+"

    pool = uppercase + lowercase + digits + symbols

    while True:
        password = "".join(secrets.choice(pool) for _ in range(length))
        if (
            any(c in uppercase for c in password)
            and any(c in lowercase for c in password)
            and any(c in digits for c in password)
            and any(c in symbols for c in password)
        ):
            return password


def generate_hash(password: str) -> str:
    return pwd_context.hash(password)


def main():
    username = "admin"
    password = generate_strong_password()
    password_hash = generate_hash(password)
    secret_key = secrets.token_urlsafe(32)

    divider = "=" * 60

    print()
    print(divider)
    print("  AI SIEM — Generated Admin Credentials")
    print(divider)
    print()
    print(f"  Username: {username}")
    print(f"  Password: {password}")
    print(f"  Hash:     {password_hash}")
    print()
    print(divider)
    print("  Copy the block below into backend_python/.env")
    print(divider)
    print()
    print(f"  ADMIN_USERNAME={username}")
    print(f"  ADMIN_PASSWORD_HASH={password_hash}")
    print(f"  SECRET_KEY={secret_key}")
    print(f"  ALGORITHM=HS256")
    print(f"  ACCESS_TOKEN_EXPIRE_MINUTES=60")
    print()
    print(divider)
    print("  Next steps:")
    print("  1. Copy the .env block above into backend_python/.env")
    print("  2. Save the password securely (you will need it to login)")
    print("  3. Start backend: uvicorn api:app --reload --port 8001")
    print("  4. Login with:  username={username}  password={password}")
    print(divider)
    print()


if __name__ == "__main__":
    main()
