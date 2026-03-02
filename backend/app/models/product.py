"""Product ORM model."""

from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, Index, Integer, String, Text
from sqlalchemy.sql import func
from sqlalchemy.types import JSON

from app.db.base import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    original_price = Column(Float, nullable=True)
    category = Column(String(100), nullable=False, index=True)
    image_url = Column(String(512), nullable=True)
    images = Column(JSON, nullable=True, default=list)
    stock = Column(Integer, nullable=False, default=0)
    rating = Column(Float, nullable=False, default=4.5)
    reviews = Column(Integer, nullable=False, default=0)
    badge = Column(String(100), nullable=True)
    in_stock = Column(Boolean, nullable=False, default=True)
    packages = Column(JSON, nullable=True, default=list)
    add_on = Column(JSON, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Composite index for filtering queries
    __table_args__ = (
        Index("ix_products_category_price", "category", "price"),
    )

    def __repr__(self) -> str:
        return f"<Product id={self.id} name={self.name!r}>"
