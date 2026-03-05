"""
Master test runner for all Cartiva Store API endpoints.

Usage (from backend/ directory):
    python test/run_tests.py

Requirements:
    pip install requests

The backend server must be running on http://localhost:8000 before running these tests.
"""

import sys
import os
import time
import requests

# Add backend root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from test.config import BASE_URL, GREEN, RED, YELLOW, CYAN, BOLD, RESET


def check_server_running() -> bool:
    """Ensure the backend is up before running any tests."""
    try:
        resp = requests.get("http://localhost:8000/health", timeout=4)
        return resp.status_code == 200
    except Exception:
        return False


def wait_for_server(max_wait: int = 15) -> bool:
    print(f"{YELLOW}Waiting for backend server on http://localhost:8000 ...{RESET}")
    for attempt in range(max_wait):
        if check_server_running():
            print(f"{GREEN}Server is up!{RESET}")
            return True
        time.sleep(1)
        print(f"  ... {attempt + 1}s", end="\r", flush=True)
    return False


def run_all():
    print(f"\n{CYAN}{BOLD}{'='*60}{RESET}")
    print(f"{CYAN}{BOLD}  CARTIVA STORE — FULL API TEST SUITE{RESET}")
    print(f"{CYAN}{BOLD}  Target: {BASE_URL}{RESET}")
    print(f"{CYAN}{BOLD}{'='*60}{RESET}")

    # ── Server check ──────────────────────────────────────────────
    if not check_server_running():
        if not wait_for_server(max_wait=15):
            print(f"\n{RED}✗ Could not reach the backend server at http://localhost:8000{RESET}")
            print("  Please start it first with:")
            print("    cd backend && source venv/bin/activate && uvicorn app.main:app --reload")
            sys.exit(1)

    passed = []
    failed = []

    # ── Test modules in dependency order ──────────────────────────
    test_modules = [
        ("Products",     "test.test_products"),
        ("Testimonials", "test.test_testimonials"),
        ("Orders",       "test.test_orders"),
        ("Admin",        "test.test_admin"),
    ]

    for name, module_path in test_modules:
        print(f"\n{CYAN}{BOLD}▶  Running {name} tests ...{RESET}")
        try:
            import importlib
            mod = importlib.import_module(module_path)
            mod.run()
            passed.append(name)
        except SystemExit:
            # fail() calls sys.exit(1)
            failed.append(name)
            print(f"\n{RED}{BOLD}✗ {name} tests FAILED — stopping test run{RESET}")
            print(f"{YELLOW}  Fix the issue above and re-run: python test/run_tests.py{RESET}")
            break
        except Exception as exc:
            failed.append(name)
            print(f"\n{RED}{BOLD}✗ {name} tests raised an unexpected exception:{RESET}")
            print(f"  {exc}")
            print(f"{YELLOW}  Fix the issue above and re-run: python test/run_tests.py{RESET}")
            break

    # ── Summary ───────────────────────────────────────────────────
    print(f"\n{CYAN}{BOLD}{'='*60}{RESET}")
    print(f"{CYAN}{BOLD}  RESULTS{RESET}")
    print(f"{CYAN}{BOLD}{'='*60}{RESET}")

    for name in passed:
        print(f"  {GREEN}✓ PASS{RESET}  {name}")
    for name in failed:
        print(f"  {RED}✗ FAIL{RESET}  {name}")

    total = len(passed) + len(failed)
    print(f"\n  {len(passed)}/{total} test groups passed")

    if failed:
        print(f"\n{RED}{BOLD}  Some tests FAILED. See above for details.{RESET}\n")
        sys.exit(1)
    else:
        print(f"\n{GREEN}{BOLD}  All tests PASSED. API is working correctly! 🎉{RESET}\n")


if __name__ == "__main__":
    run_all()
