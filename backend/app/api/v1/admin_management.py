"""
Admin management endpoints: guides, tours, bookings, reviews, reports, metrics.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy import func, or_

from app.db.session import get_db
from app.models.user import User, RoleEnum
from app.models.guide_profile import GuideProfile
from app.models.tour_listing import TourListing
from app.models.booking import Booking, BookingStatusEnum
from app.models.review import Review
from app.models.report import Report
from app.core.dependencies import get_current_admin

router = APIRouter()


def _require_admin(current_user: User):
    if current_user.role != RoleEnum.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )


@router.get("/guides", status_code=status.HTTP_200_OK)
def list_guides(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    search: Optional[str] = None
):
    _require_admin(current_admin)
    query = db.query(User, GuideProfile).join(
        GuideProfile, User.id == GuideProfile.user_id, isouter=True
    ).filter(User.role == RoleEnum.guide)

    if status:
        query = query.filter(GuideProfile.verification_status == status)
    if search:
        query = query.filter(
            or_(
                User.email.ilike(f"%{search}%"),
                GuideProfile.bio.ilike(f"%{search}%")
            )
        )

    results = query.offset(skip).limit(limit).all()
    return [
        {
            "id": user.id,
            "email": user.email,
            "role": user.role.value,
            "is_active": user.is_active,
            "guide_profile": {
                "id": profile.id if profile else None,
                "bio": profile.bio if profile else None,
                "verification_status": profile.verification_status if profile else None,
                "rating_avg": profile.rating_avg if profile else None,
                "total_earnings": profile.total_earnings if profile else None,
                "available_balance": profile.available_balance if profile else None,
            } if profile else None,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        }
        for user, profile in results
    ]


@router.get("/tours", status_code=status.HTTP_200_OK)
def list_tours(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    guide_id: Optional[int] = None
):
    _require_admin(current_admin)
    query = db.query(TourListing)

    if status == "active":
        query = query.filter(TourListing.active == True)  # noqa: E712
    elif status == "inactive":
        query = query.filter(TourListing.active == False)  # noqa: E712
    if guide_id:
        query = query.filter(TourListing.guide_id == guide_id)

    tours = query.offset(skip).limit(limit).all()
    return tours


@router.get("/bookings", status_code=status.HTTP_200_OK)
def list_bookings(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None
):
    _require_admin(current_admin)
    query = db.query(Booking)
    if status:
        try:
            status_enum = BookingStatusEnum(status)
            query = query.filter(Booking.status == status_enum)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status: {status}",
            )
    bookings = query.offset(skip).limit(limit).all()
    return bookings


@router.put("/bookings/{booking_id}/status", status_code=status.HTTP_200_OK)
def override_booking_status(
    booking_id: int,
    booking_status: str = Query(..., alias="status"),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin manual status override for dispute resolution."""
    _require_admin(current_admin)
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )
    try:
        status_enum = BookingStatusEnum(booking_status)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status: {booking_status}",
        )
    booking.status = status_enum
    db.commit()
    db.refresh(booking)
    return booking


@router.get("/reviews", status_code=status.HTTP_200_OK)
def list_reviews(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    flagged: Optional[bool] = None
):
    _require_admin(current_admin)
    query = db.query(Review)
    # flagged param kept for API compatibility; Review has no flagged column,
    # so we simply return all reviews (moderation via reports table instead).
    reviews = query.offset(skip).limit(limit).all()
    return reviews


@router.get("/reports", status_code=status.HTTP_200_OK)
def list_reports(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None
):
    _require_admin(current_admin)
    query = db.query(Report)
    if status:
        query = query.filter(Report.status == status)
    reports = query.offset(skip).limit(limit).all()
    return reports


@router.get("/metrics", status_code=status.HTTP_200_OK)
def get_metrics(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    _require_admin(current_admin)
    active_guides = db.query(User).filter(User.role == RoleEnum.guide).join(
        GuideProfile, User.id == GuideProfile.user_id
    ).filter(GuideProfile.verification_status == "approved").count()

    published_tours = db.query(TourListing).filter(TourListing.active == True).count()  # noqa: E712
    completed_bookings = db.query(Booking).filter(Booking.status == BookingStatusEnum.completed).count()
    pending_verifications = db.query(User).filter(User.role == RoleEnum.guide).join(
        GuideProfile, User.id == GuideProfile.user_id
    ).filter(GuideProfile.verification_status == "pending").count()

    return {
        "active_guides": active_guides,
        "published_tours": published_tours,
        "completed_bookings": completed_bookings,
        "pending_verifications": pending_verifications,
    }
