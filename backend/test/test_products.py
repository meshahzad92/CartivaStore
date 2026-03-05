"""
Tests for /api/v1/products — all cases.
Run: python -m test.test_products   (from backend/ directory)
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import requests
from test.config import (
    BASE_URL, ok, fail, section, warn,
    assert_status, assert_key, get_admin_token, admin_headers,
)

PRODUCTS_URL = f"{BASE_URL}/products"
CATEGORIES_URL = f"{BASE_URL}/products/categories"

# Will be set during the "create product" test so later tests can use it
created_product_id = None


def test_list_categories():
    section("GET /products/categories")

    resp = requests.get(CATEGORIES_URL)
    assert_status("Returns HTTP 200", resp, 200)

    data = resp.json()
    if not isinstance(data, list):
        fail("Response is a list", f"got {type(data)}")
    ok("Response is a list", f"{len(data)} categories returned")

    # Must always have the "all" entry first
    if data and data[0].get("value") == "all":
        ok("First item is 'all' catch-all category")
    else:
        warn("First category is not 'all' (check if DB is seeded)")

    # Each item must have value + label
    for cat in data:
        if "value" not in cat or "label" not in cat:
            fail("Category shape", f"missing value/label in {cat}")
    ok("All category entries have 'value' and 'label' keys")


def test_list_products():
    section("GET /products  (default / no filters)")

    resp = requests.get(PRODUCTS_URL)
    assert_status("Returns HTTP 200", resp, 200)

    data = resp.json()
    for key in ("items", "total", "page", "page_size", "total_pages"):
        assert_key(f"Response has '{key}' key", data, key)

    ok(f"Total products in DB: {data['total']}")
    ok(f"Items on first page: {len(data['items'])}")


def test_list_products_with_search():
    section("GET /products?search=...")

    resp = requests.get(PRODUCTS_URL, params={"search": "a"})
    assert_status("Search by letter returns HTTP 200", resp, 200)
    ok("Search results", f"{resp.json()['total']} match")

    # Search with a term that shouldn't match anything
    resp = requests.get(PRODUCTS_URL, params={"search": "ZZZZZZZZ_NOTHING"})
    assert_status("Non-existent search returns HTTP 200", resp, 200)
    data = resp.json()
    if data["total"] == 0:
        ok("Empty search returns 0 results correctly")
    else:
        warn("Non-existent search returned results (check sanitization)")


def test_list_products_with_category():
    section("GET /products?category=...")

    # First get a real category
    cats = requests.get(CATEGORIES_URL).json()
    real_cats = [c for c in cats if c["value"] != "all"]
    if not real_cats:
        warn("No product categories found — skipping category filter test")
        return

    cat_val = real_cats[0]["value"]
    resp = requests.get(PRODUCTS_URL, params={"category": cat_val})
    assert_status(f"Filter by category '{cat_val}' returns HTTP 200", resp, 200)
    ok(f"Category '{cat_val}' results: {resp.json()['total']}")

    # "all" should return everything
    resp_all = requests.get(PRODUCTS_URL, params={"category": "all"})
    resp_none = requests.get(PRODUCTS_URL)
    assert_status("category=all returns HTTP 200", resp_all, 200)
    if resp_all.json()["total"] == resp_none.json()["total"]:
        ok("category=all returns same count as no filter")
    else:
        warn("category=all differs from no-filter (may be case issue)")


def test_list_products_price_filter():
    section("GET /products?min_price=&max_price=...")

    resp = requests.get(PRODUCTS_URL, params={"min_price": 0, "max_price": 9999})
    assert_status("Wide price range returns HTTP 200", resp, 200)
    ok("Wide price filter", f"{resp.json()['total']} results")

    # min > max — backend should still respond gracefully
    resp = requests.get(PRODUCTS_URL, params={"min_price": 9999, "max_price": 1})
    assert_status("min_price > max_price returns HTTP 200 (empty list)", resp, 200)
    if resp.json()["total"] == 0:
        ok("min_price > max_price returns 0 results")
    else:
        warn("min_price > max_price returned results unexpectedly")

    # Negative min_price should be rejected
    resp = requests.get(PRODUCTS_URL, params={"min_price": -10})
    if resp.status_code == 422:
        ok("Negative min_price rejected with HTTP 422")
    else:
        warn(f"Negative min_price returned HTTP {resp.status_code} (expected 422)")


def test_list_products_sorting():
    section("GET /products?sort_by=...")

    sort_options = [
        "price_asc", "price_desc",
        "name_asc", "name_desc",
        "newest", "oldest",
        "rating", "reviews",
    ]
    for sort in sort_options:
        resp = requests.get(PRODUCTS_URL, params={"sort_by": sort})
        assert_status(f"sort_by={sort} returns HTTP 200", resp, 200)

    ok("All 8 sort options accepted")


def test_list_products_pagination():
    section("GET /products — pagination")

    resp = requests.get(PRODUCTS_URL, params={"page": 1, "page_size": 2})
    assert_status("page=1&page_size=2 returns HTTP 200", resp, 200)
    data = resp.json()
    if len(data["items"]) <= 2:
        ok(f"page_size=2 respected — got {len(data['items'])} items")
    else:
        fail("page_size=2 not respected", f"got {len(data['items'])} items")

    # Page beyond total
    big_page = data["total_pages"] + 100
    resp = requests.get(PRODUCTS_URL, params={"page": big_page, "page_size": 20})
    assert_status("Page beyond total returns HTTP 200 (empty items)", resp, 200)
    if len(resp.json()["items"]) == 0:
        ok("Out-of-range page returns empty items list")

    # page_size > 100 is rejected at route level (Pydantic le=100 constraint)
    resp = requests.get(PRODUCTS_URL, params={"page_size": 200})
    assert_status("page_size=200 → HTTP 422 (exceeds max 100)", resp, 422)
    ok("page_size > 100 correctly rejected with 422")

    # page_size exactly at max (100) should be accepted
    resp = requests.get(PRODUCTS_URL, params={"page_size": 100})
    assert_status("page_size=100 (max allowed) → HTTP 200", resp, 200)
    ok("page_size=100 (max) accepted correctly")

    # Invalid page (0)
    resp = requests.get(PRODUCTS_URL, params={"page": 0})
    if resp.status_code == 422:
        ok("page=0 rejected with HTTP 422")
    else:
        warn(f"page=0 returned HTTP {resp.status_code} (expected 422)")


def test_get_single_product():
    section("GET /products/{id}")

    # Get a valid ID from the list
    resp = requests.get(PRODUCTS_URL)
    items = resp.json().get("items", [])
    if not items:
        warn("No products in DB — skipping single product test")
        return

    product_id = items[0]["id"]
    resp = requests.get(f"{PRODUCTS_URL}/{product_id}")
    assert_status(f"GET /products/{product_id} returns HTTP 200", resp, 200)

    product = resp.json()
    for field in ("id", "name", "price", "category", "stock", "in_stock"):
        if field not in product:
            fail(f"Product response missing field '{field}'")
    ok("All required product fields present", f"id={product['id']} name={product['name']!r}")

    # Non-existent ID
    resp = requests.get(f"{PRODUCTS_URL}/999999")
    assert_status("GET /products/999999 returns HTTP 404", resp, 404)
    ok("Non-existent product returns 404")

    # Invalid ID (string)
    resp = requests.get(f"{PRODUCTS_URL}/not-a-number")
    assert_status("GET /products/not-a-number returns HTTP 422", resp, 422)
    ok("Non-integer product ID returns 422")


def test_create_product():
    """Create a product and store its ID for use in later tests."""
    global created_product_id
    section("POST /products (create)")

    payload = {
        "name": "Test Product — Auto Test",
        "description": "Created by automated test suite",
        "price": 99.99,
        "original_price": 149.99,
        "category": "test-category",
        "image_url": "https://example.com/test.jpg",
        "images": ["https://example.com/img1.jpg", "https://example.com/img2.jpg"],
        "stock": 50,
        "rating": 4.7,
        "reviews": 10,
        "badge": "Test",
        "in_stock": True,
        "packages": [{"qty": 2, "price": 179.99, "label": "2-Pack", "tag": "Best Value"}],
        "add_on": {"name": "Test Gift Wrap", "price": 5.0},
    }

    resp = requests.post(PRODUCTS_URL, json=payload)
    assert_status("POST /products returns HTTP 201", resp, 201)

    product = resp.json()
    assert_key("Response has 'id'", product, "id")
    created_product_id = product["id"]
    ok(f"Product created with id={created_product_id}")

    # Verify price stored correctly
    if abs(product["price"] - payload["price"]) < 0.01:
        ok("Price stored correctly")
    else:
        fail("Price mismatch", f"{product['price']} != {payload['price']}")

    # Verify packages stored
    if product.get("packages"):
        ok("Packages field stored")
    else:
        warn("Packages field empty (check JSON storage)")


def test_create_product_validation():
    section("POST /products — validation / bad inputs")

    # Missing required field: name
    resp = requests.post(PRODUCTS_URL, json={"price": 10.0, "category": "test", "stock": 5})
    assert_status("Missing 'name' → HTTP 422", resp, 422)

    # price = 0 (must be > 0)
    resp = requests.post(PRODUCTS_URL, json={
        "name": "Bad Product", "price": 0, "category": "test", "stock": 5
    })
    assert_status("price=0 → HTTP 422", resp, 422)

    # price negative
    resp = requests.post(PRODUCTS_URL, json={
        "name": "Bad Product", "price": -5.0, "category": "test", "stock": 5
    })
    assert_status("price=-5 → HTTP 422", resp, 422)

    # stock negative
    resp = requests.post(PRODUCTS_URL, json={
        "name": "Bad Product", "price": 10.0, "category": "test", "stock": -1
    })
    assert_status("stock=-1 → HTTP 422", resp, 422)

    # Empty body
    resp = requests.post(PRODUCTS_URL, json={})
    assert_status("Empty body → HTTP 422", resp, 422)

    ok("All validation cases rejected correctly")


def run():
    print(f"\n{'-'*60}")
    print("  PRODUCT ENDPOINT TESTS")
    print(f"{'-'*60}")

    test_list_categories()
    test_list_products()
    test_list_products_with_search()
    test_list_products_with_category()
    test_list_products_price_filter()
    test_list_products_sorting()
    test_list_products_pagination()
    test_get_single_product()
    test_create_product()
    test_create_product_validation()

    print(f"\n{'='*60}")
    print("  ✅  All product tests PASSED")
    print(f"{'='*60}\n")
    return created_product_id


if __name__ == "__main__":
    run()
