"""
Withdrawal model for tracking guide earnings withdrawals.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.db.base import Base
from app.models.user import User


class WithdrawalStatusEnum(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"
    cancelled = "cancelled"


class Withdrawal(Base):
    __tablename__ = "withdrawals"

    id = Column(Integer, primary_key=True, index=True)
    guide_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String(20), default=WithdrawalStatusEnum.pending)  # pending, processing, completed, failed, cancelled
    payment_method = Column(String(50))  # e.g., "bank_transfer", "paypal", etc.
    payment_details = Column(Text)  # JSON or encrypted details for payment
    processed_at = Column(DateTime(timezone=True), nullable=True)
    failed_reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    guide = relationship("User", foreign_keys=[guide_id])

    def __repr__(self):
        return f"<Withdrawal(id={self.id}, guide_id={self.guide_id}, amount={self.amount}, status='{self.status}')>"