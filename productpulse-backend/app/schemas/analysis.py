import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AnalysisResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    feedback_id: uuid.UUID
    pain_point: str | None
    feature_request: str | None
    category: str | None
    sentiment: str | None
    urgency: str | None
    user_type: str | None
    business_impact: str | None
    summary: str | None
    model_name: str | None
    model_version: str | None
    prompt_version: str | None
    confidence_score: float | None
    processing_time_ms: int | None
    analysis_status: str
    error_message: str | None
    analyzed_at: datetime | None
