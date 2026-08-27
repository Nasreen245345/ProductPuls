import uuid
from datetime import datetime

from sqlalchemy import String, Text, DateTime, Integer, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

VALID_STATUSES = ("Planned", "In Progress", "Completed")


class RoadmapItem(Base):
    __tablename__ = "roadmap_items"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True
    )

    priority: Mapped[int] = mapped_column(Integer, nullable=False)
    feature: Mapped[str] = mapped_column(String(200), nullable=False)
    reasoning: Mapped[str] = mapped_column(Text, nullable=False)
    supporting_evidence: Mapped[str | None] = mapped_column(Text, nullable=True)
    expected_impact: Mapped[str] = mapped_column(String(20), nullable=False)
    risks: Mapped[str | None] = mapped_column(Text, nullable=True)
    timeline: Mapped[str | None] = mapped_column(String(50), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="Planned")

    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    product = relationship("Product")
