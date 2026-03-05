"""CRUD operations for Order — including admin list / patch operations."""

from datetime import date, datetime, timezone
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.security import sanitize_string
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.order import OrderCreate


def get_order(db: Session, order_id: int) -> Optional[Order]:
    """Get an order by ID with items eagerly loaded."""
    return db.query(Order).filter(Order.id == order_id).first()


def create_order(db: Session, order_in: OrderCreate) -> Order:
    """
    Place an order:
    1. Validate all products exist
    2. Check stock availability
    3. Calculate backend-authoritative total
    4. Save order + items
    5. Reduce stock
    """
    total_amount = 0.0
    order_items_data: list[dict] = []

    for item in order_in.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {item.product_id} not found",
            )
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for '{product.name}'. "
                       f"Available: {product.stock}, Requested: {item.quantity}",
            )

        line_total = product.price * item.quantity
        total_amount += line_total
        order_items_data.append(
            {
                "product": product,
                "quantity": item.quantity,
                "price": product.price,
            }
        )

    order = Order(
        full_name=sanitize_string(order_in.full_name),
        phone=order_in.phone.strip(),
        address=sanitize_string(order_in.address),
        city=sanitize_string(order_in.city),
        postal_code=order_in.postal_code.strip(),
        status="pending",
        total_amount=round(total_amount, 2),
    )
    db.add(order)
    db.flush()

    for data in order_items_data:
        order_item = OrderItem(
            order_id=order.id,
            product_id=data["product"].id,
            quantity=data["quantity"],
            price=data["price"],
        )
        db.add(order_item)
        data["product"].stock -= data["quantity"]

    db.commit()
    db.refresh(order)
    return order


def list_orders(
    db: Session,
    status_filter: Optional[str] = None,
    search: Optional[str] = None,
    today_only: bool = False,
    page: int = 1,
    page_size: int = 20,
) -> tuple[list[Order], int]:
    """List orders with optional filters. Returns (orders, total_count)."""
    q = db.query(Order)

    if status_filter and status_filter != "all":
        q = q.filter(Order.status == status_filter)

    if today_only:
        today = date.today()
        q = q.filter(func.date(Order.created_at) == today)

    if search:
        s = f"%{search}%"
        from sqlalchemy import cast, String as SAString
        q = q.filter(
            Order.full_name.ilike(s)
            | Order.phone.ilike(s)
            | cast(Order.id, SAString).ilike(s)
        )

    total = q.count()
    orders = (
        q.order_by(Order.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return orders, total


def update_order_status(db: Session, order_id: int, new_status: str) -> Order:
    """Update order status."""
    order = get_order(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )
    order.status = new_status
    db.commit()
    db.refresh(order)
    return order


def update_order_details(db: Session, order_id: int, address: str | None, notes: str | None) -> Order:
    """Update editable customer-facing fields (address, notes) on an order."""
    order = get_order(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )
    if address is not None:
        order.address = sanitize_string(address)
    if notes is not None:
        order.notes = sanitize_string(notes)
    db.commit()
    db.refresh(order)
    return order



def get_dashboard_stats(db: Session) -> dict:
    """Get summary stats for the admin dashboard."""
    today = date.today()

    total_today = (
        db.query(func.count(Order.id))
        .filter(func.date(Order.created_at) == today)
        .scalar()
    )

    status_counts = (
        db.query(Order.status, func.count(Order.id))
        .group_by(Order.status)
        .all()
    )
    counts = {s: c for s, c in status_counts}

    # Latest order id for polling
    latest = db.query(func.max(Order.id)).scalar()

    return {
        "total_today": total_today or 0,
        "pending": counts.get("pending", 0),
        "confirmed": counts.get("confirmed", 0),
        "on_hold": counts.get("on_hold", 0),
        "fulfilled": counts.get("fulfilled", 0),
        "cancelled": counts.get("cancelled", 0),
        "latest_order_id": latest,
    }


def delete_orders(db: Session, order_ids: list[int]) -> int:
    """Bulk delete orders by ID list. Returns number of deleted rows."""
    if not order_ids:
        return 0
    deleted = (
        db.query(Order)
        .filter(Order.id.in_(order_ids))
        .delete(synchronize_session="fetch")
    )
    db.commit()
    return deleted


def get_weekly_order_counts(db: Session) -> dict:
    """Return per-day order counts for the last 7 days (including today)."""
    from datetime import timedelta

    today = date.today()
    days = [today - timedelta(days=i) for i in range(6, -1, -1)]  # oldest → newest

    # Fetch counts grouped by date
    rows = (
        db.query(func.date(Order.created_at).label("day"), func.count(Order.id).label("cnt"))
        .filter(func.date(Order.created_at) >= days[0])
        .group_by(func.date(Order.created_at))
        .all()
    )
    count_map = {str(r.day): r.cnt for r in rows}

    result = []
    for d in days:
        label = d.strftime("%a %d")   # e.g. "Mon 03"
        result.append({"date": label, "count": count_map.get(str(d), 0)})

    total = sum(r["count"] for r in result)
    avg = round(total / 7, 1)
    peak = max(result, key=lambda r: r["count"]) if result else {"date": "—", "count": 0}

    return {
        "days": result,
        "total": total,
        "average": avg,
        "peak_day": peak["date"],
        "peak_count": peak["count"],
    }


def bulk_update_orders_status(db: Session, order_ids: list[int], new_status: str) -> int:
    """Set the same status on multiple orders at once. Returns count updated."""
    if not order_ids:
        return 0
    updated = (
        db.query(Order)
        .filter(Order.id.in_(order_ids))
        .update({"status": new_status}, synchronize_session="fetch")
    )
    db.commit()
    return updated

