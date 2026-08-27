import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.feedback_analysis import FeedbackAnalysis


def get_by_feedback_id(db: Session, feedback_id: uuid.UUID) -> FeedbackAnalysis | None:
    return db.query(FeedbackAnalysis).filter(FeedbackAnalysis.feedback_id == feedback_id).first()


def upsert(db: Session, feedback_id: uuid.UUID, **fields) -> FeedbackAnalysis:
    existing = get_by_feedback_id(db, feedback_id)

    if existing:
        for key, value in fields.items():
            setattr(existing, key, value)
        analysis = existing
    else:
        analysis = FeedbackAnalysis(feedback_id=feedback_id, **fields)
        db.add(analysis)

    db.commit()
    db.refresh(analysis)
    return analysis


def mark_pending(db: Session, feedback_id: uuid.UUID) -> FeedbackAnalysis:
    """Set before calling the LLM, so a crash mid-call still leaves a visible 'pending' state, not silence."""
    return upsert(db, feedback_id, analysis_status="pending", error_message=None)


def now_utc() -> datetime:
    return datetime.now(timezone.utc)
