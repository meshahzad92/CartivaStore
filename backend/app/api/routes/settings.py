"""Admin settings routes — GET and PUT /admin/settings."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.admin_auth import verify_token
from app.crud.settings import get_settings, save_settings

router = APIRouter(prefix="/admin/settings", tags=["Settings"])
bearer_scheme = HTTPBearer(auto_error=False)


def get_current_admin(credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme)):
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    email = verify_token(credentials.credentials)
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return email


# ── Pydantic models ───────────────────────────────────────────────────────────

class SettingsOut(BaseModel):
    token: Optional[str] = None
    pickup_address: Optional[str] = None
    return_address: Optional[str] = None
    default_weight: Optional[float] = 0.5
    shipper_remarks: Optional[str] = None
    shipper_type: str = "Normal"
    shipper_handling: str = "Normal"
    print_item_details: bool = False
    print_item_details_sku: bool = False
    auto_order_fulfillment: bool = False
    auto_save_tracking: bool = True
    auto_calculate_weight: bool = False
    auto_calculate_pieces: bool = False
    calculate_paid_as_zero: bool = False
    add_order_notes_remarks: bool = False

    class Config:
        from_attributes = True


class SettingsIn(BaseModel):
    token: Optional[str] = None
    pickup_address: Optional[str] = None
    return_address: Optional[str] = None
    default_weight: Optional[float] = None
    shipper_remarks: Optional[str] = None
    shipper_type: Optional[str] = None
    shipper_handling: Optional[str] = None
    print_item_details: Optional[bool] = None
    print_item_details_sku: Optional[bool] = None
    auto_order_fulfillment: Optional[bool] = None
    auto_save_tracking: Optional[bool] = None
    auto_calculate_weight: Optional[bool] = None
    auto_calculate_pieces: Optional[bool] = None
    calculate_paid_as_zero: Optional[bool] = None
    add_order_notes_remarks: Optional[bool] = None


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("", response_model=SettingsOut)
def read_settings(
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    """Return current PostEx settings."""
    return get_settings(db)


@router.put("", response_model=SettingsOut)
def update_settings(
    body: SettingsIn,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    """Save PostEx settings. Only provided (non-None) fields are updated."""
    data = {k: v for k, v in body.model_dump().items() if v is not None}
    return save_settings(db, data)
