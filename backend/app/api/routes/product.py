"""Product API routes."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import distinct

from app.api.deps import get_db
from app.core.config import get_settings
from app.crud import product as product_crud
from app.models.product import Product
from app.schemas.product import (
    CategoryOut,
    ProductCreate,
    ProductListOut,
    ProductOut,
)

router = APIRouter(prefix="/products", tags=["Products"])
settings = get_settings()


@router.get("/categories", response_model=list[CategoryOut])
def list_categories(
    db: Session = Depends(get_db),
) -> list[CategoryOut]:
    """Return all unique product categories for frontend filters."""
    rows = db.query(distinct(Product.category)).order_by(Product.category).all()
    categories = [CategoryOut(value="all", label="All Categories")]
    for (cat_value,) in rows:
        categories.append(CategoryOut(
            value=cat_value.lower(),
            label=cat_value.title(),
        ))
    return categories


@router.get("", response_model=ProductListOut)
def list_products(
    search: Optional[str] = Query(None, max_length=100),
    category: Optional[str] = Query(None, max_length=100),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    sort_by: Optional[str] = Query(
        None,
        description="Sort option: price_asc, price_desc, name_asc, name_desc, newest, oldest",
    ),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> ProductListOut:
    """List all products with optional filtering, sorting, and pagination."""
    result = product_crud.get_products(
        db,
        search=search,
        category=category,
        min_price=min_price,
        max_price=max_price,
        sort_by=sort_by,
        page=page,
        page_size=min(page_size, settings.MAX_PAGE_SIZE),
    )
    return ProductListOut(**result)


@router.get("/{product_id}", response_model=ProductOut)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
) -> ProductOut:
    """Get a single product by ID."""
    product = product_crud.get_product(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    return product


@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
) -> ProductOut:
    """Create a new product (admin endpoint — auth to be added)."""
    return product_crud.create_product(db, product_in)
