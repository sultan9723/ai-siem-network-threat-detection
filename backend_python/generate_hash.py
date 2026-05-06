"""Utility to generate bcrypt password hashes for ADMIN_PASSWORD_HASH.

Usage:
    python generate_hash.py
    python generate_hash.py "your-password"

The output hash goes into your .env file as ADMIN_PASSWORD_HASH.
"""

import sys
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def generate_hash(password: str) -> str:
    return pwd_context.hash(password)


if __name__ == "__main__":
    if len(sys.argv) > 1:
        plaintext = sys.argv[1]
    else:
        plaintext = input("Enter password to hash: ")

    if not plaintext:
        print("Error: password cannot be empty.")
        sys.exit(1)

    hashed = generate_hash(plaintext)

    print()
    print("=" * 60)
    print("Bcrypt hash generated successfully.")
    print("=" * 60)
    print(f"ADMIN_PASSWORD_HASH={hashed}")
    print("=" * 60)
    print()
    print("Copy the value above into your .env file.")
