"""Order and OrderItem ORM models."""

from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False)
    address = Column(String(512), nullable=False)
    city = Column(String(100), nullable=False)
    postal_code = Column(String(20), nullable=False)
    status = Column(String(20), nullable=False, default="pending", index=True)
    total_amount = Column(Float, nullable=False, default=0.0)
    notes = Column(Text, nullable=True, default=None)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationship
    items = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan",
        lazy="joined",
    )

    def __repr__(self) -> str:
        return f"<Order id={self.id} name={self.full_name!r} status={self.status!r}>"


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(
        Integer,
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    product_id = Column(
        Integer,
        ForeignKey("products.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)

    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", lazy="joined")

    def __repr__(self) -> str:
        return f"<OrderItem id={self.id} order={self.order_id} product={self.product_id}>"
