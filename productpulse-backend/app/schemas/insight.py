import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PainPointItem(BaseModel):
    theme: str
    description: str
    supporting_count: int


class UserSegmentItem(BaseModel):
    segment: str
    characteristics: str
    feedback_count: int


class FeatureOpportunityItem(BaseModel):
    opportunity: str
    reasoning: str
    supporting_evidence: str


class RevenueOpportunityItem(BaseModel):
    opportunity: str
    reasoning: str
    potential_impact: str


class ProductInsightResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    product_id: uuid.UUID
    summary: str | None
    top_pain_points: list[PainPointItem] | None
    user_segments: list[UserSegmentItem] | None
    feature_opportunities: list[FeatureOpportunityItem] | None
    revenue_opportunities: list[RevenueOpportunityItem] | None
    feedback_analyzed_count: int
    model_name: str | None
    generated_at: datetime | None
