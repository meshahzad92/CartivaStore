"""CRUD operations for PostEx settings."""

from sqlalchemy.orm import Session
from app.models.settings import PostexSettings


def get_settings(db: Session) -> PostexSettings:
    """Return the single settings row, creating it with defaults if it doesn't exist."""
    row = db.query(PostexSettings).filter(PostexSettings.id == 1).first()
    if not row:
        row = PostexSettings(id=1)
        db.add(row)
        db.commit()
        db.refresh(row)
    return row


def save_settings(db: Session, data: dict) -> PostexSettings:
    """Upsert the settings row with the provided data dict."""
    row = db.query(PostexSettings).filter(PostexSettings.id == 1).first()
    if not row:
        row = PostexSettings(id=1)
        db.add(row)

    allowed = {
        "token", "pickup_address", "return_address", "default_weight",
        "shipper_remarks", "shipper_type", "shipper_handling",
        "print_item_details", "print_item_details_sku",
        "auto_order_fulfillment", "auto_save_tracking",
        "auto_calculate_weight", "auto_calculate_pieces",
        "calculate_paid_as_zero", "add_order_notes_remarks",
    }
    for key, val in data.items():
        if key in allowed:
            setattr(row, key, val)

    db.commit()
    db.refresh(row)
    return row
