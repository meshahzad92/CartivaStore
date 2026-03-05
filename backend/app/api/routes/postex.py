"""PostEx routes — upload confirmed orders to PostEx, track shipments."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.admin_auth import verify_token
from app.crud import order as order_crud
from app.crud.settings import get_settings as get_postex_settings
from app.models.order import Order
from app.services.postex import create_postex_order, track_postex_order

import requests

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin/postex", tags=["PostEx"])
bearer_scheme = HTTPBearer(auto_error=False)


# ── Auth dependency ──────────────────────────────────────────────────────────

def get_current_admin(credentials=Depends(bearer_scheme)):
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    email = verify_token(credentials.credentials)
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return email


# ── Schemas ──────────────────────────────────────────────────────────────────

class PostexUploadRequest(BaseModel):
    ids: List[int]
    overrides: dict | None = None   # { str(order_id): { customerName, deliveryAddress, ... } }


class PostexOrderResult(BaseModel):
    order_id: int
    success: bool
    tracking_number: str | None = None
    error: str | None = None


class PostexUploadResponse(BaseModel):
    results: List[PostexOrderResult]
    uploaded: int
    failed: int


class PostexTrackResponse(BaseModel):
    tracking_number: str
    data: dict


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/upload", response_model=PostexUploadResponse)
def upload_to_postex(
    body: PostexUploadRequest,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    """
    Upload selected confirmed orders to PostEx.
    Saves the tracking number back to the DB for each success.
    """
    if not body.ids:
        raise HTTPException(status_code=400, detail="No order IDs provided")

    orders = db.query(Order).filter(Order.id.in_(body.ids)).all()
    if not orders:
        raise HTTPException(status_code=404, detail="No matching orders found")

    # Resolve settings — DB token overrides .env when set
    db_settings = get_postex_settings(db)
    token_override = db_settings.token or None  # None → service uses .env
    default_weight = db_settings.default_weight or 0.5
    shipper_type = db_settings.shipper_type or "Normal"

    results: List[PostexOrderResult] = []
    uploaded = 0
    failed = 0

    for order in orders:
        # Apply any overrides sent by the frontend (user may have edited fields inline)
        ov = (body.overrides or {}).get(str(order.id), {})

        # items override can be: a list (JS array), numeric string, or None
        _ov_items = ov.get("items")
        if isinstance(_ov_items, list):
            items_count = len(_ov_items) or 1
        elif _ov_items is not None:
            try:
                items_count = int(_ov_items) or 1
            except (TypeError, ValueError):
                items_count = len(order.items) or 1
        else:
            items_count = len(order.items) or 1

        order_dict = {
            "id": ov.get("orderRefNumber") or order.id,
            "total_amount": float(ov.get("invoicePayment") or order.total_amount),
            "full_name": ov.get("customerName") or order.full_name,
            "phone": ov.get("customerPhone") or order.phone,
            "address": ov.get("deliveryAddress") or order.address,
            "city": ov.get("cityName") or order.city,
            "notes": ov.get("orderDetail") or order.notes,
            "items": list(range(items_count)),
        }
        try:
            resp = create_postex_order(order_dict, token_override=token_override)
            # PostEx wraps tracking in resp["dist"]["trackingNumber"]
            tracking = (
                resp.get("dist", {}).get("trackingNumber")
                or resp.get("trackingNumber")
            )
            if not tracking:
                # If API returned error in response body
                err_msg = resp.get("message") or resp.get("desc") or "No tracking number returned"
                results.append(PostexOrderResult(order_id=order.id, success=False, error=err_msg))
                failed += 1
                continue

            # Persist tracking number + set status to 'booked'
            order.tracking_number = tracking
            order.postex_uploaded_at = datetime.now(timezone.utc)
            order.status = "booked"
            db.commit()

            results.append(PostexOrderResult(
                order_id=order.id,
                success=True,
                tracking_number=tracking,
            ))
            uploaded += 1

        except requests.RequestException as exc:
            db.rollback()
            results.append(PostexOrderResult(
                order_id=order.id,
                success=False,
                error=str(exc),
            ))
            failed += 1

    return PostexUploadResponse(results=results, uploaded=uploaded, failed=failed)


@router.get("/track/{tracking_number}", response_model=PostexTrackResponse)
def track_order(
    tracking_number: str,
    admin: str = Depends(get_current_admin),
):
    """Fetch live tracking info from PostEx for a given tracking number."""
    try:
        data = track_postex_order(tracking_number)
        return PostexTrackResponse(tracking_number=tracking_number, data=data)
    except requests.RequestException as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"PostEx API error: {exc}",
        )


@router.get("/orders", response_model=dict)
def get_postex_eligible_orders(
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    """
    Return confirmed orders NOT yet uploaded to PostEx.
    Excludes orders with tracking_number (already booked).
    """
    orders = (
        db.query(Order)
        .filter(Order.status == "confirmed", Order.tracking_number.is_(None))
        .order_by(Order.id.desc())
        .all()
    )
    result = []
    for o in orders:
        result.append({
            "id": o.id,
            "full_name": o.full_name,
            "phone": o.phone,
            "address": o.address,
            "city": o.city,
            "total_amount": o.total_amount,
            "notes": o.notes,
            "tracking_number": o.tracking_number,
            "postex_uploaded_at": o.postex_uploaded_at.isoformat() if o.postex_uploaded_at else None,
            "created_at": o.created_at.isoformat(),
            "item_count": len(o.items),
            "items": [{"product_name": i.product.name if i.product else None, "quantity": i.quantity, "price": i.price} for i in o.items],
        })
    return {"orders": result, "total": len(result)}
