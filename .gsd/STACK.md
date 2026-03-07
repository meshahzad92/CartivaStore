# STACK.md — Technology Stack

> Last updated: 2026-03-05

## Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.x | UI framework |
| **Vite** | 7.x | Dev server + bundler |
| **React Router** | 7.x | Client-side routing |
| **TailwindCSS** | 4.x (via `@tailwindcss/vite`) | Utility-first CSS |
| **Recharts** | 3.x | Dashboard analytics charts |
| **Lucide React** | 0.577+ | Icon library |

### Dev Tools
- ESLint with react-hooks + react-refresh plugins
- TypeScript types for React (via `@types/react`)

### Environment
- `VITE_API_URL` - Backend base URL (defaults to `http://localhost:8000/api/v1`)

---

## Backend

| Technology | Version | Purpose |
|---|---|---|
| **Python** | 3.11+ | Runtime |
| **FastAPI** | latest | REST API framework |
| **SQLAlchemy** | latest | ORM |
| **Alembic** | latest | Database migrations |
| **Pydantic v2** | latest | Schema validation |
| **pydantic-settings** | latest | `.env` config loading |
| **python-jose** | latest | JWT creation/verification |
| **passlib (bcrypt)** | latest | Password hashing |
| **requests** | latest | PostEx HTTP client |
| **uvicorn** | latest | ASGI server |

### Database
- **SQLite** (`cartiva_store.db`) — file-based, zero-config for development
- Alembic configured and ready for PostgreSQL migration

### External Services
- **PostEx API** (`api.postex.pk`) — Pakistan courier, order creation + tracking

### Environment Variables (`.env`)
```
ADMIN_EMAIL=<admin email>
ADMIN_PASSWORD=<admin password>
SECRET_KEY=<jwt secret>
DATABASE_URL=sqlite:///./cartiva_store.db
FRONTEND_ORIGIN=http://localhost:5173
POSTEX_API_KEY=<optional, can be set via admin settings UI>
POSTEX_BASE_URL=https://api.postex.pk/services/integration/api/order/v3
```

---

## Dev Commands

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev   # default port 5173
```

## Ports
| Service | Port |
|---|---|
| Frontend (Vite dev) | 5173 |
| Backend (FastAPI) | 8000 |
| Backend docs (Swagger) | 8000/docs |
