# Backend Database — Schema, CRUD & Operations

**Engine:** SQLite (`cartiva_store.db`)  
**ORM:** SQLAlchemy (sync)  
**Migrations:** Alembic (`alembic/`)  
**Session:** `app/db/session.py` — creates a `SessionLocal` factory  
**Base:** `app/db/base.py` — declarative base for all models

---

## DB Setup Flow

1. `app/db/session.py` creates `engine` from `DATABASE_URL` in settings
2. `app/db/base.py` defines `Base = declarative_base()`
3. On app startup (`lifespan`), `Base.metadata.create_all(bind=engine)` creates tables if they don't exist  
4. All models are imported in `app/main.py` so `Base.metadata` knows about them  
5. Alembic handles schema migrations in production (`alembic upgrade head`)

---

## Tables

### `products`
**Model:** `app/models/product.py → Product`

| Column           | Type      | Constraints             | Notes                          |
|------------------|-----------|-------------------------|--------------------------------|
| `id`             | Integer   | PK, index               |                                |
| `name`           | String(255)| NOT NULL, index         |                                |
| `description`    | Text      | NULLABLE                |                                |
| `price`          | Float     | NOT NULL                |                                |
| `original_price` | Float     | NULLABLE                | For showing strikethrough price|
| `category`       | String(100)| NOT NULL, index         |                                |
| `image_url`      | String(512)| NULLABLE                | Primary/hero image             |
| `images`         | JSON      | NULLABLE, default=[]    | Array of image URLs            |
| `stock`          | Integer   | NOT NULL, default=0     | Decremented on order           |
| `rating`         | Float     | NOT NULL, default=4.5   |                                |
| `reviews`        | Integer   | NOT NULL, default=0     |                                |
| `badge`          | String(100)| NULLABLE                | e.g. "New", "Hot"              |
| `in_stock`       | Boolean   | NOT NULL, default=True  |                                |
| `packages`       | JSON      | NULLABLE, default=[]    | Array of `{qty, price, label, tag}` |
| `add_on`         | JSON      | NULLABLE                | `{name, price}` optional upsell|
| `created_at`     | DateTime  | NOT NULL, server default|                                |

**Composite Index:** `(category, price)` — speeds up category+price filter queries

---

### `orders`
**Model:** `app/models/order.py → Order`

| Column        | Type       | Constraints             | Notes                              |
|---------------|------------|-------------------------|------------------------------------|
| `id`          | Integer    | PK, index               |                                    |
| `full_name`   | String(255)| NOT NULL                | Sanitized on write                 |
| `phone`       | String(20) | NOT NULL                |                                    |
| `address`     | String(512)| NOT NULL                | Sanitized, editable by admin       |
| `city`        | String(100)| NOT NULL                |                                    |
| `postal_code` | String(20) | NOT NULL                |                                    |
| `status`      | String(20) | NOT NULL, default="pending", index | Values: pending, confirmed, on_hold, fulfilled, cancelled |
| `total_amount`| Float      | NOT NULL, default=0.0   | Backend-calculated                 |
| `notes`       | Text       | NULLABLE                | Admin notes, editable              |
| `created_at`  | DateTime   | NOT NULL, server default|                                    |

**Relationship:** `items → OrderItem[]` (one-to-many, cascade delete, lazy="joined")

---

### `order_items`
**Model:** `app/models/order.py → OrderItem`

| Column      | Type    | Constraints                         | Notes                        |
|-------------|---------|-------------------------------------|------------------------------|
| `id`        | Integer | PK, index                           |                              |
| `order_id`  | Integer | FK → orders.id (CASCADE DELETE), index |                           |
| `product_id`| Integer | FK → products.id (RESTRICT), index  | Can't delete product if in order |
| `quantity`  | Integer | NOT NULL                            |                              |
| `price`     | Float   | NOT NULL                            | Price snapshotted at order time |

**Relationships:**  
- `order → Order` (back_populates="items")  
- `product → Product` (lazy="joined")

---

### `testimonials`
**Model:** `app/models/testimonial.py → Testimonial`

| Column      | Type       | Constraints     |
|-------------|------------|-----------------|
| `id`        | Integer    | PK, index       |
| `name`      | String(100)| NOT NULL        |
| `message`   | Text       | NOT NULL        |
| `rating`    | Integer    | NOT NULL (1–5)  |
| `created_at`| DateTime   | server default  |

---

## CRUD Operations

### `app/crud/product.py`

| Function          | Description                                             |
|-------------------|---------------------------------------------------------|
| `get_product(db, product_id)` | Fetch one product by ID or `None`         |
| `get_products(db, *, search, category, min_price, max_price, sort_by, page, page_size)` | Filtered + sorted + paginated product list. Returns `{items, total, page, page_size, total_pages}` |
| `create_product(db, product_in)` | Insert new product, sanitize string fields |
| `update_product(db, product, product_in)` | Partial update via `model_dump(exclude_unset=True)` |
| `delete_product(db, product)` | Hard delete                                |

**Sorting options in `get_products`:** `price_asc`, `price_desc`, `name_asc`, `name_desc`, `newest`, `oldest`, `rating`, `reviews`

---

### `app/crud/order.py`

| Function          | Description                                             |
|-------------------|---------------------------------------------------------|
| `get_order(db, order_id)` | Fetch one order by ID (items loaded via joined load) |
| `create_order(db, order_in)` | Full order creation flow: validate → calc total → save → reduce stock |
| `list_orders(db, status_filter, search, today_only, page, page_size)` | Admin order list with all filters. Returns `(orders[], total)` |
| `update_order_status(db, order_id, new_status)` | Change order status field |
| `update_order_details(db, order_id, address, notes)` | Update address/notes (admin only) |
| `get_dashboard_stats(db)` | Returns dict with `total_today`, status counts, `latest_order_id` |

**`create_order` detail:**
```
for each item:
    → query Product by product_id  (404 if missing)
    → check product.stock >= quantity  (400 if not)
    → accumulate line_total = product.price * quantity

→ db.add(Order(..., status="pending", total_amount=round(total, 2)))
→ db.flush()  ← get order.id without committing

for each item:
    → db.add(OrderItem(order_id, product_id, quantity, price))
    → product.stock -= quantity

→ db.commit()
→ db.refresh(order)
```

---

### `app/crud/testimonial.py`

| Function                  | Description                              |
|---------------------------|------------------------------------------|
| `get_testimonials(db)`    | All testimonials, newest first           |
| `create_testimonial(db, testimonial_in)` | Insert new testimonial    |

---

## Security Notes

- All string inputs are passed through `sanitize_string()` from `app/core/security.py` before DB writes (strips dangerous characters / HTML)
- Prices/totals are calculated server-side — the frontend price is **never trusted**
- `products.id` FK on `order_items` uses `ondelete="RESTRICT"` — you cannot delete a product that has existing orders
- `orders.id` FK on `order_items` uses `ondelete="CASCADE"` — deleting an order removes all its items

---

## Database File

`backend/cartiva_store.db` — SQLite binary. Do not commit to git in production.  
To reseed: `python -m app.seed` from the `backend/` directory.
