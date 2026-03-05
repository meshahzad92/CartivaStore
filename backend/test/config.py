"""
Shared test configuration for Cartiva Store endpoint tests.
All test scripts import from here.
"""
import os
import sys
import requests

# ── Server config ─────────────────────────────────────────────────────────
BASE_URL = os.getenv("TEST_BASE_URL", "http://localhost:8000/api/v1")

# Admin credentials (pulled from .env or environment)
ADMIN_EMAIL    = os.getenv("ADMIN_EMAIL", "admin@cartiva.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin1234")


# ── ANSI colours for pretty output ────────────────────────────────────────
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
RESET  = "\033[0m"
BOLD   = "\033[1m"


def ok(label: str, detail: str = ""):
    print(f"  {GREEN}✓ PASS{RESET}  {label}" + (f"  → {detail}" if detail else ""))


def fail(label: str, detail: str = ""):
    print(f"  {RED}✗ FAIL{RESET}  {label}" + (f"  → {detail}" if detail else ""))
    sys.exit(1)          # stop immediately on first failure


def section(title: str):
    bar = "─" * 60
    print(f"\n{CYAN}{BOLD}{bar}{RESET}")
    print(f"{CYAN}{BOLD}  {title}{RESET}")
    print(f"{CYAN}{BOLD}{bar}{RESET}")


def warn(label: str, detail: str = ""):
    print(f"  {YELLOW}⚠ WARN{RESET}  {label}" + (f"  → {detail}" if detail else ""))


def assert_status(label: str, resp: requests.Response, expected: int):
    if resp.status_code == expected:
        ok(label, f"HTTP {resp.status_code}")
    else:
        fail(label, f"expected HTTP {expected}, got {resp.status_code} — body: {resp.text[:300]}")


def assert_key(label: str, data: dict, key: str):
    if key in data:
        ok(label, f"{key!r} present")
    else:
        fail(label, f"key {key!r} missing from response: {list(data.keys())}")


def get_admin_token() -> str:
    """Login as admin and return the Bearer token."""
    resp = requests.post(
        f"{BASE_URL}/admin/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    )
    if resp.status_code != 200:
        fail("Admin login (setup)", f"HTTP {resp.status_code} — {resp.text[:200]}")
    token = resp.json().get("access_token", "")
    if not token:
        fail("Admin login (setup)", "No access_token in response")
    return token


def admin_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
