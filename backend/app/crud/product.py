"""CRUD operations for Product."""

import math
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.security import sanitize_string
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


def get_product(db: Session, product_id: int) -> Optional[Product]:
    """Get a single product by ID (storefront view - only active)."""
    return db.query(Product).filter(
        Product.id == product_id,
        Product.deleted_at == None,
        Product.status == "active"
    ).first()


def get_products(
    db: Session,
    *,
    search: Optional[str] = None,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
) -> dict:
    """
    List products with filtering, searching, sorting, and pagination.
    Returns dict with items, total, page info.
    """
    query = db.query(Product).filter(
        Product.deleted_at == None,
        Product.status == "active"
    )

    # ── Filters ──────────────────────────────────────────────────────────
    if search:
        search_term = f"%{sanitize_string(search)}%"
        query = query.filter(
            Product.name.ilike(search_term) | Product.description.ilike(search_term)
        )

    if category and category.lower() != "all":
        query = query.filter(Product.category.ilike(sanitize_string(category)))

    if min_price is not None:
        query = query.filter(Product.price >= min_price)

    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    # ── Count total BEFORE pagination ────────────────────────────────────
    total = query.count()

    # ── Sorting ──────────────────────────────────────────────────────────
    sort_options = {
        "price_asc": Product.price.asc(),
        "price_desc": Product.price.desc(),
        "name_asc": Product.name.asc(),
        "name_desc": Product.name.desc(),
        "newest": Product.created_at.desc(),
        "oldest": Product.created_at.asc(),
        "rating": Product.rating.desc(),
        "reviews": Product.reviews.desc(),
    }
    order = sort_options.get(sort_by, Product.created_at.desc())
    query = query.order_by(order)

    # ── Pagination ───────────────────────────────────────────────────────
    offset = (page - 1) * page_size
    items = query.offset(offset).limit(page_size).all()

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": math.ceil(total / page_size) if total > 0 else 0,
    }


def create_product(db: Session, product_in: ProductCreate) -> Product:
    """Create a new product."""
    product = Product(
        name=sanitize_string(product_in.name),
        description=sanitize_string(product_in.description) if product_in.description else None,
        price=product_in.price,
        original_price=product_in.original_price,
        category=sanitize_string(product_in.category),
        image_url=product_in.image_url,
        images=product_in.images,
        stock=product_in.stock,
        rating=product_in.rating,
        reviews=product_in.reviews,
        badge=product_in.badge,
        in_stock=product_in.in_stock,
        packages=[p.model_dump() for p in product_in.packages] if product_in.packages else [],
        add_on=product_in.add_on.model_dump() if product_in.add_on else None,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def update_product(
    db: Session, product: Product, product_in: ProductUpdate
) -> Product:
    """Update an existing product."""
    update_data = product_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if isinstance(value, str):
            value = sanitize_string(value)
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product: Product) -> None:
    """Delete a product."""
    db.delete(product)
    db.commit()
