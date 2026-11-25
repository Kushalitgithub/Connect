"""
Review model for guide reviews left by tourists after completed bookings.
"""
from sqlalchemy import Column, Integer, DateTime, String, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base
from app.models.user import User


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False, index=True)
    tourist_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    guide_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)  # 1-5
    body = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("booking_id", name="uq_reviews_booking_id"),
    )

    # Relationships
    booking = relationship("Booking", foreign_keys=[booking_id])
    tourist = relationship("User", foreign_keys=[tourist_id])
    guide = relationship("User", foreign_keys=[guide_id])
