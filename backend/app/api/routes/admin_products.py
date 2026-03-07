"""Admin API routes for managing products."""

from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File
import shutil
import os
import uuid
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc

from app.api.routes.admin import get_current_admin
from app.api.deps import get_db
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate, ProductOut, ProductListOut

router = APIRouter(tags=["admin_products"])


@router.get("", response_model=ProductListOut)
def get_products(
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: str = None,
    sort_by: str = Query("created_at", description="Field to sort by"),
    order: str = Query("desc", pattern="^(asc|desc)$"),
    status: str = None,
) -> Any:
    """Retrieve products for admin (includes all statuses, unless filtered)."""
    
    query = db.query(Product).filter(Product.deleted_at == None)
    
    if search:
        query = query.filter(
            or_(
                Product.name.ilike(f"%{search}%"),
                Product.category.ilike(f"%{search}%"),
                Product.vendor.ilike(f"%{search}%"),
            )
        )
        
    if status is not None:
        query = query.filter(Product.status == status)

    # Sorting
    sort_column = getattr(Product, sort_by, Product.created_at)
    if order == "desc":
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(asc(sort_column))

    total = query.count()
    products = query.offset(skip).limit(limit).all()

    return {
        "items": products,
        "total": total,
        "page": (skip // limit) + 1,
        "page_size": limit,
        "total_pages": (total + limit - 1) // limit,
    }


@router.get("/{id}", response_model=ProductOut)
def get_product(
    *,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin),
    id: int,
) -> Any:
    """Retrieve a single product by ID."""
    product = db.query(Product).filter(Product.id == id, Product.deleted_at == None).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    return product


@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
    *,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin),
    product_in: ProductCreate,
) -> Any:
    """Create new product."""
    product = Product(**product_in.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put("/{id}", response_model=ProductOut)
def update_product(
    *,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin),
    id: int,
    product_in: ProductUpdate,
) -> Any:
    """Update a product."""
    product = db.query(Product).filter(Product.id == id, Product.deleted_at == None).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
        
    update_data = product_in.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(product, field, value)
        
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    *,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin),
    id: int,
):
    """Soft delete a product by setting deleted_at."""
    from datetime import datetime, timezone
    product = db.query(Product).filter(Product.id == id, Product.deleted_at == None).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
        
    product.deleted_at = datetime.now(timezone.utc)
    db.commit()
    return None


@router.post("/upload-image", response_model=dict, status_code=status.HTTP_201_CREATED)
def upload_image(
    *,
    admin: str = Depends(get_current_admin),
    file: UploadFile = File(...),
) -> Any:
    """Upload a product image and return its URL."""
    # Ensure uploads directory exists (backend/uploads)
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
    uploads_dir = os.path.join(base_dir, "uploads")
    os.makedirs(uploads_dir, exist_ok=True)
    
    # Generate unique filename
    ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(uploads_dir, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Return the URL path
    return {"url": f"http://localhost:8000/uploads/{unique_filename}"}
