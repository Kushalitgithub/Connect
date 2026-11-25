"""
GuideProfile model.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base
from app.models.user import User


class GuideProfile(Base):
    __tablename__ = "guide_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    bio = Column(Text)
    verification_status = Column(String(20), default="pending")  # pending, approved, rejected
    rating_avg = Column(Float, default=0.0)
    id_document_url = Column(String(255), nullable=True)  # URL to ID document in private storage
    license_document_url = Column(String(255), nullable=True)  # URL to license document in private storage
    total_earnings = Column(Float, default=0.0)  # Total earnings accumulated
    available_balance = Column(Float, default=0.0)  # Available balance for withdrawal
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="guide_profile")