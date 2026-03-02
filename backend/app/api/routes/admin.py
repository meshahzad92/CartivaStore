"""Admin API routes — login, dashboard stats, order management."""

from typing import Optional

from fastapi import APIRouter, Body, Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.admin_auth import create_token, verify_credentials, verify_token
from app.crud import order as order_crud
from app.schemas.order import DashboardStats, OrderListOut, OrderOut, OrderStatusUpdate, OrderUpdateAdmin

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


# ── Order list (for admin) ───────────────────────────────────────────────────

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
    import math
    return OrderListOut(
        orders=orders,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total > 0 else 1,
    )


@router.get("/orders/latest-id")
def get_latest_order_id(
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    """Return the highest order ID — used for polling new orders."""
    from sqlalchemy import func
    from app.models.order import Order
    latest = db.query(func.max(Order.id)).scalar()
    return {"latest_order_id": latest or 0}


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
