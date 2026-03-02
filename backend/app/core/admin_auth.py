"""Admin authentication — credentials loaded exclusively from .env via Settings."""

import base64
import hashlib
import hmac
import time

from app.core.config import get_settings


def _hash(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()


def verify_credentials(email: str, password: str) -> bool:
    """Return True only if email + password match .env values."""
    s = get_settings()
    email_ok = hmac.compare_digest(email.strip().lower(), s.ADMIN_EMAIL.strip().lower())
    pass_ok = hmac.compare_digest(_hash(password), _hash(s.ADMIN_PASSWORD))
    return email_ok and pass_ok


def create_token(email: str) -> str:
    """Create a signed token valid for JWT_EXPIRE_MINUTES."""
    s = get_settings()
    expires = int(time.time()) + s.JWT_EXPIRE_MINUTES * 60
    payload = f"{email}|{expires}"
    sig = hmac.new(s.SECRET_KEY.encode(), payload.encode(), hashlib.sha256).hexdigest()
    return base64.b64encode(f"{payload}|{sig}".encode()).decode()


def verify_token(token: str) -> str | None:
    """Verify token signature and expiry. Returns email or None."""
    try:
        s = get_settings()
        decoded = base64.b64decode(token.encode()).decode()
        parts = decoded.split("|")
        if len(parts) != 3:
            return None
        email, expires_str, sig = parts
        if time.time() > int(expires_str):
            return None
        payload = f"{email}|{expires_str}"
        expected = hmac.new(s.SECRET_KEY.encode(), payload.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected):
            return None
        return email
    except Exception:
        return None
