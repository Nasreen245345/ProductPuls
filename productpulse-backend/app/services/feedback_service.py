import uuid

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundException
from app.models.feedback import Feedback
from app.repositories import feedback_repository
from app.schemas.feedback import FeedbackCreate, FeedbackUpdate


def list_feedback(
    db: Session,
    user_id: uuid.UUID,
    *,
    page: int,
    limit: int,
    search: str | None,
    product_id: uuid.UUID | None,
    source: str | None,
    customer_type: str | None,
) -> tuple[list[Feedback], int]:
    return feedback_repository.list_for_user(
        db, user_id, page=page, limit=limit, search=search, product_id=product_id, source=source, customer_type=customer_type
    )


def get_feedback(db: Session, feedback_id: uuid.UUID, user_id: uuid.UUID) -> Feedback:
    feedback = feedback_repository.get_by_id_for_user(db, feedback_id, user_id)
    if not feedback:
        raise NotFoundException("Feedback not found.", error_code="FEEDBACK_NOT_FOUND")
    return feedback


def create_feedback(db: Session, payload: FeedbackCreate, user_id: uuid.UUID) -> Feedback:
    # FR-009 / BR-002: feedback must belong to an existing product owned by the caller.
    if not feedback_repository.product_belongs_to_user(db, payload.product_id, user_id):
        raise NotFoundException("Product not found.", error_code="PRODUCT_NOT_FOUND")

    return feedback_repository.create(
        db,
        product_id=payload.product_id,
        feedback_text=payload.feedback_text,
        source=payload.source,
        customer_type=payload.customer_type,
    )


def update_feedback(db: Session, feedback_id: uuid.UUID, payload: FeedbackUpdate, user_id: uuid.UUID) -> Feedback:
    feedback = get_feedback(db, feedback_id, user_id)
    # NOTE (Module 4): once AI analysis exists, editing feedback_text here
    # should also mark any existing analysis as outdated and queue re-analysis (FR-011).
    return feedback_repository.update(
        db, feedback, feedback_text=payload.feedback_text, source=payload.source, customer_type=payload.customer_type
    )


def delete_feedback(db: Session, feedback_id: uuid.UUID, user_id: uuid.UUID) -> None:
    feedback = get_feedback(db, feedback_id, user_id)
    feedback_repository.delete(db, feedback)
