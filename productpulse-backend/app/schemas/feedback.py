import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, field_validator

from app.schemas.analysis import AnalysisResponse

# FR-009: Source (Email, Support, Interview, Survey).
FeedbackSource = Literal["Email", "Support", "Interview", "Survey"]


class FeedbackCreate(BaseModel):
    product_id: uuid.UUID
    feedback_text: str
    source: FeedbackSource | None = None
    customer_type: str | None = None

    @field_validator("feedback_text")
    @classmethod
    def text_not_blank(cls, value: str) -> str:
        # FR-015 constraint: max length (Chapter 7 §15).
        stripped = value.strip()
        if not stripped:
            raise ValueError("Feedback text is required.")
        if len(stripped) > 5000:
            raise ValueError("Feedback text cannot exceed 5000 characters.")
        return stripped


class FeedbackUpdate(BaseModel):
    feedback_text: str | None = None
    source: FeedbackSource | None = None
    customer_type: str | None = None

    @field_validator("feedback_text")
    @classmethod
    def text_not_blank_if_present(cls, value: str | None) -> str | None:
        if value is None:
            return value
        stripped = value.strip()
        if not stripped:
            raise ValueError("Feedback text cannot be empty.")
        if len(stripped) > 5000:
            raise ValueError("Feedback text cannot exceed 5000 characters.")
        return stripped


class FeedbackResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    product_id: uuid.UUID
    feedback_text: str
    source: str | None
    customer_type: str | None
    created_at: datetime
    updated_at: datetime
    analysis: AnalysisResponse | None = None


class PaginationMeta(BaseModel):
    page: int
    limit: int
    total: int
    pages: int


class FeedbackListResponse(BaseModel):
    items: list[FeedbackResponse]
    pagination: PaginationMeta
