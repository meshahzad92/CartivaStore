"""
Cartiva Store — FastAPI Application Entry Point

Production-ready e-commerce backend.
"""

import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import get_settings
from app.db.base import Base
from app.db.session import engine

# Import all models so Base.metadata knows about them
from app.models import product, order, testimonial  # noqa: F401
from app.models import settings as settings_model     # noqa: F401

# Import routers
from app.api.routes.product import router as product_router
from app.api.routes.order import router as order_router
from app.api.routes.testimonial import router as testimonial_router
from app.api.routes.admin import router as admin_router
from app.api.routes.postex import router as postex_router
from app.api.routes.settings import router as settings_router

settings = get_settings()

# ── Logging config ────────────────────────────────────────────────────────────
# Silence SQLAlchemy engine logs — only show warnings and above
logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
logging.getLogger("sqlalchemy.pool").setLevel(logging.WARNING)
logging.getLogger("sqlalchemy.dialects").setLevel(logging.WARNING)


# ── Lifespan ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables on startup (dev convenience). Alembic handles prod."""
    Base.metadata.create_all(bind=engine)
    # ── SQLite safe migrations: add new columns if they don't exist ──
    with engine.connect() as conn:
        # orders table migrations
        existing_orders = [row[1] for row in conn.execute(__import__('sqlalchemy').text("PRAGMA table_info(orders)"))]
        if "tracking_number" not in existing_orders:
            conn.execute(__import__('sqlalchemy').text("ALTER TABLE orders ADD COLUMN tracking_number VARCHAR(100) DEFAULT NULL"))
        if "postex_uploaded_at" not in existing_orders:
            conn.execute(__import__('sqlalchemy').text("ALTER TABLE orders ADD COLUMN postex_uploaded_at DATETIME DEFAULT NULL"))

        # postex_settings table migrations
        existing_settings = [row[1] for row in conn.execute(__import__('sqlalchemy').text("PRAGMA table_info(postex_settings)"))]
        if "pickup_address_code" not in existing_settings:
            conn.execute(__import__('sqlalchemy').text("ALTER TABLE postex_settings ADD COLUMN pickup_address_code VARCHAR(100) DEFAULT NULL"))
        if "pickup_address_label" not in existing_settings:
            conn.execute(__import__('sqlalchemy').text("ALTER TABLE postex_settings ADD COLUMN pickup_address_label VARCHAR(255) DEFAULT NULL"))
        if "store_address_code" not in existing_settings:
            conn.execute(__import__('sqlalchemy').text("ALTER TABLE postex_settings ADD COLUMN store_address_code VARCHAR(100) DEFAULT NULL"))

        # products table migrations
        existing_products = [row[1] for row in conn.execute(__import__('sqlalchemy').text("PRAGMA table_info(products)"))]
        new_cols = {
            "status": "VARCHAR(50) NOT NULL DEFAULT 'draft'",
            "weight_kg": "FLOAT NOT NULL DEFAULT 0.0",
            "tags": "JSON DEFAULT NULL",
            "vendor": "VARCHAR(255) DEFAULT NULL",
            "product_type": "VARCHAR(255) DEFAULT NULL",
            "organization": "VARCHAR(255) DEFAULT NULL",
            "seo_title": "VARCHAR(255) DEFAULT NULL",
            "seo_desc": "TEXT DEFAULT NULL",
            "updated_at": "DATETIME DEFAULT NULL",
            "deleted_at": "DATETIME DEFAULT NULL"
        }
        for col_name, col_def in new_cols.items():
            if col_name not in existing_products:
                conn.execute(__import__('sqlalchemy').text(f"ALTER TABLE products ADD COLUMN {col_name} {col_def}"))

        conn.commit()
    yield


# ── App factory ──────────────────────────────────────────────────────────────

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Production-ready e-commerce API for Cartiva Store",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)


# ── CORS ─────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN, "http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Static files (notification sound & uploads) ──────────────────────────────

sound_dir = os.path.join(os.path.dirname(__file__), "sound")
if os.path.isdir(sound_dir):
    app.mount("/static/sound", StaticFiles(directory=sound_dir), name="sound")

uploads_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")


# ── Global exception handler (hide internal errors) ─────────────────────────

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch unhandled exceptions so internal details are never exposed."""
    if settings.DEBUG:
        detail = str(exc)
    else:
        detail = "An internal server error occurred"
    return JSONResponse(
        status_code=500,
        content={"detail": detail},
    )


from app.api.routes.admin_products import router as admin_products_router

# ── Register routers ────────────────────────────────────────────────────────

app.include_router(product_router, prefix="/api/v1")
app.include_router(order_router, prefix="/api/v1")
app.include_router(testimonial_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")
app.include_router(admin_products_router, prefix="/api/v1/admin/products")
app.include_router(postex_router, prefix="/api/v1")
app.include_router(settings_router, prefix="/api/v1")


# ── Health check ─────────────────────────────────────────────────────────────

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "version": settings.APP_VERSION}
