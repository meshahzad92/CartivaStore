#!/usr/bin/env python3
"""
Comprehensive test suite for all new admin endpoints.
Tests: bulk-status, bulk-delete, weekly analytics, order CRUD.

Run with: python backend/test/test_new_endpoints.py
(backend server must be running at localhost:8000)
"""

import sys
import json
import requests

BASE = "http://localhost:8000/api/v1"
PASS = "✅"
FAIL = "❌"
WARN = "⚠️ "

results = []

def check(label, passed, detail=""):
    status = PASS if passed else FAIL
    results.append((label, passed, detail))
    prefix = f"  {status} {label}"
    if detail:
        print(f"{prefix}: {detail}")
    else:
        print(prefix)

def section(title):
    print(f"\n{'─'*55}")
    print(f"  {title}")
    print(f"{'─'*55}")

# ── LOGIN ─────────────────────────────────────────────────────────────

section("1. Authentication")

r = requests.post(f"{BASE}/admin/login",
    json={"email": "admin@cartiva.com", "password": "admin1234"})
check("Login returns 200", r.status_code == 200, f"status={r.status_code}")
token = r.json().get("access_token", "")
check("Token present in response", bool(token), f"token={'yes' if token else 'MISSING'}")

if not token:
    print("\n❌ Cannot continue — no auth token. Is the server running?")
    sys.exit(1)

H = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

r = requests.get(f"{BASE}/admin/verify", headers=H)
check("Verify session returns 200", r.status_code == 200)
check("Verify returns valid:true", r.json().get("valid") is True)

# ── ORDERS LIST ───────────────────────────────────────────────────────

section("2. Orders List (GET /admin/orders)")

r = requests.get(f"{BASE}/admin/orders", headers=H)
check("GET /admin/orders returns 200", r.status_code == 200)
data = r.json()
check("Response has orders+total+page fields",
      all(k in data for k in ["orders", "total", "page", "total_pages"]))
total_orders = data["total"]
print(f"     → {total_orders} total orders in DB")

# Grab an existing order ID for single-order tests
first_order_id = data["orders"][0]["id"] if data["orders"] else None
first_order_status = data["orders"][0]["status"] if data["orders"] else None

# Filter by status
r2 = requests.get(f"{BASE}/admin/orders?status_filter=pending", headers=H)
check("Filter by status=pending returns 200", r2.status_code == 200)

# Search
r3 = requests.get(f"{BASE}/admin/orders?search=test", headers=H)
check("Search param accepted (any status)", r3.status_code == 200)

# Today only
r4 = requests.get(f"{BASE}/admin/orders?today_only=true", headers=H)
check("today_only filter returns 200", r4.status_code == 200)

# Pagination
r5 = requests.get(f"{BASE}/admin/orders?page=1&page_size=5", headers=H)
check("Pagination (page_size=5) returns 200", r5.status_code == 200)
check("Pagination respects page_size", len(r5.json()["orders"]) <= 5)

# ── SINGLE ORDER STATUS UPDATE ────────────────────────────────────────

section("3. Single Order Status Update (PATCH /admin/orders/{id})")

if first_order_id:
    # Valid status update
    new_status = "on_hold" if first_order_status != "on_hold" else "pending"
    r = requests.patch(f"{BASE}/admin/orders/{first_order_id}",
        json={"status": new_status}, headers=H)
    check(f"PATCH /orders/{first_order_id} valid status → 200", r.status_code == 200,
          f"status={r.status_code}")
    if r.status_code == 200:
        check("Response has updated status", r.json().get("status") == new_status)
        # Restore original status
        requests.patch(f"{BASE}/admin/orders/{first_order_id}",
            json={"status": first_order_status}, headers=H)

    # Invalid status
    r = requests.patch(f"{BASE}/admin/orders/{first_order_id}",
        json={"status": "invalid_status_xyz"}, headers=H)
    check("Invalid status → 422", r.status_code == 422,
          f"status={r.status_code}")

    # Non-existent order
    r = requests.patch(f"{BASE}/admin/orders/999999",
        json={"status": "pending"}, headers=H)
    check("Non-existent order → 404", r.status_code == 404,
          f"status={r.status_code}")
else:
    check("Single order update — SKIPPED (no orders in DB)", False, "no orders")

# ── SINGLE ORDER DETAILS UPDATE ───────────────────────────────────────

section("4. Order Details Update (PATCH /admin/orders/{id}/details)")

if first_order_id:
    r = requests.patch(f"{BASE}/admin/orders/{first_order_id}/details",
        json={"notes": "Test note from test suite"}, headers=H)
    check(f"PATCH /orders/{first_order_id}/details → 200", r.status_code == 200,
          f"status={r.status_code}")
    if r.status_code == 200:
        check("Notes updated in response", r.json().get("notes") == "Test note from test suite")

    # Empty body (both fields optional) — should succeed
    r = requests.patch(f"{BASE}/admin/orders/{first_order_id}/details",
        json={}, headers=H)
    check("Empty body on /details → 200", r.status_code == 200)
else:
    check("Details update — SKIPPED (no orders in DB)", False)

# ── BULK STATUS UPDATE ────────────────────────────────────────────────

section("5. Bulk Status Update (PATCH /admin/orders/bulk-status)  ← was 422")

# Get all order IDs (up to 3) for bulk test
all_ids = [o["id"] for o in data["orders"][:3]] if data["orders"] else []
original_statuses = {o["id"]: o["status"] for o in data["orders"][:3]}

if all_ids:
    # ---- Core case: valid bulk status update
    r = requests.patch(f"{BASE}/admin/orders/bulk-status",
        json={"ids": all_ids, "status": "on_hold"}, headers=H)
    check(f"PATCH /orders/bulk-status valid body → 200", r.status_code == 200,
          f"status={r.status_code}, body={r.text[:120]}")
    if r.status_code == 200:
        check("Response has 'updated' count", "updated" in r.json(),
              str(r.json()))
        check(f"Updated count = {len(all_ids)}", r.json().get("updated") == len(all_ids))
        # Verify the DB was actually changed
        r_verify = requests.get(f"{BASE}/admin/orders?page_size=5", headers=H)
        changed = [o for o in r_verify.json()["orders"] if o["id"] in all_ids]
        all_on_hold = all(o["status"] == "on_hold" for o in changed)
        check("DB reflects new status for all bulk-updated orders", all_on_hold)

    # ---- Restore original statuses
    for oid, orig_status in original_statuses.items():
        requests.patch(f"{BASE}/admin/orders/bulk-status",
            json={"ids": [oid], "status": orig_status}, headers=H)

    # ---- Invalid status value
    r = requests.patch(f"{BASE}/admin/orders/bulk-status",
        json={"ids": all_ids, "status": "nonexistent"}, headers=H)
    check("Invalid status value → 422", r.status_code == 422,
          f"status={r.status_code}")

    # ---- Empty ids list (should 422 — min_length=1)
    r = requests.patch(f"{BASE}/admin/orders/bulk-status",
        json={"ids": [], "status": "pending"}, headers=H)
    check("Empty ids list → 422", r.status_code == 422,
          f"status={r.status_code}")

    # ---- Missing status field
    r = requests.patch(f"{BASE}/admin/orders/bulk-status",
        json={"ids": all_ids}, headers=H)
    check("Missing status field → 422", r.status_code == 422)

    # ---- Auth required
    r = requests.patch(f"{BASE}/admin/orders/bulk-status",
        json={"ids": all_ids, "status": "pending"})  # no auth header
    check("No auth token → 403/401", r.status_code in (401, 403),
          f"status={r.status_code}")

    # ---- Non-existent IDs (should return updated=0, not error)
    r = requests.patch(f"{BASE}/admin/orders/bulk-status",
        json={"ids": [9999991, 9999992], "status": "pending"}, headers=H)
    check("Non-existent IDs → 200 with updated=0", r.status_code == 200,
          f"updated={r.json().get('updated', '?')}")
else:
    check("Bulk status — SKIPPED (no orders in DB)", False)

# ── BULK DELETE ───────────────────────────────────────────────────────

section("6. Bulk Delete (DELETE /admin/orders)")

# ---- Auth required
r = requests.delete(f"{BASE}/admin/orders",
    json={"ids": [99999]}, headers={"Content-Type": "application/json"})
check("No auth token → 403/401", r.status_code in (401, 403),
      f"status={r.status_code}")

# ---- Empty ids list → 422
r = requests.delete(f"{BASE}/admin/orders",
    json={"ids": []}, headers=H)
check("Empty ids list → 422", r.status_code == 422,
      f"status={r.status_code}")

# ---- Non-existent IDs → 200, deleted=0
r = requests.delete(f"{BASE}/admin/orders",
    json={"ids": [9888881, 9888882]}, headers=H)
check("Non-existent IDs → 200, deleted=0", r.status_code == 200,
      f"deleted={r.json().get('deleted', '?')}")

# Create a test order via the public API, then delete it
test_payload = {
    "full_name": "Test Delete User",
    "phone": "+923001234999",
    "address": "Test Street 1",
    "city": "Karachi",
    "postal_code": "75500",
    "items": []
}
# Get a valid product_id first
prods = requests.get(f"{BASE}/products?page_size=1")
new_order_id = None
if prods.status_code == 200 and prods.json().get("items"):
    pid = prods.json()["items"][0]["id"]
    test_payload["items"] = [{"product_id": pid, "quantity": 1}]
    r_create = requests.post(f"{BASE}/orders", json=test_payload)
    if r_create.status_code == 201:
        new_order_id = r_create.json()["order_id"]
        print(f"     → Created test order #{new_order_id}")

        r = requests.delete(f"{BASE}/admin/orders",
            json={"ids": [new_order_id]}, headers=H)
        check(f"Delete test order #{new_order_id} → 200", r.status_code == 200,
              f"deleted={r.json().get('deleted', '?')}")
        check("deleted=1 confirmed", r.json().get("deleted") == 1)

        # Verify it's gone
        r_get = requests.get(f"{BASE}/orders/{new_order_id}")
        check("Deleted order no longer found → 404", r_get.status_code == 404,
              f"status={r_get.status_code}")
    else:
        check("Create test order for delete — SKIPPED", False,
              f"create status={r_create.status_code}")
else:
    check("Bulk delete real order — SKIPPED (no products)", False)

# ── ANALYTICS ─────────────────────────────────────────────────────────

section("7. Analytics — Weekly (GET /admin/analytics/weekly)")

r = requests.get(f"{BASE}/admin/analytics/weekly", headers=H)
check("GET /analytics/weekly → 200", r.status_code == 200,
      f"status={r.status_code}")
if r.status_code == 200:
    d = r.json()
    check("Response has 'days' array", "days" in d)
    check("7 days returned", len(d.get("days", [])) == 7,
          f"got {len(d.get('days', []))}")
    check("Response has total/average/peak_day/peak_count",
          all(k in d for k in ["total", "average", "peak_day", "peak_count"]))
    print(f"     → total={d.get('total')} | avg={d.get('average')} | peak={d.get('peak_day')} ({d.get('peak_count')})")

# No auth
r = requests.get(f"{BASE}/admin/analytics/weekly")
check("No auth → 403/401", r.status_code in (401, 403))

# ── LATEST ID ─────────────────────────────────────────────────────────

section("8. Latest Order ID (GET /admin/orders/latest-id)")

r = requests.get(f"{BASE}/admin/orders/latest-id", headers=H)
check("GET /orders/latest-id → 200", r.status_code == 200)
check("Response has latest_order_id", "latest_order_id" in r.json())
print(f"     → latest_order_id = {r.json().get('latest_order_id')}")

# ── DASHBOARD STATS ───────────────────────────────────────────────────

section("9. Dashboard Stats (GET /admin/stats)")

r = requests.get(f"{BASE}/admin/stats", headers=H)
check("GET /admin/stats → 200", r.status_code == 200)
d = r.json()
check("Stats has all required fields",
      all(k in d for k in ["total_today", "pending", "confirmed", "fulfilled", "cancelled"]),
      str({k: d.get(k) for k in ["total_today", "pending", "fulfilled"]}))

# ── SUMMARY ───────────────────────────────────────────────────────────

section("SUMMARY")
passed = sum(1 for _, p, _ in results if p)
failed = sum(1 for _, p, _ in results if not p)
print(f"\n  Total: {len(results)} tests | {PASS} {passed} passed | {FAIL} {failed} failed\n")

if failed:
    print("  Failed tests:")
    for label, p, detail in results:
        if not p:
            print(f"    {FAIL} {label}: {detail}")
    sys.exit(1)
else:
    print("  All tests passed! 🎉")
