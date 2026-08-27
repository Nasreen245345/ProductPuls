import uuid
from datetime import datetime

from sqlalchemy import String, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class ProductInsight(Base):
    __tablename__ = "product_insights"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, unique=True, index=True
    )

    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    top_pain_points: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    user_segments: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    feature_opportunities: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    revenue_opportunities: Mapped[list | None] = mapped_column(JSONB, nullable=True)

    feedback_analyzed_count: Mapped[int] = mapped_column(nullable=False, default=0)
    model_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    generated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    product = relationship("Product")
