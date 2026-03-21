"""Simple password authentication with session tokens."""
import hashlib
import secrets
from datetime import datetime, timedelta
from functools import wraps

from fastapi import Request, HTTPException, Response

from database import get_db

# Password hash - set via environment variable AUTH_PASSWORD_HASH
# Generate with: python -c "import hashlib; print(hashlib.sha256(b'yourpassword').hexdigest())"
import os
PASSWORD_HASH = os.environ.get("AUTH_PASSWORD_HASH", "")
SESSION_DURATION_HOURS = 72


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def create_session() -> str:
    token = secrets.token_urlsafe(32)
    expires = datetime.now() + timedelta(hours=SESSION_DURATION_HOURS)
    db = get_db()
    try:
        db.execute(
            "INSERT INTO sessions (token, expires_at) VALUES (?, ?)",
            (token, expires.isoformat()),
        )
        db.commit()
    finally:
        db.close()
    return token


def validate_session(token: str) -> bool:
    if not token:
        return False
    db = get_db()
    try:
        row = db.execute(
            "SELECT expires_at FROM sessions WHERE token = ?", (token,)
        ).fetchone()
        if not row:
            return False
        return datetime.fromisoformat(row["expires_at"]) > datetime.now()
    finally:
        db.close()


def delete_session(token: str):
    db = get_db()
    try:
        db.execute("DELETE FROM sessions WHERE token = ?", (token,))
        # Clean expired sessions
        db.execute("DELETE FROM sessions WHERE expires_at < datetime('now', 'localtime')")
        db.commit()
    finally:
        db.close()


def get_session_token(request: Request) -> str | None:
    # Check cookie first, then Authorization header
    token = request.cookies.get("session")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    return token


def require_auth(request: Request):
    """Dependency for protected routes."""
    if not PASSWORD_HASH:
        return  # No password set = no auth required
    token = get_session_token(request)
    if not validate_session(token):
        raise HTTPException(status_code=401, detail="Unauthorized")
