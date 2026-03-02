"""CRUD operations for Testimonial."""

from typing import Optional

from sqlalchemy.orm import Session

from app.core.security import sanitize_string
from app.models.testimonial import Testimonial
from app.schemas.testimonial import TestimonialCreate


def get_testimonials(db: Session) -> list[Testimonial]:
    """Return all testimonials ordered by newest first."""
    return (
        db.query(Testimonial)
        .order_by(Testimonial.created_at.desc())
        .all()
    )


def create_testimonial(
    db: Session, testimonial_in: TestimonialCreate
) -> Testimonial:
    """Create a new testimonial."""
    testimonial = Testimonial(
        name=sanitize_string(testimonial_in.name),
        message=sanitize_string(testimonial_in.message),
        rating=testimonial_in.rating,
    )
    db.add(testimonial)
    db.commit()
    db.refresh(testimonial)
    return testimonial
