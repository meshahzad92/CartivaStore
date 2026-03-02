"""
Cartiva Store — FastAPI Application Entry Point

Production-ready e-commerce backend.
"""

import os
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

# Import routers
from app.api.routes.product import router as product_router
from app.api.routes.order import router as order_router
from app.api.routes.testimonial import router as testimonial_router
from app.api.routes.admin import router as admin_router

settings = get_settings()


# ── Lifespan ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables on startup (dev convenience). Alembic handles prod."""
    Base.metadata.create_all(bind=engine)
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


# ── Static files (notification sound) ────────────────────────────────────────

sound_dir = os.path.join(os.path.dirname(__file__), "sound")
if os.path.isdir(sound_dir):
    app.mount("/static/sound", StaticFiles(directory=sound_dir), name="sound")


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


# ── Register routers ────────────────────────────────────────────────────────

app.include_router(product_router, prefix="/api/v1")
app.include_router(order_router, prefix="/api/v1")
app.include_router(testimonial_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")


# ── Health check ─────────────────────────────────────────────────────────────

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "version": settings.APP_VERSION}
