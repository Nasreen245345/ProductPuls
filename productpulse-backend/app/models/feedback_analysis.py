import uuid
from datetime import datetime

from sqlalchemy import String, Text, DateTime, ForeignKey, Float, Integer, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class FeedbackAnalysis(Base):
    __tablename__ = "feedback_analysis"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    feedback_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("feedback.id", ondelete="CASCADE"), nullable=False, unique=True, index=True
    )

    # Core extracted fields (Chapter 5 §9) — nullable because a failed/pending analysis has none of these yet.
    pain_point: Mapped[str | None] = mapped_column(Text, nullable=True)
    feature_request: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    sentiment: Mapped[str | None] = mapped_column(String(30), nullable=True)
    urgency: Mapped[str | None] = mapped_column(String(30), nullable=True)
    user_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    business_impact: Mapped[str | None] = mapped_column(String(30), nullable=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)

    # AI observability metadata (Chapter 5 §20).
    model_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    model_version: Mapped[str | None] = mapped_column(String(50), nullable=True)
    prompt_version: Mapped[str | None] = mapped_column(String(20), nullable=True)
    confidence_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    processing_time_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    analysis_status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    analyzed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    feedback = relationship("Feedback", back_populates="analysis")
