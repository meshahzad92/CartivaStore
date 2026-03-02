"""Pydantic schemas for Testimonial."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class TestimonialCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    message: str = Field(..., min_length=1, max_length=2000)
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5")


class TestimonialOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    message: str
    rating: int
    created_at: datetime
