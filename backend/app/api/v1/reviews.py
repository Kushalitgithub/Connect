"""
Review endpoints. Reviews can only be created by the tourist who completed
a specific booking, once per booking.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.models.user import User, RoleEnum
from app.models.booking import Booking, BookingStatusEnum
from app.models.review import Review
from app.core.dependencies import get_current_tourist

router = APIRouter()


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_review(
    booking_id: int,
    rating: int = Query(..., ge=1, le=5),
    body: Optional[str] = None,
    current_user: User = Depends(get_current_tourist),
    db: Session = Depends(get_db)
):
    """
    Create a review. Restricted to the tourist who completed the booking,
    and only once per booking. Requires booking.status == completed.
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )

    if booking.tourist_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only review your own bookings",
        )

    if booking.status != BookingStatusEnum.completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reviews can only be left for completed bookings",
        )

    # One review per booking
    existing = db.query(Review).filter(Review.booking_id == booking_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A review already exists for this booking",
        )

    review = Review(
        booking_id=booking_id,
        tourist_id=current_user.id,
        guide_id=booking.tour_listing.guide_id,
        rating=rating,
        body=body,
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    return review


@router.get("/my", status_code=status.HTTP_200_OK)
def get_my_reviews(
    current_user: User = Depends(get_current_tourist),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """
    Get the current tourist's reviews.
    """
    reviews = db.query(Review).filter(
        Review.tourist_id == current_user.id
    ).offset(skip).limit(limit).all()
    return reviews
