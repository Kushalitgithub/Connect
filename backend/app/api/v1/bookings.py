"""
Booking endpoints for tourists and guides.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from sqlalchemy import func

from app.db.session import get_db
from app.models.user import User, RoleEnum
from app.models.tour_listing import TourListing
from app.models.availability import Availability
from app.models.booking import Booking, BookingStatusEnum
from app.models.guide_profile import GuideProfile
from app.core.dependencies import get_current_tourist, get_current_guide

router = APIRouter()


@router.get("/tours", status_code=status.HTTP_200_OK)
def list_tours(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None
):
    """
    Public tour listing for tourists to browse available tours.
    Only returns active tours from verified/approved guides.
    """
    query = db.query(TourListing).filter(
        TourListing.active == True,  # noqa: E712
    ).join(User, TourListing.guide_id == User.id).join(
        GuideProfile, User.id == GuideProfile.user_id, isouter=True
    ).filter(
        GuideProfile.verification_status == "approved"
    )

    if search:
        query = query.filter(
            TourListing.title.ilike(f"%{search}%") |
            TourListing.description.ilike(f"%{search}%")
        )

    tours = query.offset(skip).limit(limit).all()
    return tours


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_booking(
    tour_listing_id: int,
    date: str,
    num_clients: int = Query(..., gt=0),
    current_user: User = Depends(get_current_tourist),
    db: Session = Depends(get_db)
):
    """
    Create a tourist booking request with atomic availability lock.
    Prevents race-condition double-booking on the last remaining slot.
    """
    # Verify the tour listing exists and is active
    tour = db.query(TourListing).filter(
        TourListing.id == tour_listing_id,
        TourListing.active == True,  # noqa: E712
    ).first()
    if not tour:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tour listing not found or inactive",
        )

    # Verification gate: only approved guides can receive bookings
    guide_profile = db.query(GuideProfile).filter(
        GuideProfile.user_id == tour.guide_id
    ).first()
    if not guide_profile or guide_profile.verification_status != "approved":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This guide is not verified and cannot receive bookings",
        )

    # Parse the requested date
    try:
        booking_date = datetime.fromisoformat(date)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format",
        )

    # Atomically lock the availability slot for this tour/date
    availability = db.query(Availability).filter(
        Availability.tour_listing_id == tour_listing_id,
        Availability.date == booking_date,
    ).with_for_update().first()

    if not availability:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No availability for this tour on the requested date",
        )

    if availability.slots_remaining < num_clients:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not enough slots remaining for this date",
        )

    # Create the booking in pending state
    booking = Booking(
        tourist_id=current_user.id,
        tour_listing_id=tour_listing_id,
        date=booking_date,
        status=BookingStatusEnum.pending,
    )
    db.add(booking)

    # Decrement the availability slot
    availability.slots_remaining -= num_clients

    db.commit()
    db.refresh(booking)

    return booking


@router.get("/my", status_code=status.HTTP_200_OK)
def get_my_bookings(
    current_user: User = Depends(get_current_tourist),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[str] = None
):
    """
    Get the current tourist's bookings with optional status filter.
    """
    query = db.query(Booking).filter(Booking.tourist_id == current_user.id)

    if status_filter:
        try:
            status_enum = BookingStatusEnum(status_filter)
            query = query.filter(Booking.status == status_enum)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status: {status_filter}",
            )

    bookings = query.order_by(Booking.created_at.desc()).offset(skip).limit(limit).all()
    return bookings


@router.put("/{booking_id}/cancel", status_code=status.HTTP_200_OK)
def cancel_booking(
    booking_id: int,
    current_user: User = Depends(get_current_tourist),
    db: Session = Depends(get_db)
):
    """
    Cancel a booking: accepted -> cancelled (tourist owns the booking).
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
            detail="You do not own this booking",
        )

    if booking.status != BookingStatusEnum.accepted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only accepted bookings can be cancelled by the tourist",
        )

    booking.status = BookingStatusEnum.cancelled
    db.commit()
    db.refresh(booking)

    return booking


@router.put("/{booking_id}/complete", status_code=status.HTTP_200_OK)
def complete_booking(
    booking_id: int,
    current_user: User = Depends(get_current_guide),
    db: Session = Depends(get_db)
):
    """
    Mark a booking as completed: accepted -> completed (guide owns the listing).
    """
    booking = db.query(Booking).join(TourListing).filter(
        Booking.id == booking_id,
        TourListing.guide_id == current_user.id,
    ).first()

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found or not associated with this guide's tours",
        )

    if booking.status != BookingStatusEnum.accepted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only accepted bookings can be completed",
        )

    booking.status = BookingStatusEnum.completed
    db.commit()
    db.refresh(booking)

    return booking
