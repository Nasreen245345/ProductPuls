import uuid
from datetime import date, datetime

from pydantic import BaseModel


class DashboardOverview(BaseModel):
    total_products: int
    total_feedback: int
    total_feature_requests: int
    total_pain_points: int


class FeedbackVolumePoint(BaseModel):
    date: date
    count: int


class SentimentCount(BaseModel):
    sentiment: str
    count: int


class CategoryCount(BaseModel):
    category: str
    count: int


class DashboardCharts(BaseModel):
    feedback_over_time: list[FeedbackVolumePoint]
    sentiment_distribution: list[SentimentCount]
    category_breakdown: list[CategoryCount]


class PainPointSummary(BaseModel):
    label: str
    product_name: str | None
    mentions: int


class FeatureRequestSummary(BaseModel):
    label: str
    mentions: int


class DashboardInsights(BaseModel):
    top_pain_points: list[PainPointSummary]
    top_feature_requests: list[FeatureRequestSummary]
    summary: str


class RecentFeedbackItem(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    product_name: str
    feedback_text: str
    sentiment: str | None
    created_at: datetime


class DashboardResponse(BaseModel):
    overview: DashboardOverview
    charts: DashboardCharts
    insights: DashboardInsights
    recent_feedback: list[RecentFeedbackItem]
