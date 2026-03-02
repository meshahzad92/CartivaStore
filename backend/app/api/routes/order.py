"""Order API routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.crud import order as order_crud
from app.schemas.order import OrderCreate, OrderOut, OrderSummaryOut

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderSummaryOut, status_code=status.HTTP_201_CREATED)
def place_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
) -> OrderSummaryOut:
    """
    Place a new order (Cash on Delivery).

    Business flow:
    1. Validate products exist
    2. Check stock availability
    3. Calculate total (backend authoritative)
    4. Save order + items
    5. Reduce stock
    """
    order = order_crud.create_order(db, order_in)
    return OrderSummaryOut(
        order_id=order.id,
        total_amount=order.total_amount,
        item_count=len(order.items),
    )


@router.get("/{order_id}", response_model=OrderOut)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
) -> OrderOut:
    """Retrieve an order by ID with its items."""
    order = order_crud.get_order(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )
    return order
