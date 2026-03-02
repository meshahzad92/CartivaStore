"""
Security utilities – placeholder for future JWT / admin auth.

Currently provides input sanitization helpers.
"""

import re
from html import escape


def sanitize_string(value: str) -> str:
    """Escape HTML entities and strip leading/trailing whitespace."""
    return escape(value.strip())


def is_valid_phone(phone: str) -> bool:
    """Basic phone validation: digits, optional leading +, 7-15 chars."""
    pattern = r"^\+?\d{7,15}$"
    return bool(re.match(pattern, phone))
