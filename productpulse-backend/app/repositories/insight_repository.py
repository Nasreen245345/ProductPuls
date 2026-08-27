import uuid

from sqlalchemy.orm import Session

from app.models.feedback import Feedback
from app.models.feedback_analysis import FeedbackAnalysis
from app.models.product_insight import ProductInsight


def get_by_product_id(db: Session, product_id: uuid.UUID) -> ProductInsight | None:
    return db.query(ProductInsight).filter(ProductInsight.product_id == product_id).first()


def upsert(db: Session, product_id: uuid.UUID, **fields) -> ProductInsight:
    existing = get_by_product_id(db, product_id)
    if existing:
        for key, value in fields.items():
            setattr(existing, key, value)
        insight = existing
    else:
        insight = ProductInsight(product_id=product_id, **fields)
        db.add(insight)
    db.commit()
    db.refresh(insight)
    return insight


def get_successful_analyses_for_product(db: Session, product_id: uuid.UUID) -> list[FeedbackAnalysis]:
    """Only successfully analyzed feedback feeds insight generation — pending/failed analyses have no signal to offer."""
    return (
        db.query(FeedbackAnalysis)
        .join(Feedback, FeedbackAnalysis.feedback_id == Feedback.id)
        .filter(Feedback.product_id == product_id, FeedbackAnalysis.analysis_status == "success")
        .all()
    )


def compute_aggregation(analyses: list[FeedbackAnalysis]) -> dict:
    """Deterministic aggregation — no LLM involved. This is the 'Feedback aggregation' half of Module 5."""

    def _distribution(values: list[str | None]) -> dict[str, int]:
        counts: dict[str, int] = {}
        for v in values:
            if v:
                counts[v] = counts.get(v, 0) + 1
        return dict(sorted(counts.items(), key=lambda kv: -kv[1]))

    return {
        "total_analyzed": len(analyses),
        "category_distribution": _distribution([a.category for a in analyses]),
        "sentiment_distribution": _distribution([a.sentiment for a in analyses]),
        "urgency_distribution": _distribution([a.urgency for a in analyses]),
        "user_type_distribution": _distribution([a.user_type for a in analyses]),
        "business_impact_distribution": _distribution([a.business_impact for a in analyses]),
    }


def sample_evidence(analyses: list[FeedbackAnalysis], limit: int = 30) -> list[dict]:
    """Bounded sample sent to the LLM — Chapter 8 §14 cost optimization: aggregated evidence, not every raw item."""
    return [
        {
            "pain_point": a.pain_point,
            "feature_request": a.feature_request,
            "summary": a.summary,
            "user_type": a.user_type,
        }
        for a in analyses[:limit]
    ]
