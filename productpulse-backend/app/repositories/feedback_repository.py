import math
import uuid

from sqlalchemy import func
from sqlalchemy.orm import Session, selectinload

from app.models.feedback import Feedback
from app.models.product import Product


def _base_query_for_user(db: Session, user_id: uuid.UUID):
    """Every feedback query starts here — the join to Product is what enforces ownership."""
    return (
        db.query(Feedback)
        .join(Product, Feedback.product_id == Product.id)
        .filter(Product.user_id == user_id)
        .options(selectinload(Feedback.analysis))
    )


def list_for_user(
    db: Session,
    user_id: uuid.UUID,
    *,
    page: int,
    limit: int,
    search: str | None = None,
    product_id: uuid.UUID | None = None,
    source: str | None = None,
    customer_type: str | None = None,
) -> tuple[list[Feedback], int]:
    query = _base_query_for_user(db, user_id)

    if search:
        query = query.filter(Feedback.feedback_text.ilike(f"%{search}%"))
    if product_id:
        query = query.filter(Feedback.product_id == product_id)
    if source:
        query = query.filter(Feedback.source == source)
    if customer_type:
        query = query.filter(Feedback.customer_type == customer_type)

    total = query.with_entities(func.count(Feedback.id)).scalar()
    items = query.order_by(Feedback.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    return items, total


def get_by_id_for_user(db: Session, feedback_id: uuid.UUID, user_id: uuid.UUID) -> Feedback | None:
    return _base_query_for_user(db, user_id).filter(Feedback.id == feedback_id).first()


def product_belongs_to_user(db: Session, product_id: uuid.UUID, user_id: uuid.UUID) -> bool:
    return db.query(Product).filter(Product.id == product_id, Product.user_id == user_id).first() is not None


def create(db: Session, *, product_id: uuid.UUID, feedback_text: str, source: str | None, customer_type: str | None) -> Feedback:
    feedback = Feedback(product_id=product_id, feedback_text=feedback_text, source=source, customer_type=customer_type)
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback


def update(db: Session, feedback: Feedback, *, feedback_text: str | None, source: str | None, customer_type: str | None) -> Feedback:
    if feedback_text is not None:
        feedback.feedback_text = feedback_text
    if source is not None:
        feedback.source = source
    if customer_type is not None:
        feedback.customer_type = customer_type
    db.commit()
    db.refresh(feedback)
    return feedback


def delete(db: Session, feedback: Feedback) -> None:
    db.delete(feedback)
    db.commit()


def total_pages(total: int, limit: int) -> int:
    return max(1, math.ceil(total / limit)) if total else 0
