import requests
import json
import os

API_BASE = "http://localhost:8000/api/v1"
ADMIN_EMAIL = "admin@cartiva.com"
ADMIN_PASSWORD = "admin1234"
IMAGE_PATH = "/home/shahzad/SHAHZAD/CartivaStoreSiteBuilding/backend/test/legwarmer.jpg"

def run_test():
    print("--- Starting End-to-End Product API Test ---")
    
    # 1. Login
    print("\n1. Logging in as Admin...")
    res = requests.post(f"{API_BASE}/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if res.status_code != 200:
        print("Login failed:", res.text)
        return
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Login successful.")

    # 2. Upload Image
    print("\n2. Uploading Test Image...")
    if not os.path.exists(IMAGE_PATH):
        print(f"Image not found at {IMAGE_PATH}")
        return
        
    with open(IMAGE_PATH, "rb") as f:
        files = {"file": ("legwarmer.jpg", f, "image/jpeg")}
        # Don't pass Content-Type header so requests sets multipart boundary automatically
        res = requests.post(f"{API_BASE}/admin/products/upload-image", headers=headers, files=files)
        
    if res.status_code != 201:
        print("Image upload failed:", res.text)
        return
        
    image_url = res.json()["url"]
    print(f"Image uploaded successfully! URL: {image_url}")

    # 3. Create Product
    print("\n3. Creating New Product...")
    payload = {
        "name": "E2E Test Legwarmers",
        "description": "<p>A cozy test product.</p>",
        "status": "active",
        "weight_kg": 0.5,
        "vendor": "TestVendor",
        "product_type": "Accessories",
        "organization": "TestOrg",
        "seo_title": "Buy Legwarmers",
        "seo_desc": "Best legwarmers",
        "tags": ["test", "automation", "winter"],
        "price": 1200,
        "original_price": 1500,
        "category": "Clothing",
        "image_url": image_url,
        "images": [image_url],
        "stock": 50
    }
    res = requests.post(f"{API_BASE}/admin/products", headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"}, json=payload)
    if res.status_code != 201:
        print("Product creation failed:", res.text)
        return
        
    product_id = res.json()["id"]
    print(f"Product created successfully! ID: {product_id}")

    # 4. Fetch Products to Verify
    print("\n4. Verifying Product exists in database...")
    res = requests.get(f"{API_BASE}/admin/products?search=E2E Test Legwarmers", headers=headers)
    items = res.json().get("items", [])
    found = any(p["id"] == product_id for p in items)
    if not found:
        print("Error: Newly created product not found in the list endpoint!")
        return
    print("Verification passed! Product found in DB.")

    # 5. Delete Product
    print("\n5. Deleting Product...")
    res = requests.delete(f"{API_BASE}/admin/products/{product_id}", headers=headers)
    if res.status_code != 204:
        print("Product deletion failed:", res.text)
        return
        
    print("Product deleted successfully!")
    
    # 6. Verify Deletion
    print("\n6. Verifying Deletion...")
    res = requests.get(f"{API_BASE}/admin/products?search=E2E Test Legwarmers", headers=headers)
    items_after_delete = res.json().get("items", [])
    found_after_delete = any(p["id"] == product_id for p in items_after_delete)
    if found_after_delete:
        print("Error: Product still exists in DB list after delete.")
        return
    print("Verification passed! Product is soft-deleted and hidden.")
    
    print("\n--- ✅ E2E TEST COMPLETED SUCCESSFULLY ---")

if __name__ == "__main__":
    run_test()
