import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator

from app.models.roadmap_item import VALID_STATUSES


class RoadmapItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    product_id: uuid.UUID
    priority: int
    feature: str
    reasoning: str
    supporting_evidence: str | None
    expected_impact: str
    risks: str | None
    timeline: str | None
    status: str
    generated_at: datetime


class RoadmapStatusUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def status_is_valid(cls, value: str) -> str:
        if value not in VALID_STATUSES:
            raise ValueError(f"Status must be one of: {', '.join(VALID_STATUSES)}")
        return value
