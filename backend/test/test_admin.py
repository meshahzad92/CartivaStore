"""
Tests for /api/v1/admin — all cases.
Run: python -m test.test_admin   (from backend/ directory)
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import requests
from test.config import (
    BASE_URL, ok, fail, section, warn,
    assert_status, assert_key, get_admin_token, admin_headers,
    ADMIN_EMAIL, ADMIN_PASSWORD,
)

ADMIN_URL  = f"{BASE_URL}/admin"
ORDERS_URL = f"{BASE_URL}/orders"
PRODS_URL  = f"{BASE_URL}/products"

# Order ID created during these tests for status/details update tests
_test_order_id = None
_token = None


# ── Auth helpers ──────────────────────────────────────────────────────────────

def test_login_valid():
    global _token
    section("POST /admin/login — valid credentials")

    resp = requests.post(f"{ADMIN_URL}/login",
                         json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert_status("Login returns HTTP 200", resp, 200)

    data = resp.json()
    assert_key("Response has 'access_token'", data, "access_token")
    assert_key("Response has 'token_type'", data, "token_type")

    if data["token_type"] == "bearer":
        ok("token_type is 'bearer'")
    else:
        fail("token_type", f"expected 'bearer', got {data['token_type']!r}")

    _token = data["access_token"]
    ok(f"JWT token obtained (length={len(_token)})")


def test_login_wrong_password():
    section("POST /admin/login — wrong password")

    resp = requests.post(f"{ADMIN_URL}/login",
                         json={"email": ADMIN_EMAIL, "password": "wrongpassword123"})
    assert_status("Wrong password → HTTP 401", resp, 401)
    ok("Wrong password correctly rejected")


def test_login_wrong_email():
    section("POST /admin/login — wrong email")

    resp = requests.post(f"{ADMIN_URL}/login",
                         json={"email": "nobody@nowhere.com", "password": ADMIN_PASSWORD})
    assert_status("Wrong email → HTTP 401", resp, 401)
    ok("Wrong email correctly rejected")


def test_login_missing_fields():
    section("POST /admin/login — missing fields")

    resp = requests.post(f"{ADMIN_URL}/login", json={"email": ADMIN_EMAIL})
    assert_status("Missing 'password' → HTTP 422", resp, 422)

    resp = requests.post(f"{ADMIN_URL}/login", json={"password": ADMIN_PASSWORD})
    assert_status("Missing 'email' → HTTP 422", resp, 422)

    resp = requests.post(f"{ADMIN_URL}/login", json={})
    assert_status("Empty body → HTTP 422", resp, 422)

    ok("All missing-field cases rejected correctly")


def test_verify_valid_token():
    section("GET /admin/verify — valid token")

    resp = requests.get(f"{ADMIN_URL}/verify", headers=admin_headers(_token))
    assert_status("Returns HTTP 200", resp, 200)

    data = resp.json()
    assert_key("Response has 'valid'", data, "valid")
    assert_key("Response has 'email'", data, "email")

    if data["valid"] is True:
        ok("valid=true")
    else:
        fail("valid flag", "Expected True")

    if data["email"] == ADMIN_EMAIL:
        ok(f"email matches: {data['email']}")
    else:
        warn(f"email mismatch: {data['email']} != {ADMIN_EMAIL}")


def test_verify_no_token():
    section("GET /admin/verify — no token")

    resp = requests.get(f"{ADMIN_URL}/verify")
    assert_status("No token → HTTP 401 or 403", resp, 401)
    ok("Missing token rejected")


def test_verify_bad_token():
    section("GET /admin/verify — bad token")

    resp = requests.get(f"{ADMIN_URL}/verify",
                        headers={"Authorization": "Bearer this.is.fake"})
    assert_status("Invalid token → HTTP 401", resp, 401)
    ok("Fake JWT rejected")


# ── Dashboard stats ───────────────────────────────────────────────────────────

def test_admin_stats():
    section("GET /admin/stats")

    resp = requests.get(f"{ADMIN_URL}/stats", headers=admin_headers(_token))
    assert_status("Returns HTTP 200", resp, 200)

    data = resp.json()
    for field in ("total_today", "pending", "confirmed", "on_hold",
                  "fulfilled", "cancelled", "latest_order_id"):
        assert_key(f"Stats has '{field}'", data, field)

    ok(f"Stats: today={data['total_today']}, pending={data['pending']}, "
       f"fulfilled={data['fulfilled']}")


def test_admin_stats_no_auth():
    section("GET /admin/stats — no auth")

    resp = requests.get(f"{ADMIN_URL}/stats")
    assert_status("No token → HTTP 401", resp, 401)
    ok("Protected route correctly rejects unauthenticated request")


# ── Order list ────────────────────────────────────────────────────────────────

def test_admin_list_orders_default():
    section("GET /admin/orders — default (no filters)")

    resp = requests.get(f"{ADMIN_URL}/orders", headers=admin_headers(_token))
    assert_status("Returns HTTP 200", resp, 200)

    data = resp.json()
    for key in ("orders", "total", "page", "page_size", "total_pages"):
        assert_key(f"Response has '{key}'", data, key)

    ok(f"Total orders: {data['total']} — page {data['page']}/{data['total_pages']}")


def test_admin_list_orders_filters():
    section("GET /admin/orders — status filters")

    for status in ("pending", "confirmed", "on_hold", "fulfilled", "cancelled", "all"):
        resp = requests.get(f"{ADMIN_URL}/orders",
                            headers=admin_headers(_token),
                            params={"status_filter": status})
        assert_status(f"status_filter={status} → HTTP 200", resp, 200)

    ok("All status filters accepted")


def test_admin_list_orders_search():
    section("GET /admin/orders — search")

    resp = requests.get(f"{ADMIN_URL}/orders",
                        headers=admin_headers(_token),
                        params={"search": "Test"})
    assert_status("search=Test → HTTP 200", resp, 200)
    ok(f"Search returned {resp.json()['total']} results")

    # Empty search
    resp = requests.get(f"{ADMIN_URL}/orders",
                        headers=admin_headers(_token),
                        params={"search": "ZZZZ_NOTHING"})
    assert_status("No-match search → HTTP 200", resp, 200)
    ok(f"No-match search returned {resp.json()['total']} results")


def test_admin_list_orders_today():
    section("GET /admin/orders — today_only=true")

    resp = requests.get(f"{ADMIN_URL}/orders",
                        headers=admin_headers(_token),
                        params={"today_only": "true"})
    assert_status("today_only=true → HTTP 200", resp, 200)
    ok(f"Today's orders: {resp.json()['total']}")


def test_admin_list_orders_pagination():
    section("GET /admin/orders — pagination")

    resp = requests.get(f"{ADMIN_URL}/orders",
                        headers=admin_headers(_token),
                        params={"page": 1, "page_size": 2})
    assert_status("Paginated → HTTP 200", resp, 200)
    data = resp.json()
    if len(data["orders"]) <= 2:
        ok(f"page_size=2 respected — got {len(data['orders'])} orders")
    else:
        fail("page_size=2 not respected", f"got {len(data['orders'])}")

    # page_size > 100 — should be capped to 100
    resp = requests.get(f"{ADMIN_URL}/orders",
                        headers=admin_headers(_token),
                        params={"page_size": 500})
    assert_status("page_size=500 capped → HTTP 200", resp, 200)
    ok("Oversized page_size handled gracefully")


def test_admin_list_orders_no_auth():
    section("GET /admin/orders — no auth")

    resp = requests.get(f"{ADMIN_URL}/orders")
    assert_status("No token → HTTP 401", resp, 401)
    ok("Order list protected correctly")


# ── Latest order ID ───────────────────────────────────────────────────────────

def test_admin_latest_order_id():
    section("GET /admin/orders/latest-id")

    resp = requests.get(f"{ADMIN_URL}/orders/latest-id", headers=admin_headers(_token))
    assert_status("Returns HTTP 200", resp, 200)

    data = resp.json()
    assert_key("Response has 'latest_order_id'", data, "latest_order_id")
    ok(f"latest_order_id = {data['latest_order_id']}")


# ── Status update ─────────────────────────────────────────────────────────────

def _create_test_order() -> int:
    """Create a fresh order and return its ID for update tests."""
    resp = requests.get(PRODS_URL, params={"page_size": 1})
    items = resp.json().get("items", [])
    if not items:
        fail("Setup", "No products in DB")
    product_id = items[0]["id"]

    resp = requests.post(ORDERS_URL, json={
        "full_name": "Admin Test Order",
        "phone": "+923009999888",
        "address": "Admin Test Street",
        "city": "Islamabad",
        "postal_code": "44000",
        "items": [{"product_id": product_id, "quantity": 1}],
    })
    assert_status("Create test order for admin tests", resp, 201)
    return resp.json()["order_id"]


def test_update_order_status():
    global _test_order_id
    section("PATCH /admin/orders/{id} — status update")

    _test_order_id = _create_test_order()

    for new_status in ("confirmed", "on_hold", "fulfilled", "cancelled", "pending"):
        resp = requests.patch(
            f"{ADMIN_URL}/orders/{_test_order_id}",
            headers=admin_headers(_token),
            json={"status": new_status},
        )
        assert_status(f"PATCH status={new_status} → HTTP 200", resp, 200)
        data = resp.json()
        if data["status"] == new_status:
            ok(f"Status updated to '{new_status}'")
        else:
            fail(f"Status not updated", f"expected {new_status!r}, got {data['status']!r}")


def test_update_order_status_invalid():
    section("PATCH /admin/orders/{id} — invalid status value")

    if not _test_order_id:
        warn("No test order — skipping")
        return

    resp = requests.patch(
        f"{ADMIN_URL}/orders/{_test_order_id}",
        headers=admin_headers(_token),
        json={"status": "eating_lunch"},
    )
    assert_status("Invalid status → HTTP 422", resp, 422)
    ok("Invalid status value rejected with 422")


def test_update_order_status_not_found():
    section("PATCH /admin/orders/999999 — not found")

    resp = requests.patch(
        f"{ADMIN_URL}/orders/999999",
        headers=admin_headers(_token),
        json={"status": "confirmed"},
    )
    assert_status("Non-existent order patch → HTTP 404", resp, 404)
    ok("Non-existent order PATCH correctly returns 404")


def test_update_order_status_no_auth():
    section("PATCH /admin/orders/{id} — no auth")

    if not _test_order_id:
        warn("No test order — skipping")
        return

    resp = requests.patch(
        f"{ADMIN_URL}/orders/{_test_order_id}",
        json={"status": "confirmed"},
    )
    assert_status("No token → HTTP 401", resp, 401)
    ok("Status update protected correctly")


# ── Details update (address + notes) ─────────────────────────────────────────

def test_update_order_details():
    section("PATCH /admin/orders/{id}/details — address + notes")

    if not _test_order_id:
        warn("No test order — skipping")
        return

    payload = {
        "address": "Updated Address by Admin Test",
        "notes": "Please call before delivery — automated test note",
    }
    resp = requests.patch(
        f"{ADMIN_URL}/orders/{_test_order_id}/details",
        headers=admin_headers(_token),
        json=payload,
    )
    assert_status("PATCH /details returns HTTP 200", resp, 200)

    data = resp.json()
    if data["address"] == payload["address"]:
        ok("Address updated correctly")
    else:
        fail("Address mismatch", f"{data['address']!r} != {payload['address']!r}")

    if data.get("notes") == payload["notes"]:
        ok("Notes updated correctly")
    else:
        fail("Notes mismatch", f"{data.get('notes')!r} != {payload['notes']!r}")


def test_update_order_details_partial():
    section("PATCH /admin/orders/{id}/details — notes only (partial update)")

    if not _test_order_id:
        warn("No test order — skipping")
        return

    # Only send notes, no address
    resp = requests.patch(
        f"{ADMIN_URL}/orders/{_test_order_id}/details",
        headers=admin_headers(_token),
        json={"notes": "Notes-only update"},
    )
    assert_status("Notes-only partial update → HTTP 200", resp, 200)
    data = resp.json()
    if data.get("notes") == "Notes-only update":
        ok("Notes-only update works")
    else:
        fail("Notes not updated in partial update", str(data.get("notes")))


def test_update_order_details_not_found():
    section("PATCH /admin/orders/999999/details — not found")

    resp = requests.patch(
        f"{ADMIN_URL}/orders/999999/details",
        headers=admin_headers(_token),
        json={"notes": "Ghost note"},
    )
    assert_status("Non-existent order details patch → HTTP 404", resp, 404)
    ok("Non-existent order details PATCH returns 404")


def test_update_order_details_no_auth():
    section("PATCH /admin/orders/{id}/details — no auth")

    if not _test_order_id:
        warn("No test order — skipping")
        return

    resp = requests.patch(
        f"{ADMIN_URL}/orders/{_test_order_id}/details",
        json={"notes": "Unauthorized note"},
    )
    assert_status("No token → HTTP 401", resp, 401)
    ok("Details update protected correctly")


# ── Health check ──────────────────────────────────────────────────────────────

def test_health_check():
    section("GET /health")

    resp = requests.get("http://localhost:8000/health")
    assert_status("Returns HTTP 200", resp, 200)

    data = resp.json()
    assert_key("Response has 'status'", data, "status")
    assert_key("Response has 'version'", data, "version")

    if data["status"] == "healthy":
        ok("status='healthy'")
    else:
        fail("Health check", f"status={data['status']!r}")


# ── Runner ────────────────────────────────────────────────────────────────────

def run():
    print(f"\n{'-'*60}")
    print("  ADMIN ENDPOINT TESTS")
    print(f"{'-'*60}")

    # Auth
    test_login_valid()
    test_login_wrong_password()
    test_login_wrong_email()
    test_login_missing_fields()
    test_verify_valid_token()
    test_verify_no_token()
    test_verify_bad_token()

    # Stats
    test_admin_stats()
    test_admin_stats_no_auth()

    # Order list
    test_admin_list_orders_default()
    test_admin_list_orders_filters()
    test_admin_list_orders_search()
    test_admin_list_orders_today()
    test_admin_list_orders_pagination()
    test_admin_list_orders_no_auth()

    # Latest ID
    test_admin_latest_order_id()

    # Status update
    test_update_order_status()
    test_update_order_status_invalid()
    test_update_order_status_not_found()
    test_update_order_status_no_auth()

    # Details update
    test_update_order_details()
    test_update_order_details_partial()
    test_update_order_details_not_found()
    test_update_order_details_no_auth()

    # Health
    test_health_check()

    print(f"\n{'='*60}")
    print("  ✅  All admin tests PASSED")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    run()
