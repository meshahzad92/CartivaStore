# Backend API Endpoints

**Base URL:** `http://localhost:8000/api/v1`  
**Auto-generated docs:** `http://localhost:8000/docs`

All routers are registered in `app/main.py` with prefix `/api/v1`.

---

## 🔐 Authentication (Admin Only)

Admin routes require a **Bearer token** in the `Authorization` header.  
Token is obtained via `POST /admin/login` and stored in `localStorage` on the frontend.

---

## 1. Products — `/api/v1/products`
**File:** `app/api/routes/product.py`

### `GET /api/v1/products/categories`
Returns all unique product categories.

- **Auth:** None
- **Response:** `[{ value: string, label: string }]`
- **Note:** Always prepends `{ value: "all", label: "All Categories" }`

---

### `GET /api/v1/products`
Paginated product listing with filters and sorting.

- **Auth:** None
- **Query Parameters:**

| Param       | Type    | Default | Description                                               |
|-------------|---------|---------|-----------------------------------------------------------|
| `search`    | string  | -       | Case-insensitive match on name or description             |
| `category`  | string  | -       | Filter by category (case-insensitive, "all" = no filter)  |
| `min_price` | float   | -       | Minimum price (inclusive)                                 |
| `max_price` | float   | -       | Maximum price (inclusive)                                 |
| `sort_by`   | string  | newest  | `price_asc`, `price_desc`, `name_asc`, `name_desc`, `newest`, `oldest`, `rating`, `reviews` |
| `page`      | int     | 1       | Page number (min 1)                                       |
| `page_size` | int     | 20      | Items per page (max 100, capped by `MAX_PAGE_SIZE` config)|

- **Response:** `ProductListOut`
```json
{
  "items": [ ...ProductOut ],
  "total": 45,
  "page": 1,
  "page_size": 20,
  "total_pages": 3
}
```

---

### `GET /api/v1/products/{product_id}`
Get a single product by ID.

- **Auth:** None
- **Path:** `product_id: int`
- **Response:** `ProductOut`
- **Error:** `404` if not found

---

### `POST /api/v1/products`
Create a new product.

- **Auth:** None *(TODO: add admin auth)*
- **Body:** `ProductCreate`
```json
{
  "name": "string",
  "description": "string",
  "price": 0.0,
  "original_price": null,
  "category": "string",
  "image_url": "string",
  "images": ["url1", "url2"],
  "stock": 10,
  "rating": 4.5,
  "reviews": 0,
  "badge": "New",
  "in_stock": true,
  "packages": [{ "qty": 2, "price": 49.99, "label": "2-Pack", "tag": "Best Value" }],
  "add_on": { "name": "Gift Wrap", "price": 5.0 }
}
```
- **Response:** `ProductOut` (status 201)

---

## 2. Orders — `/api/v1/orders`
**File:** `app/api/routes/order.py`

### `POST /api/v1/orders`
Place a new Cash-on-Delivery order.

- **Auth:** None (customers place orders)
- **Body:** `OrderCreate`
```json
{
  "full_name": "John Doe",
  "phone": "+923001234567",
  "address": "House 5, Street 10",
  "city": "Karachi",
  "postal_code": "75500",
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 3, "quantity": 1 }
  ]
}
```
- **Business Flow:**
  1. Validates each product exists → `404` if not
  2. Checks stock availability → `400` if insufficient
  3. Backend calculates total (not trusting frontend price)
  4. Saves `Order` + each `OrderItem` to DB
  5. Decrements product stock
- **Response:** `OrderSummaryOut` (status 201)
```json
{
  "order_id": 42,
  "total_amount": 150.00,
  "item_count": 3,
  "message": "Order placed successfully"
}
```

---

### `GET /api/v1/orders/{order_id}`
Retrieve a single order with its items.

- **Auth:** None
- **Path:** `order_id: int`
- **Response:** `OrderOut` (includes nested `items[]`)
- **Error:** `404` if not found

---

## 3. Testimonials — `/api/v1/testimonials`
**File:** `app/api/routes/testimonial.py`

### `GET /api/v1/testimonials`
Returns all testimonials, newest first.

- **Auth:** None
- **Response:** `[TestimonialOut]`
```json
[{ "id": 1, "name": "Jane", "message": "Great!", "rating": 5, "created_at": "..." }]
```

### `POST /api/v1/testimonials`
Submit a customer testimonial.

- **Auth:** None
- **Body:** `TestimonialCreate`
```json
{ "name": "Jane", "message": "Loved it!", "rating": 5 }
```
- **Response:** `TestimonialOut` (status 201)

---

## 4. Admin — `/api/v1/admin`
**File:** `app/api/routes/admin.py`  
**All routes except `/login` require Bearer token.**

### `POST /api/v1/admin/login`
Exchange credentials for a JWT.

- **Auth:** None
- **Body (JSON):** `{ "email": "...", "password": "..." }`
- **Response:** `{ "access_token": "jwt...", "token_type": "bearer" }`
- **Error:** `401` on wrong credentials

---

### `GET /api/v1/admin/verify`
Check if current token is valid.

- **Auth:** Required
- **Response:** `{ "valid": true, "email": "admin@example.com" }`
- **Used by:** `AdminAuthContext` on page load to restore session

---

### `GET /api/v1/admin/stats`
Dashboard overview counters.

- **Auth:** Required
- **Response:** `DashboardStats`
```json
{
  "total_today": 5,
  "pending": 12,
  "confirmed": 3,
  "on_hold": 1,
  "fulfilled": 20,
  "cancelled": 2,
  "latest_order_id": 45
}
```

---

### `GET /api/v1/admin/orders`
Paginated order list with optional filters.

- **Auth:** Required
- **Query Parameters:**

| Param          | Type    | Description                                     |
|----------------|---------|-------------------------------------------------|
| `status_filter`| string  | `pending`, `confirmed`, `on_hold`, `fulfilled`, `cancelled`, or `all` |
| `search`       | string  | Matches name, phone, or order ID                |
| `today_only`   | bool    | Filter to today's orders only                   |
| `page`         | int     | Page number (default 1)                         |
| `page_size`    | int     | Max 100 (default 20)                            |

- **Response:** `OrderListOut`
```json
{
  "orders": [ ...OrderOut ],
  "total": 50,
  "page": 1,
  "page_size": 20,
  "total_pages": 3
}
```

---

### `GET /api/v1/admin/orders/latest-id`
Returns the highest existing order ID. Used by the frontend to **poll for new orders** every 7 seconds.

- **Auth:** Required
- **Response:** `{ "latest_order_id": 45 }`

---

### `PATCH /api/v1/admin/orders/{order_id}`
Update the status of an order.

- **Auth:** Required
- **Path:** `order_id: int`
- **Body:** `{ "status": "confirmed" }`
- **Allowed statuses:** `pending`, `confirmed`, `on_hold`, `fulfilled`, `cancelled`
- **Response:** Full `OrderOut`

---

### `PATCH /api/v1/admin/orders/{order_id}/details`
Edit the customer address and/or notes on an order.

- **Auth:** Required
- **Path:** `order_id: int`
- **Body:** `OrderUpdateAdmin` (all fields optional)
```json
{
  "address": "New address string",
  "notes": "Call before delivery"
}
```
- **Response:** Full `OrderOut`

---

## 5. Health Check

### `GET /health`
Simple liveness probe.

- **Response:** `{ "status": "healthy", "version": "1.0.0" }`

---

## Static Files

`/static/sound/shopify_sale_sound.mp3`  
Served by FastAPI, used by the frontend to play a notification when a new order arrives.

---

## Common Response Shape: `OrderOut`
Used in multiple endpoints:
```json
{
  "id": 42,
  "full_name": "John Doe",
  "phone": "+923001234567",
  "address": "House 5, Street 10",
  "city": "Karachi",
  "postal_code": "75500",
  "status": "pending",
  "total_amount": 150.00,
  "notes": null,
  "created_at": "2024-01-15T10:30:00Z",
  "items": [
    { "id": 1, "product_id": 3, "product_name": "Knee Sleeve", "quantity": 2, "price": 75.00 }
  ]
}
```

---

## 6. New Admin Endpoints (Added March 2026)

### `DELETE /api/v1/admin/orders`
Bulk delete orders by ID list.

- **Auth:** Required
- **Body:** `{ "ids": [1, 2, 3] }`
- **Response:** `{ "deleted": 3 }`

---

### `PATCH /api/v1/admin/orders/bulk-status`
Set the same status on multiple orders at once.

- **Auth:** Required
- **Body:** `{ "ids": [1, 2, 3], "status": "fulfilled" }`
- **Allowed statuses:** `pending`, `confirmed`, `on_hold`, `fulfilled`, `cancelled`
- **Response:** `{ "updated": 3 }`
- **Note:** Updates local state immediately on frontend without re-fetching.

---

### `GET /api/v1/admin/analytics/weekly`
Returns per-day order counts for the past 7 days.

- **Auth:** Required
- **Response:**
```json
{
  "days": [{ "date": "Mon 03", "count": 4 }, ...],
  "total": 14,
  "average": 2.0,
  "peak_day": "Thu 05",
  "peak_count": 6
}
```

---

### `OrderItemOut` — Updated
Now includes `product_name` (resolved from the joined Product relationship):
```json
{ "id": 1, "product_id": 3, "product_name": "Knee Sleeve", "quantity": 2, "price": 75.00 }
```
