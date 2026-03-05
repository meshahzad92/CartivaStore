"""PostEx settings ORM model — stores a single settings row per installation."""

from sqlalchemy import Boolean, Column, Float, Integer, String, Text
from app.db.base import Base


class PostexSettings(Base):
    __tablename__ = "postex_settings"

    id = Column(Integer, primary_key=True, default=1)

    # API credentials
    token = Column(String(512), nullable=True, default=None)

    # Addresses
    pickup_address = Column(Text, nullable=True, default=None)
    return_address = Column(Text, nullable=True, default=None)

    # Shipment defaults
    default_weight = Column(Float, nullable=True, default=0.5)
    shipper_remarks = Column(Text, nullable=True, default=None)
    shipper_type = Column(String(50), nullable=False, default="Normal")
    shipper_handling = Column(String(50), nullable=False, default="Normal")

    # Toggle features
    print_item_details = Column(Boolean, nullable=False, default=False)
    print_item_details_sku = Column(Boolean, nullable=False, default=False)
    auto_order_fulfillment = Column(Boolean, nullable=False, default=False)
    auto_save_tracking = Column(Boolean, nullable=False, default=True)
    auto_calculate_weight = Column(Boolean, nullable=False, default=False)
    auto_calculate_pieces = Column(Boolean, nullable=False, default=False)
    calculate_paid_as_zero = Column(Boolean, nullable=False, default=False)
    add_order_notes_remarks = Column(Boolean, nullable=False, default=False)
