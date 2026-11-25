"""
Endpoints for guide dashboard overview.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy import func

from app.db.session import get_db
from app.models.user import User, RoleEnum
from app.models.tour_listing import TourListing
from app.models.booking import Booking, BookingStatusEnum
from app.models.guide_profile import GuideProfile
from app.models.withdrawal import Withdrawal, WithdrawalStatusEnum
from app.core.dependencies import get_current_guide

router = APIRouter()


@router.get("/dashboard/overview", status_code=status.HTTP_200_OK)
def get_guide_dashboard_overview(
    current_user: User = Depends(get_current_guide),
    db: Session = Depends(get_db)
):
    """
    Get overview statistics for guide dashboard.
    Returns counts of requests, bookings, and earnings.
    """
    # Ensure the user is a guide
    if current_user.role != RoleEnum.guide:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is for guide accounts only",
        )

    # Check if guide is verified
    guide_profile = db.query(GuideProfile).filter(GuideProfile.user_id == current_user.id).first()
    if not guide_profile or guide_profile.verification_status != "approved":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only verified guides can access dashboard overview",
        )

    # Count pending booking requests (bookings with status=pending for this guide's tours)
    pending_requests = db.query(Booking).join(TourListing).filter(
        TourListing.guide_id == current_user.id,
        Booking.status == BookingStatusEnum.pending
    ).count()

    # Count confirmed bookings (accepted status)
    confirmed_bookings = db.query(Booking).join(TourListing).filter(
        TourListing.guide_id == current_user.id,
        Booking.status == BookingStatusEnum.accepted
    ).count()

    # Calculate total earnings from completed bookings
    total_earnings = db.query(func.sum(TourListing.price)).join(Booking).filter(
        TourListing.guide_id == current_user.id,
        Booking.status == BookingStatusEnum.completed
    ).scalar() or 0.0

    # Count total tours
    total_tours = db.query(TourListing).filter(
        TourListing.guide_id == current_user.id
    ).count()

    return {
        "pending_requests": pending_requests,
        "confirmed_bookings": confirmed_bookings,
        "total_earnings": float(total_earnings),
        "total_tours": total_tours,
        "last_updated": datetime.utcnow().isoformat()
    }


@router.get("/dashboard/tours", status_code=status.HTTP_200_OK)
def get_guide_tours(
    current_user: User = Depends(get_current_guide),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """
    Get all tours created by the guide.
    """
    # Ensure the user is a guide
    if current_user.role != RoleEnum.guide:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is for guide accounts only",
        )

    # Check if guide is verified
    guide_profile = db.query(GuideProfile).filter(GuideProfile.user_id == current_user.id).first()
    if not guide_profile or guide_profile.verification_status != "approved":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only verified guides can access their tours",
        )

    tours = db.query(TourListing).filter(
        TourListing.guide_id == current_user.id
    ).offset(skip).limit(limit).all()

    return tours


@router.post("/dashboard/tours", status_code=status.HTTP_201_CREATED)
def create_tour(
    title: str,
    price: float,
    capacity: int,
    description: Optional[str] = None,
    itinerary: Optional[str] = None,
    current_user: User = Depends(get_current_guide),
    db: Session = Depends(get_db)
):
    """
    Create a new tour listing for the guide.
    """
    # Ensure the user is a guide
    if current_user.role != RoleEnum.guide:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is for guide accounts only",
        )

    # Check if guide is verified
    guide_profile = db.query(GuideProfile).filter(GuideProfile.user_id == current_user.id).first()
    if not guide_profile or guide_profile.verification_status != "approved":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only verified guides can create tours",
        )

    # Validate inputs
    if price <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Price must be greater than zero",
        )

    if capacity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Capacity must be greater than zero",
        )

    tour = TourListing(
        guide_id=current_user.id,
        title=title,
        description=description,
        itinerary=itinerary,
        price=price,
        capacity=capacity
    )

    db.add(tour)
    db.commit()
    db.refresh(tour)

    return tour


@router.put("/dashboard/tours/{tour_id}", status_code=status.HTTP_200_OK)
def update_tour(
    tour_id: int,
    title: Optional[str] = None,
    description: Optional[str] = None,
    itinerary: Optional[str] = None,
    price: Optional[float] = None,
    capacity: Optional[int] = None,
    active: Optional[bool] = None,
    current_user: User = Depends(get_current_guide),
    db: Session = Depends(get_db)
):
    """
    Update an existing tour listing.
    """
    # Ensure the user is a guide
    if current_user.role != RoleEnum.guide:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is for guide accounts only",
        )

    # Check if guide is verified
    guide_profile = db.query(GuideProfile).filter(GuideProfile.user_id == current_user.id).first()
    if not guide_profile or guide_profile.verification_status != "approved":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only verified guides can update tours",
        )

    tour = db.query(TourListing).filter(
        TourListing.id == tour_id,
        TourListing.guide_id == current_user.id
    ).first()

    if not tour:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tour not found or not owned by this guide",
        )

    # Update fields if provided
    if title is not None:
        tour.title = title
    if description is not None:
        tour.description = description
    if itinerary is not None:
        tour.itinerary = itinerary
    if price is not None:
        if price <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Price must be greater than zero",
            )
        tour.price = price
    if capacity is not None:
        if capacity <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Capacity must be greater than zero",
            )
        tour.capacity = capacity
    if active is not None:
        tour.active = active

    tour.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(tour)

    return tour


@router.delete("/dashboard/tours/{tour_id}", status_code=status.HTTP_200_OK)
def delete_tour(
    tour_id: int,
    current_user: User = Depends(get_current_guide),
    db: Session = Depends(get_db)
):
    """
    Delete a tour listing (soft delete by setting active=False).
    """
    # Ensure the user is a guide
    if current_user.role != RoleEnum.guide:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is for guide accounts only",
        )

    # Check if guide is verified
    guide_profile = db.query(GuideProfile).filter(GuideProfile.user_id == current_user.id).first()
    if not guide_profile or guide_profile.verification_status != "approved":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only verified guides can delete tours",
        )

    tour = db.query(TourListing).filter(
        TourListing.id == tour_id,
        TourListing.guide_id == current_user.id
    ).first()

    if not tour:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tour not found or not owned by this guide",
        )

    # Soft delete
    tour.active = False
    tour.updated_at = datetime.utcnow()
    db.commit()

    return {"message": "Tour deleted successfully"}


@router.get("/dashboard/bookings", status_code=status.HTTP_200_OK)
def get_guide_bookings(
    current_user: User = Depends(get_current_guide),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[str] = None
):
    """
    Get all bookings for the guide's tours.
    """
    # Ensure the user is a guide
    if current_user.role != RoleEnum.guide:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is for guide accounts only",
        )

    # Check if guide is verified
    guide_profile = db.query(GuideProfile).filter(GuideProfile.user_id == current_user.id).first()
    if not guide_profile or guide_profile.verification_status != "approved":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only verified guides can access their bookings",
        )

    query = db.query(Booking).join(TourListing).filter(
        TourListing.guide_id == current_user.id
    )

    if status_filter:
        try:
            status_enum = BookingStatusEnum(status_filter)
            query = query.filter(Booking.status == status_enum)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status: {status_filter}",
            )

    bookings = query.offset(skip).limit(limit).all()

    return bookings


@router.put("/dashboard/bookings/{booking_id}/status", status_code=status.HTTP_200_OK)
def update_booking_status(
    booking_id: int,
    booking_status: str = Query(..., alias="status"),
    current_user: User = Depends(get_current_guide),
    db: Session = Depends(get_db)
):
    """
    Update booking status (accept/decline).
    """
    # Ensure the user is a guide
    if current_user.role != RoleEnum.guide:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is for guide accounts only",
        )

    booking = db.query(Booking).join(TourListing).filter(
        Booking.id == booking_id,
        TourListing.guide_id == current_user.id
    ).first()

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found or not associated with this guide's tours",
        )

    # Validate status
    try:
        status_enum = BookingStatusEnum(booking_status)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status: {booking_status}",
        )

    # Only allow pending -> accepted/declined transitions.
    if booking.status != BookingStatusEnum.pending or status_enum not in (
        BookingStatusEnum.accepted,
        BookingStatusEnum.declined,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending bookings can be updated",
        )

    booking.status = status_enum
    db.commit()
    db.refresh(booking)

    return booking


@router.get("/dashboard/earnings", status_code=status.HTTP_200_OK)
def get_guide_earnings(
    current_user: User = Depends(get_current_guide),
    db: Session = Depends(get_db),
    days: int = 30
):
    """
    Get earnings statistics for the guide.
    """
    # Ensure the user is a guide
    if current_user.role != RoleEnum.guide:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is for guide accounts only",
        )

    # Check if guide is verified
    guide_profile = db.query(GuideProfile).filter(GuideProfile.user_id == current_user.id).first()
    if not guide_profile or guide_profile.verification_status != "approved":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only verified guides can access their earnings",
        )

    # Calculate date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)

    # Get completed bookings earnings within date range
    earnings_query = db.query(
        func.sum(TourListing.price).label('total_earnings'),
        func.count(Booking.id).label('completed_tours')
    ).join(Booking).filter(
        TourListing.guide_id == current_user.id,
        Booking.status == BookingStatusEnum.completed,
        Booking.created_at >= start_date,
        Booking.created_at <= end_date
    )

    result = earnings_query.first()

    # Get daily earnings breakdown
    daily_earnings = db.query(
        func.date(Booking.created_at).label('date'),
        func.sum(TourListing.price).label('earnings'),
        func.count(Booking.id).label('tour_count')
    ).join(Booking).filter(
        TourListing.guide_id == current_user.id,
        Booking.status == BookingStatusEnum.completed,
        Booking.created_at >= start_date,
        Booking.created_at <= end_date
    ).group_by(func.date(Booking.created_at)).all()

    return {
        "period_days": days,
        "total_earnings": float(result.total_earnings or 0),
        "completed_tours": result.completed_tours or 0,
        "average_per_tour": float(result.total_earnings or 0) / max(result.completed_tours or 1, 1),
        "daily_breakdown": [
            {
                "date": str(day.date),
                "earnings": float(day.earnings or 0),
                "tour_count": day.tour_count
            }
            for day in daily_earnings
        ]
    }


@router.get("/dashboard/withdrawal/history", status_code=status.HTTP_200_OK)
def get_guide_withdrawal_history(
    current_user: User = Depends(get_current_guide),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """
    Get withdrawal history for the guide.
    """
    # Ensure the user is a guide
    if current_user.role != RoleEnum.guide:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is for guide accounts only",
        )

    # Check if guide is verified
    guide_profile = db.query(GuideProfile).filter(GuideProfile.user_id == current_user.id).first()
    if not guide_profile or guide_profile.verification_status != "approved":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only verified guides can access withdrawal history",
        )

    withdrawals = db.query(Withdrawal).filter(
        Withdrawal.guide_id == current_user.id
    ).order_by(Withdrawal.created_at.desc()).offset(skip).limit(limit).all()

    return [
        {
            "id": w.id,
            "amount": w.amount,
            "status": w.status,
            "payment_method": w.payment_method,
            "payment_details": w.payment_details,
            "processed_at": w.processed_at.isoformat() if w.processed_at else None,
            "failed_reason": w.failed_reason,
            "created_at": w.created_at.isoformat(),
            "updated_at": w.updated_at.isoformat()
        }
        for w in withdrawals
    ]


@router.post("/dashboard/withdrawal/request", status_code=status.HTTP_200_OK)
def request_guide_withdrawal(
    amount: float,
    payment_method: str,
    payment_details: Optional[str] = None,
    current_user: User = Depends(get_current_guide),
    db: Session = Depends(get_db)
):
    """
    Request a withdrawal of earnings.
    """
    # Ensure the user is a guide
    if current_user.role != RoleEnum.guide:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is for guide accounts only",
        )

    # Check if guide is verified
    guide_profile = db.query(GuideProfile).filter(GuideProfile.user_id == current_user.id).first()
    if not guide_profile or guide_profile.verification_status != "approved":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only verified guides can request withdrawals",
        )

    # Validate amount
    if amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Withdrawal amount must be greater than zero",
        )

    # Check if sufficient balance
    if guide_profile.available_balance < amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient balance for withdrawal",
        )

    # Create withdrawal record
    withdrawal = Withdrawal(
        guide_id=current_user.id,
        amount=amount,
        payment_method=payment_method,
        payment_details=payment_details,
        status=WithdrawalStatusEnum.pending
    )

    db.add(withdrawal)
    db.commit()
    db.refresh(withdrawal)

    return {
        "id": withdrawal.id,
        "amount": withdrawal.amount,
        "status": withdrawal.status,
        "payment_method": withdrawal.payment_method,
        "payment_details": withdrawal.payment_details,
        "created_at": withdrawal.created_at.isoformat(),
        "updated_at": withdrawal.updated_at.isoformat(),
        "message": "Withdrawal request submitted successfully"
    }