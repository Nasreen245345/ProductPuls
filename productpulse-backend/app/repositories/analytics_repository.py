import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.feedback import Feedback
from app.models.feedback_analysis import FeedbackAnalysis
from app.models.product import Product

VOLUME_TREND_DAYS = 14
TOP_ITEMS_LIMIT = 5
RECENT_FEEDBACK_LIMIT = 5


def count_products(db: Session, user_id: uuid.UUID) -> int:
    return db.query(func.count(Product.id)).filter(Product.user_id == user_id).scalar() or 0


def count_feedback(db: Session, user_id: uuid.UUID) -> int:
    return (
        db.query(func.count(Feedback.id))
        .join(Product, Feedback.product_id == Product.id)
        .filter(Product.user_id == user_id)
        .scalar()
        or 0
    )


def count_analyses_with_field(db: Session, user_id: uuid.UUID, field: str) -> int:
    column = getattr(FeedbackAnalysis, field)
    return (
        db.query(func.count(FeedbackAnalysis.id))
        .join(Feedback, FeedbackAnalysis.feedback_id == Feedback.id)
        .join(Product, Feedback.product_id == Product.id)
        .filter(Product.user_id == user_id, column.isnot(None))
        .scalar()
        or 0
    )


def feedback_volume_by_day(db: Session, user_id: uuid.UUID, days: int = VOLUME_TREND_DAYS) -> list[tuple]:
    since = datetime.now(timezone.utc) - timedelta(days=days)
    day = func.date(Feedback.created_at)
    rows = (
        db.query(day.label("day"), func.count(Feedback.id).label("count"))
        .join(Product, Feedback.product_id == Product.id)
        .filter(Product.user_id == user_id, Feedback.created_at >= since)
        .group_by(day)
        .order_by(day)
        .all()
    )
    return [(row.day, row.count) for row in rows]


def sentiment_distribution(db: Session, user_id: uuid.UUID) -> list[tuple]:
    rows = (
        db.query(FeedbackAnalysis.sentiment, func.count(FeedbackAnalysis.id))
        .join(Feedback, FeedbackAnalysis.feedback_id == Feedback.id)
        .join(Product, Feedback.product_id == Product.id)
        .filter(Product.user_id == user_id, FeedbackAnalysis.sentiment.isnot(None))
        .group_by(FeedbackAnalysis.sentiment)
        .all()
    )
    return list(rows)


def category_distribution(db: Session, user_id: uuid.UUID) -> list[tuple]:
    rows = (
        db.query(FeedbackAnalysis.category, func.count(FeedbackAnalysis.id))
        .join(Feedback, FeedbackAnalysis.feedback_id == Feedback.id)
        .join(Product, Feedback.product_id == Product.id)
        .filter(Product.user_id == user_id, FeedbackAnalysis.category.isnot(None))
        .group_by(FeedbackAnalysis.category)
        .order_by(func.count(FeedbackAnalysis.id).desc())
        .all()
    )
    return list(rows)


def top_pain_points(db: Session, user_id: uuid.UUID, limit: int = TOP_ITEMS_LIMIT) -> list[tuple]:
    """Groups by exact pain_point text — a coarse but honest aggregation, same limitation as free-text grouping elsewhere in this app."""
    rows = (
        db.query(
            FeedbackAnalysis.pain_point,
            func.count(FeedbackAnalysis.id).label("mentions"),
            func.max(Product.name).label("product_name"),
        )
        .join(Feedback, FeedbackAnalysis.feedback_id == Feedback.id)
        .join(Product, Feedback.product_id == Product.id)
        .filter(Product.user_id == user_id, FeedbackAnalysis.pain_point.isnot(None))
        .group_by(FeedbackAnalysis.pain_point)
        .order_by(func.count(FeedbackAnalysis.id).desc())
        .limit(limit)
        .all()
    )
    return [(row.pain_point, row.product_name, row.mentions) for row in rows]


def top_feature_requests(db: Session, user_id: uuid.UUID, limit: int = TOP_ITEMS_LIMIT) -> list[tuple]:
    rows = (
        db.query(FeedbackAnalysis.feature_request, func.count(FeedbackAnalysis.id).label("mentions"))
        .join(Feedback, FeedbackAnalysis.feedback_id == Feedback.id)
        .join(Product, Feedback.product_id == Product.id)
        .filter(Product.user_id == user_id, FeedbackAnalysis.feature_request.isnot(None))
        .group_by(FeedbackAnalysis.feature_request)
        .order_by(func.count(FeedbackAnalysis.id).desc())
        .limit(limit)
        .all()
    )
    return [(row.feature_request, row.mentions) for row in rows]


def recent_feedback(db: Session, user_id: uuid.UUID, limit: int = RECENT_FEEDBACK_LIMIT) -> list[tuple]:
    rows = (
        db.query(Feedback, Product.name, FeedbackAnalysis.sentiment)
        .join(Product, Feedback.product_id == Product.id)
        .outerjoin(FeedbackAnalysis, FeedbackAnalysis.feedback_id == Feedback.id)
        .filter(Product.user_id == user_id)
        .order_by(Feedback.created_at.desc())
        .limit(limit)
        .all()
    )
    return list(rows)
