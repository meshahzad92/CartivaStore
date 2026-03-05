"""Admin API routes — login, dashboard stats, order management."""

import math
from typing import Optional

from fastapi import APIRouter, Body, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.admin_auth import create_token, verify_credentials, verify_token
from app.crud import order as order_crud
from app.models.order import Order
from app.schemas.order import (
    BulkDeleteRequest, BulkDeleteResult,
    BulkStatusUpdateRequest, BulkStatusUpdateResult,
    DashboardStats, OrderListOut, OrderOut, OrderStatusUpdate, OrderUpdateAdmin,
    WeeklyDayCount, WeeklyStatsOut,
)

router = APIRouter(prefix="/admin", tags=["Admin"])
bearer_scheme = HTTPBearer(auto_error=False)


# ── Auth dependency ──────────────────────────────────────────────────────────

def get_current_admin(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
):
    """Verify admin JWT stored as Bearer token."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    email = verify_token(credentials.credentials)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return email


# ── Login ────────────────────────────────────────────────────────────────────

@router.post("/login")
def admin_login(
    email: str = Body(...),
    password: str = Body(...),
):
    """Admin login — returns bearer token on success."""
    if not verify_credentials(email, password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    token = create_token(email)
    return {"access_token": token, "token_type": "bearer"}


@router.get("/verify")
def verify_session(admin: str = Depends(get_current_admin)):
    """Check if the current token is valid."""
    return {"valid": True, "email": admin}


# ── Dashboard stats ──────────────────────────────────────────────────────────

@router.get("/stats", response_model=DashboardStats)
def dashboard_stats(
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    """Return overview stats for the admin dashboard."""
    stats = order_crud.get_dashboard_stats(db)
    return DashboardStats(**stats)


# ── Order list ───────────────────────────────────────────────────────────────

@router.get("/orders", response_model=OrderListOut)
def list_orders(
    status_filter: Optional[str] = None,
    search: Optional[str] = None,
    today_only: bool = False,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    """List all orders with optional filters + pagination."""
    if page_size > 100:
        page_size = 100
    orders, total = order_crud.list_orders(
        db,
        status_filter=status_filter,
        search=search,
        today_only=today_only,
        page=page,
        page_size=page_size,
    )
    return OrderListOut(
        orders=orders,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total > 0 else 1,
    )


# ── Polling: latest order ID ─────────────────────────────────────────────────

@router.get("/orders/latest-id")
def get_latest_order_id(
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    """Return the highest order ID — used for polling new orders."""
    latest = db.query(func.max(Order.id)).scalar()
    return {"latest_order_id": latest or 0}


# ── Bulk operations (MUST be before /{order_id} routes!) ────────────────────

@router.delete("/orders", response_model=BulkDeleteResult)
def bulk_delete_orders(
    body: BulkDeleteRequest,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    """Delete multiple orders by ID list."""
    deleted = order_crud.delete_orders(db, body.ids)
    return BulkDeleteResult(deleted=deleted)


@router.patch("/orders/bulk-status", response_model=BulkStatusUpdateResult)
def bulk_update_status(
    body: BulkStatusUpdateRequest,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    """Set the same status on a list of orders at once."""
    updated = order_crud.bulk_update_orders_status(db, body.ids, body.status)
    return BulkStatusUpdateResult(updated=updated)


# ── Single order operations ──────────────────────────────────────────────────
# IMPORTANT: These /{order_id} routes MUST come AFTER all literal-path routes
# (like /bulk-status, /latest-id) to avoid FastAPI swallowing them as params.

@router.patch("/orders/{order_id}", response_model=OrderOut)
def update_order_status(
    order_id: int,
    body: OrderStatusUpdate,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    """Update the status of a specific order."""
    order = order_crud.update_order_status(db, order_id, body.status)
    return order


@router.patch("/orders/{order_id}/details", response_model=OrderOut)
def update_order_details(
    order_id: int,
    body: OrderUpdateAdmin,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    """Update editable fields (address, notes) on an order."""
    return order_crud.update_order_details(db, order_id, body.address, body.notes)


# ── Analytics ────────────────────────────────────────────────────────────────

@router.get("/analytics/weekly", response_model=WeeklyStatsOut)
def weekly_analytics(
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    """Return per-day order counts for the last 7 days."""
    data = order_crud.get_weekly_order_counts(db)
    return WeeklyStatsOut(
        days=[WeeklyDayCount(**d) for d in data["days"]],
        total=data["total"],
        average=data["average"],
        peak_day=data["peak_day"],
        peak_count=data["peak_count"],
    )
