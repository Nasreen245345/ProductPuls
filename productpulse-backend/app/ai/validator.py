from typing import Literal

from pydantic import BaseModel, ValidationError

Sentiment = Literal["Positive", "Neutral", "Negative"]
Urgency = Literal["Low", "Medium", "High"]
BusinessImpact = Literal["Low", "Medium", "High"]


class RawAnalysisOutput(BaseModel):
    pain_point: str | None = None
    feature_request: str | None = None
    category: str
    sentiment: Sentiment
    urgency: Urgency
    user_type: str | None = None
    business_impact: BusinessImpact | None = None
    summary: str


def validate_raw_output(data: dict) -> RawAnalysisOutput:
    """Raises pydantic.ValidationError on missing fields, wrong types, or disallowed enum values."""
    return RawAnalysisOutput.model_validate(data)


class PainPointInsight(BaseModel):
    theme: str
    description: str
    supporting_count: int


class UserSegmentInsight(BaseModel):
    segment: str
    characteristics: str
    feedback_count: int


class FeatureOpportunityInsight(BaseModel):
    opportunity: str
    reasoning: str
    supporting_evidence: str


class RevenueOpportunityInsight(BaseModel):
    opportunity: str
    reasoning: str
    potential_impact: Literal["Low", "Medium", "High"]


class RawInsightOutput(BaseModel):
    summary: str
    top_pain_points: list[PainPointInsight]
    user_segments: list[UserSegmentInsight]
    feature_opportunities: list[FeatureOpportunityInsight]
    revenue_opportunities: list[RevenueOpportunityInsight]


def validate_raw_insight_output(data: dict) -> RawInsightOutput:
    return RawInsightOutput.model_validate(data)


class RoadmapItemOutput(BaseModel):
    priority: int
    feature: str
    reasoning: str
    supporting_evidence: str | None = None
    expected_impact: Literal["Low", "Medium", "High"]
    risks: str | None = None
    timeline: str | None = None


class RawRoadmapOutput(BaseModel):
    items: list[RoadmapItemOutput]


def validate_raw_roadmap_output(data: dict) -> RawRoadmapOutput:
    return RawRoadmapOutput.model_validate(data)


__all__ = [
    "RawAnalysisOutput",
    "validate_raw_output",
    "RawInsightOutput",
    "validate_raw_insight_output",
    "RawRoadmapOutput",
    "validate_raw_roadmap_output",
    "ValidationError",
]
