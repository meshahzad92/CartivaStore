# ARCHITECTURE.md — System Design

> Last updated: 2026-03-05

## Overview

Cartiva Store is a **monorepo** with a separate frontend and backend. They communicate exclusively via REST API. There is no SSR; the frontend is a pure SPA.

```
CartivaStoreSiteBuilding/
├── frontend/          # Vite + React 19 SPA
│   └── src/
│       ├── context/       # AdminAuthContext, CartContext
│       ├── pages/         # Public (8) + Admin (4)
│       ├── components/    # admin/, cart/, common/, conversion/, layout/, product/
│       ├── hooks/         # useFetch, useSound (or similar)
│       ├── services/      # API service helpers
│       └── utils/         # Utility functions
└── backend/           # FastAPI + SQLAlchemy
    └── app/
        ├── api/routes/    # product, order, testimonial, admin, postex, settings
        ├── core/          # config (pydantic-settings), admin_auth (JWT)
        ├── crud/          # DB operations: order, product, testimonial, settings
        ├── db/            # base, session, init
        ├── models/        # SQLAlchemy ORM: Product, Order, OrderItem, PostexSettings, Testimonial
        ├── schemas/       # Pydantic request/response models
        ├── services/      # postex.py (courier API client)
        └── seed.py        # Development seed data
```

## Data Flow

```
Customer Browser
    │  HTTP (REST JSON)
    ▼
FastAPI @ :8000
    │  SQLAlchemy ORM
    ▼
SQLite cartiva_store.db
```

```
Admin Browser
    │  Bearer JWT
    ▼
FastAPI /admin/* and /admin/postex/*
    │  Python requests
    ▼
PostEx API (api.postex.pk)
```

## Database Models

### Product
| Column | Type | Notes |
|---|---|---|
| id | Integer PK | |
| name | String(255) | Indexed |
| description | Text | |
| price | Float | |
| original_price | Float | For crossed-out price display |
| category | String(100) | Indexed |
| image_url | String | Primary image |
| images | JSON | Gallery array |
| stock | Integer | |
| rating | Float | |
| reviews | Integer | |
| badge | String | e.g. "Best Seller" |
| in_stock | Boolean | |
| packages | JSON | Bundle / variant packages |
| add_on | JSON | Optional upsell add-on |

### Order
| Column | Type | Notes |
|---|---|---|
| id | Integer PK | |
| full_name | String | |
| phone | String | |
| address | String | |
| city | String | |
| postal_code | String | |
| status | String | pending / confirmed / booked / cancelled |
| total_amount | Float | Calculated server-side |
| notes | Text | Admin & PostEx remarks |
| tracking_number | String | Set after PostEx upload |
| postex_uploaded_at | DateTime | Timestamp of PostEx upload |

### OrderItem
Foreign key to `orders` and `products`. Stores `quantity` and `price` at time of purchase.

### PostexSettings (single-row)
Stores PostEx API token, pickup/return addresses, weight defaults, shipper type/handling, and 7 feature toggles (auto-fulfillment, auto-tracking, auto-weight, etc).

### Testimonial
Simple model for customer testimonials shown on storefront.

## API Surface

| Prefix | Router | Auth | Purpose |
|---|---|---|---|
| `/api/v1/products` | product.py | Public | CRUD products (GET public, POST/PUT admin) |
| `/api/v1/orders` | order.py | Public | Place order (POST), get by ID (GET) |
| `/api/v1/testimonials` | testimonial.py | Public | List testimonials |
| `/api/v1/admin` | admin.py | JWT Bearer | Login, stats, order list/edit/delete/bulk-ops, analytics |
| `/api/v1/admin/postex` | postex.py | JWT Bearer | Upload orders to PostEx, track shipments |
| `/api/v1/admin/settings` | settings.py | JWT Bearer | Read/update PostexSettings |

## Frontend Architecture

### Contexts
- **AdminAuthContext** — JWT token state, `login()`, `logout()`, `authFetch()` helper; verifies token on mount
- **CartContext** — Cart items array via `useReducer`, persisted to `localStorage`; `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`

### Routing (React Router v7)
- Public routes wrapped in `<Header>` + `<Footer>` layout
- Admin routes wrapped in `<AdminProtectedRoute>` — redirects to login if no valid token
- All pages lazy-loaded via `React.lazy` + `<Suspense>`

### Key Frontend Pages
| Path | Component | Notes |
|---|---|---|
| `/` | Home.jsx | Hero, featured products, testimonials, social proof |
| `/products` | Products.jsx | Product grid with filtering |
| `/products/:id` | ProductDetails.jsx | Gallery, package selection, add-on, add-to-cart |
| `/cart` | Cart.jsx | Cart items, quantity update, proceed to checkout |
| `/checkout` | Checkout.jsx | COD form: name, phone, address, city, postal code |
| `/confirmation` | Confirmation.jsx | Order confirmation screen |
| `/admin/dashboard` | AdminDashboard.jsx | Stats cards, weekly chart, recent orders |
| `/admin/orders` | AdminOrders.jsx | Paginated order list, sidebar detail panel, bulk ops |
| `/admin/postex` | AdminPostex.jsx | PostEx upload panel with inline field editing |
| `/admin/settings` | AdminSettings.jsx | PostEx API token, addresses, shipment defaults |

## Key Design Decisions

1. **Backend-authoritative price calculation** — Frontend cannot manipulate totals; backend recalculates from DB prices
2. **JWT stored in localStorage** — Simple single-admin setup; token verified on every page load
3. **Cart in localStorage** — Survives browser refresh without any server call
4. **Single-row settings table** — PostexSettings uses `id=1` singleton; no migrations needed for new settings
5. **Safe SQLite migrations on startup** — `ALTER TABLE` guards in lifespan hook add new columns without breaking existing data
6. **PostEx override system** — Admin can edit order fields inline before uploading to PostEx (overrides are sent as a `dict` alongside order IDs)
