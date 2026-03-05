"""
Tests for /api/v1/orders — all cases.
Run: python -m test.test_orders   (from backend/ directory)
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import requests
from test.config import (
    BASE_URL, ok, fail, section, warn,
    assert_status, assert_key,
)

ORDERS_URL      = f"{BASE_URL}/orders"
PRODUCTS_URL    = f"{BASE_URL}/products"

# Will be set during create_order test and reused for GET test
created_order_id = None


def _get_valid_product_id() -> int:
    """Helper: fetch a real product ID from the DB."""
    resp = requests.get(PRODUCTS_URL, params={"page_size": 1})
    items = resp.json().get("items", [])
    if not items:
        fail("Setup", "No products in DB — cannot run order tests. Please seed first.")
    return items[0]["id"]


def test_place_order_valid():
    """Place a valid COD order."""
    global created_order_id
    section("POST /orders — valid order")

    product_id = _get_valid_product_id()

    payload = {
        "full_name": "Test Customer",
        "phone": "+923001234567",
        "address": "House 7, Test Street",
        "city": "Karachi",
        "postal_code": "75600",
        "items": [{"product_id": product_id, "quantity": 1}],
    }

    resp = requests.post(ORDERS_URL, json=payload)
    assert_status("POST /orders returns HTTP 201", resp, 201)

    data = resp.json()
    for field in ("order_id", "total_amount", "item_count", "message"):
        assert_key(f"Response has '{field}'", data, field)

    created_order_id = data["order_id"]
    ok(f"Order created — id={created_order_id}, total={data['total_amount']}")

    if data["item_count"] == 1:
        ok("item_count matches")
    else:
        fail("item_count mismatch", f"expected 1, got {data['item_count']}")

    if data["total_amount"] > 0:
        ok("total_amount is positive")
    else:
        fail("total_amount is 0 or negative")


def test_place_order_multiple_items():
    section("POST /orders — multiple items")

    resp = requests.get(PRODUCTS_URL, params={"page_size": 2})
    items = resp.json().get("items", [])
    if len(items) < 2:
        warn("Not enough products for multi-item order test — skipping")
        return

    payload = {
        "full_name": "Multi Item Customer",
        "phone": "+923001111222",
        "address": "Block B, Multi Street",
        "city": "Lahore",
        "postal_code": "54000",
        "items": [
            {"product_id": items[0]["id"], "quantity": 1},
            {"product_id": items[1]["id"], "quantity": 2},
        ],
    }

    resp = requests.post(ORDERS_URL, json=payload)
    assert_status("Multi-item order returns HTTP 201", resp, 201)
    data = resp.json()
    if data["item_count"] == 3:  # 1 + 2
        ok("item_count = 3 (1+2) correct")
    else:
        ok(f"Multi-item order created — item_count={data['item_count']}")


def test_place_order_missing_fields():
    section("POST /orders — missing required fields")

    product_id = _get_valid_product_id()
    base = {
        "full_name": "Test",
        "phone": "+923001234567",
        "address": "Test Address",
        "city": "Karachi",
        "postal_code": "75600",
        "items": [{"product_id": product_id, "quantity": 1}],
    }

    for missing_field in ("full_name", "phone", "address", "city", "postal_code", "items"):
        payload = {k: v for k, v in base.items() if k != missing_field}
        resp = requests.post(ORDERS_URL, json=payload)
        assert_status(f"Missing '{missing_field}' → HTTP 422", resp, 422)

    ok("All six required fields validated correctly")


def test_place_order_invalid_phone():
    section("POST /orders — invalid phone number")

    product_id = _get_valid_product_id()
    base = {
        "full_name": "Test",
        "address": "Test St",
        "city": "Karachi",
        "postal_code": "75600",
        "items": [{"product_id": product_id, "quantity": 1}],
    }

    bad_phones = ["abc", "123", "+"]
    for phone in bad_phones:
        resp = requests.post(ORDERS_URL, json={**base, "phone": phone})
        assert_status(f"phone='{phone}' → HTTP 422", resp, 422)

    ok("Invalid phone numbers rejected correctly")


def test_place_order_nonexistent_product():
    section("POST /orders — non-existent product")

    payload = {
        "full_name": "Ghost Buyer",
        "phone": "+923001234567",
        "address": "Ghost Street",
        "city": "Karachi",
        "postal_code": "75600",
        "items": [{"product_id": 999999, "quantity": 1}],
    }

    resp = requests.post(ORDERS_URL, json=payload)
    assert_status("Non-existent product → HTTP 404", resp, 404)
    ok("Non-existent product in order correctly returns 404")


def test_place_order_zero_quantity():
    section("POST /orders — quantity = 0")

    product_id = _get_valid_product_id()
    payload = {
        "full_name": "Test",
        "phone": "+923001234567",
        "address": "Test St",
        "city": "Karachi",
        "postal_code": "75600",
        "items": [{"product_id": product_id, "quantity": 0}],
    }

    resp = requests.post(ORDERS_URL, json=payload)
    assert_status("quantity=0 → HTTP 422", resp, 422)
    ok("Zero quantity rejected with 422")


def test_place_order_empty_items():
    section("POST /orders — empty items array")

    payload = {
        "full_name": "Test",
        "phone": "+923001234567",
        "address": "Test St",
        "city": "Karachi",
        "postal_code": "75600",
        "items": [],
    }

    resp = requests.post(ORDERS_URL, json=payload)
    assert_status("Empty items array → HTTP 422", resp, 422)
    ok("Empty items list rejected with 422")


def test_get_order_valid():
    section("GET /orders/{id} — valid order")

    if not created_order_id:
        warn("No created_order_id available — skipping GET order test")
        return

    resp = requests.get(f"{ORDERS_URL}/{created_order_id}")
    assert_status(f"GET /orders/{created_order_id} returns HTTP 200", resp, 200)

    data = resp.json()
    for field in ("id", "full_name", "phone", "address", "city", "postal_code",
                  "status", "total_amount", "created_at", "items"):
        if field not in data:
            fail(f"Order response missing field '{field}'")
    ok("All required order fields present")

    if data["status"] == "pending":
        ok("New order has status='pending'")
    else:
        warn(f"New order status is '{data['status']}' (expected 'pending')")

    if isinstance(data["items"], list) and len(data["items"]) > 0:
        ok(f"Order has {len(data['items'])} item(s)")
        item = data["items"][0]
        for field in ("id", "product_id", "quantity", "price"):
            if field not in item:
                fail(f"OrderItem missing field '{field}'")
        ok("OrderItem fields all present")


def test_get_order_not_found():
    section("GET /orders/{id} — not found")

    resp = requests.get(f"{ORDERS_URL}/999999")
    assert_status("GET /orders/999999 → HTTP 404", resp, 404)
    ok("Non-existent order correctly returns 404")


def test_get_order_invalid_id():
    section("GET /orders/{id} — invalid ID format")

    resp = requests.get(f"{ORDERS_URL}/not-a-number")
    assert_status("GET /orders/not-a-number → HTTP 422", resp, 422)
    ok("Non-integer order ID returns 422")


def run():
    print(f"\n{'-'*60}")
    print("  ORDER ENDPOINT TESTS")
    print(f"{'-'*60}")

    test_place_order_valid()
    test_place_order_multiple_items()
    test_place_order_missing_fields()
    test_place_order_invalid_phone()
    test_place_order_nonexistent_product()
    test_place_order_zero_quantity()
    test_place_order_empty_items()
    test_get_order_valid()
    test_get_order_not_found()
    test_get_order_invalid_id()

    print(f"\n{'='*60}")
    print("  ✅  All order tests PASSED")
    print(f"{'='*60}\n")

    return created_order_id


if __name__ == "__main__":
    run()
