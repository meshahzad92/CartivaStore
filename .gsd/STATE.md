# STATE.md — Project Memory

> Updated: 2026-03-05

## Current Status

**Current Phase**: Phase 9: PostEx Item Details Expansion (Completed)

**What's working:**
- Full customer storefront: product browsing, cart, COD checkout, confirmation page
- Admin login (JWT, 24h token, stored in localStorage)
- Admin dashboard with stats cards (total orders, revenue, pending, confirmed) and weekly order chart
- Admin orders page: paginated list, search, filter by status, bulk delete/status-update, inline edit (address, notes), sidebar detail panel
- PostEx upload: select confirmed orders, edit fields inline, upload to postex.pk, save tracking numbers, update status to "booked"
- PostEx tracking: look up live tracking info by tracking number
- Admin settings page: configure PostEx API token (stored in DB), pickup/return addresses, shipment defaults, 7 feature toggles
- Social proof popup on storefront, testimonials from DB
- Notes field on orders (visible in admin, sent to PostEx as remarks)

**Last conversations:**
- `Resume Session` — Phase 9: Planning PostEx Item Details Expansion Feature

## Key Files

| File | Purpose |
|---|---|
| `backend/app/main.py` | FastAPI app factory, lifespan, router registration |
| `backend/app/core/config.py` | Settings via pydantic-settings |
| `backend/app/models/order.py` | Order + OrderItem ORM |
| `backend/app/models/product.py` | Product ORM (with JSON packages/add-on) |
| `backend/app/models/settings.py` | PostexSettings singleton model |
| `backend/app/api/routes/admin.py` | Admin API: auth, dashboard, order management |
| `backend/app/api/routes/postex.py` | PostEx upload + track endpoints |
| `backend/app/api/routes/settings.py` | PostEx settings CRUD |
| `backend/app/services/postex.py` | PostEx HTTP client |
| `frontend/src/App.jsx` | Root router + lazy page loading |
| `frontend/src/context/AdminAuthContext.jsx` | JWT auth state + authFetch helper |
| `frontend/src/context/CartContext.jsx` | Cart state (localStorage-persisted) |
| `frontend/src/pages/admin/AdminDashboard.jsx` | Dashboard UI |
| `frontend/src/pages/admin/AdminOrders.jsx` | Orders management UI |
| `frontend/src/pages/admin/AdminPostex.jsx` | PostEx upload UI |
| `frontend/src/pages/admin/AdminSettings.jsx` | Settings UI |

## Known Issues / Notes

- **No product management UI** — Products must be seeded via `backend/app/seed.py` or direct DB
- **SQLite in production** — Fine for now; Alembic is ready for PostgreSQL upgrade
- **PostEx API key dual-source** — Token can come from `.env` OR DB settings; DB takes priority
- **Single admin** — Email + password hardcoded in `.env`; no multi-user support

## Dev Environment

```bash
# Backend (from /backend)
source venv/bin/activate
uvicorn main:app --reload --port 8000

# Frontend (from /frontend)
npm run dev
```

URLs:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Swagger docs: http://localhost:8000/docs
- Admin panel: http://localhost:5173/admin/dashboard
