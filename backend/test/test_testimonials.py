"""
Tests for /api/v1/testimonials — all cases.
Run: python -m test.test_testimonials   (from backend/ directory)
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import requests
from test.config import (
    BASE_URL, ok, fail, section, warn,
    assert_status, assert_key,
)

TESTIMONIALS_URL = f"{BASE_URL}/testimonials"


def test_list_testimonials():
    section("GET /testimonials")

    resp = requests.get(TESTIMONIALS_URL)
    assert_status("Returns HTTP 200", resp, 200)

    data = resp.json()
    if not isinstance(data, list):
        fail("Response is a list", f"got {type(data)}")
    ok(f"Returns a list — {len(data)} testimonials")

    if data:
        first = data[0]
        for field in ("id", "name", "message", "rating", "created_at"):
            if field not in first:
                fail(f"Testimonial missing field '{field}'", str(first))
        ok("All required fields present in testimonial object")


def test_create_testimonial():
    section("POST /testimonials — valid submission")

    payload = {"name": "Test User", "message": "Amazing product! Auto-test.", "rating": 5}
    resp = requests.post(TESTIMONIALS_URL, json=payload)
    assert_status("POST /testimonials returns HTTP 201", resp, 201)

    data = resp.json()
    assert_key("Response has 'id'", data, "id")
    assert_key("Response has 'name'", data, "name")
    assert_key("Response has 'message'", data, "message")
    assert_key("Response has 'rating'", data, "rating")

    if data["rating"] == payload["rating"]:
        ok("Rating stored correctly")
    else:
        fail("Rating mismatch", f"{data['rating']} != {payload['rating']}")

    if data["name"] == payload["name"]:
        ok("Name stored correctly")

    ok(f"Testimonial created with id={data['id']}")


def test_create_testimonial_validation():
    section("POST /testimonials — validation / bad inputs")

    # Missing name
    resp = requests.post(TESTIMONIALS_URL, json={"message": "Great!", "rating": 4})
    assert_status("Missing 'name' → HTTP 422", resp, 422)

    # Missing message
    resp = requests.post(TESTIMONIALS_URL, json={"name": "Joe", "rating": 4})
    assert_status("Missing 'message' → HTTP 422", resp, 422)

    # Missing rating
    resp = requests.post(TESTIMONIALS_URL, json={"name": "Joe", "message": "Good"})
    assert_status("Missing 'rating' → HTTP 422", resp, 422)

    # Empty body
    resp = requests.post(TESTIMONIALS_URL, json={})
    assert_status("Empty body → HTTP 422", resp, 422)

    ok("All testimonial validation cases rejected correctly")


def test_list_testimonials_is_ordered():
    section("GET /testimonials — ordering (newest first)")

    resp = requests.get(TESTIMONIALS_URL)
    data = resp.json()

    if len(data) >= 2:
        from datetime import datetime
        dates = [d["created_at"] for d in data]
        parsed = [datetime.fromisoformat(d.replace("Z", "+00:00")) for d in dates]
        if parsed == sorted(parsed, reverse=True):
            ok("Testimonials ordered newest-first")
        else:
            fail("Testimonials not ordered newest-first")
    else:
        warn("Not enough testimonials to verify ordering")


def run():
    print(f"\n{'-'*60}")
    print("  TESTIMONIAL ENDPOINT TESTS")
    print(f"{'-'*60}")

    test_list_testimonials()
    test_create_testimonial()
    test_create_testimonial_validation()
    test_list_testimonials_is_ordered()

    print(f"\n{'='*60}")
    print("  ✅  All testimonial tests PASSED")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    run()
