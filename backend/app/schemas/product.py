"""Pydantic schemas for Product."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# ── Shared sub-schemas ───────────────────────────────────────────────────────

class PackageOption(BaseModel):
    qty: int
    price: float
    label: str
    tag: Optional[str] = None


class AddOnOption(BaseModel):
    name: str
    price: float


# ── Request schemas ──────────────────────────────────────────────────────────

class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    price: float = Field(..., gt=0, description="Must be a positive number")
    original_price: Optional[float] = Field(None, ge=0)
    category: str = Field(..., min_length=1, max_length=100)
    image_url: Optional[str] = Field(None, max_length=512)
    images: list[str] = Field(default_factory=list)
    stock: int = Field(..., ge=0)
    rating: float = Field(4.5, ge=0, le=5)
    reviews: int = Field(0, ge=0)
    badge: Optional[str] = Field(None, max_length=100)
    in_stock: bool = True
    packages: list[PackageOption] = Field(default_factory=list)
    add_on: Optional[AddOnOption] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    original_price: Optional[float] = Field(None, ge=0)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    image_url: Optional[str] = Field(None, max_length=512)
    images: Optional[list[str]] = None
    stock: Optional[int] = Field(None, ge=0)
    rating: Optional[float] = Field(None, ge=0, le=5)
    reviews: Optional[int] = Field(None, ge=0)
    badge: Optional[str] = Field(None, max_length=100)
    in_stock: Optional[bool] = None
    packages: Optional[list[PackageOption]] = None
    add_on: Optional[AddOnOption] = None


# ── Response schemas ─────────────────────────────────────────────────────────

class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: Optional[str] = None
    price: float
    original_price: Optional[float] = None
    category: str
    image_url: Optional[str] = None
    images: list[str] = []
    stock: int
    rating: float = 4.5
    reviews: int = 0
    badge: Optional[str] = None
    in_stock: bool = True
    packages: list[dict] = []
    add_on: Optional[dict] = None
    created_at: datetime


class ProductListOut(BaseModel):
    """Paginated product list response."""
    items: list[ProductOut]
    total: int
    page: int
    page_size: int
    total_pages: int


class CategoryOut(BaseModel):
    """Category option for frontend dropdowns."""
    value: str
    label: str
