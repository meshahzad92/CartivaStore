"""Updated Order schemas with status field + admin schemas."""

from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

# Allowed status values
OrderStatus = Literal["pending", "confirmed", "on_hold", "fulfilled", "cancelled", "booked"]


# ── Request schemas ──────────────────────────────────────────────────────────

class OrderItemCreate(BaseModel):
    product_id: int = Field(..., gt=0)
    quantity: int = Field(..., gt=0, description="Must be greater than 0")


class OrderCreate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    phone: str = Field(..., min_length=7, max_length=20, pattern=r"^\+?\d{7,15}$")
    address: str = Field(..., min_length=1, max_length=512)
    city: str = Field(..., min_length=1, max_length=100)
    postal_code: str = Field(..., min_length=1, max_length=20)
    items: list[OrderItemCreate] = Field(..., min_length=1)


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class OrderUpdateAdmin(BaseModel):
    """Used by admin to edit address and notes on an order."""
    address: Optional[str] = None
    notes: Optional[str] = None


# ── Response schemas ─────────────────────────────────────────────────────────

class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    product_name: Optional[str] = None
    quantity: int
    price: float

    @classmethod
    def from_orm_item(cls, item) -> "OrderItemOut":
        return cls(
            id=item.id,
            product_id=item.product_id,
            product_name=item.product.name if item.product else None,
            quantity=item.quantity,
            price=item.price,
        )


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    phone: str
    address: str
    city: str
    postal_code: str
    status: str
    total_amount: float
    notes: Optional[str] = None
    tracking_number: Optional[str] = None
    postex_uploaded_at: Optional[datetime] = None
    created_at: datetime
    items: list[OrderItemOut] = []


class OrderSummaryOut(BaseModel):
    """Returned after a successful order placement."""
    order_id: int
    total_amount: float
    item_count: int
    message: str = "Order placed successfully"


class OrderListOut(BaseModel):
    """Paginated order list response."""
    orders: List[OrderOut]
    total: int
    page: int
    page_size: int
    total_pages: int


class DashboardStats(BaseModel):
    total_today: int
    pending: int
    confirmed: int
    on_hold: int
    fulfilled: int
    cancelled: int
    latest_order_id: Optional[int] = None


class WeeklyDayCount(BaseModel):
    date: str        # e.g. "Mon 03"
    count: int


class WeeklyStatsOut(BaseModel):
    days: List[WeeklyDayCount]
    total: int
    average: float
    peak_day: str
    peak_count: int


class BulkDeleteRequest(BaseModel):
    ids: List[int] = Field(..., min_length=1)


class BulkDeleteResult(BaseModel):
    deleted: int


class BulkStatusUpdateRequest(BaseModel):
    ids: List[int] = Field(..., min_length=1)
    status: OrderStatus


class BulkStatusUpdateResult(BaseModel):
    updated: int

