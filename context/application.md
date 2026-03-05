# Cartiva Store — Application Overview

## What It Is
A full-stack e-commerce web application for selling products online. Customers browse, add to cart, and place Cash-on-Delivery (COD) orders. An admin panel provides order management, status updates, and real-time notifications.

---

## Tech Stack

| Layer         | Technology                                                   |
|---------------|--------------------------------------------------------------|
| **Frontend**  | React 18 + Vite, CSS Modules / vanilla CSS, React Router v6  |
| **Backend**   | Python 3.11, FastAPI, SQLAlchemy ORM, Pydantic v2            |
| **Database**  | SQLite (`cartiva_store.db`) — swap to PostgreSQL for prod    |
| **Migrations**| Alembic                                                      |
| **Auth**      | JWT (HS256) — admin only, via `python-jose`                  |
| **Static**    | `/static/sound/` served by FastAPI (notification sound)      |

---

## Project Directory Layout

```
CartivaStoreSiteBuilding/
├── backend/              # FastAPI application
│   ├── app/
│   │   ├── api/routes/   # HTTP route handlers
│   │   ├── crud/         # DB query logic
│   │   ├── models/       # SQLAlchemy ORM models
│   │   ├── schemas/      # Pydantic request/response models
│   │   ├── core/         # Config, auth, security helpers
│   │   ├── db/           # DB engine + session
│   │   └── main.py       # App factory + router registration
│   ├── alembic/          # Migration scripts
│   ├── main.py           # Uvicorn entry point
│   └── .env              # Environment variables
│
├── frontend/             # React/Vite application
│   └── src/
│       ├── pages/        # Route-level page components
│       ├── components/   # Reusable UI components (by domain)
│       ├── context/      # React Contexts (Cart, AdminAuth)
│       ├── hooks/        # Custom hooks
│       ├── services/     # API client (api.js)
│       └── utils/        # Utility helpers
│
└── context/              # ← You are here (dev context docs)
    ├── application.md    # This file
    ├── backend/
    │   ├── endpoints.md  # All API endpoints
    │   └── database.md   # DB schema + CRUD operations
    └── frontend/
        ├── structure.md  # Frontend architecture overview
        └── admin.md      # Admin module deep-dive
```

---

## Request Flow (Customer Order)

```
Browser → React Frontend
    → api.js (fetch)
        → POST /api/v1/orders
            → FastAPI order router
                → crud/order.py create_order()
                    → Validate products + stock
                    → Calculate total (backend-authoritative)
                    → Write Order + OrderItems to DB
                    → Reduce product stock
                → Returns OrderSummaryOut
    → Checkout page → Confirmation page (/confirmation)
```

## Request Flow (Admin)

```
Admin browser → AdminLoginModal
    → POST /api/v1/admin/login  →  JWT token stored in localStorage
    → AdminDashboard / AdminOrders (protected by AdminProtectedRoute)
        → GET /api/v1/admin/stats       (dashboard counters)
        → GET /api/v1/admin/orders      (paginated order list)
        → PATCH /api/v1/admin/orders/{id}          (status change)
        → PATCH /api/v1/admin/orders/{id}/details  (address/notes edit)
        → GET /api/v1/admin/orders/latest-id       (polling every 7s)
```

---

## Environment Variables

### Backend (`backend/.env`)
| Variable           | Purpose                         |
|--------------------|---------------------------------|
| `SECRET_KEY`       | JWT signing secret              |
| `ADMIN_EMAIL`      | Hardcoded admin login email     |
| `ADMIN_PASSWORD`   | Hardcoded admin login password  |
| `FRONTEND_ORIGIN`  | Allowed CORS origin             |
| `DEBUG`            | Show detailed error messages    |

### Frontend (`frontend/.env`)
| Variable       | Purpose                          |
|----------------|----------------------------------|
| `VITE_API_URL` | Backend base URL (default: `http://localhost:8000/api/v1`) |

---

## Running Locally

```bash
# Backend
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend
npm run dev   # starts on :5173 or :5174
```

API docs available at: `http://localhost:8000/docs`
