"""Testimonial API routes."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.crud import testimonial as testimonial_crud
from app.schemas.testimonial import TestimonialCreate, TestimonialOut

router = APIRouter(prefix="/testimonials", tags=["Testimonials"])


@router.get("", response_model=list[TestimonialOut])
def list_testimonials(
    db: Session = Depends(get_db),
) -> list[TestimonialOut]:
    """Return all testimonials, newest first."""
    return testimonial_crud.get_testimonials(db)


@router.post("", response_model=TestimonialOut, status_code=status.HTTP_201_CREATED)
def create_testimonial(
    testimonial_in: TestimonialCreate,
    db: Session = Depends(get_db),
) -> TestimonialOut:
    """Submit a testimonial."""
    return testimonial_crud.create_testimonial(db, testimonial_in)
