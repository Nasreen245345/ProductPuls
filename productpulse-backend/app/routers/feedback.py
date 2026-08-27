import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.repositories.feedback_repository import total_pages
from app.schemas.analysis import AnalysisResponse
from app.schemas.feedback import FeedbackCreate, FeedbackResponse, FeedbackUpdate
from app.services import analysis_service, feedback_service

router = APIRouter(prefix="/api/v1/feedback", tags=["Feedback"])


@router.post("", status_code=201)
def create_feedback(
    payload: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    feedback = feedback_service.create_feedback(db, payload, current_user.id)
    return {
        "success": True,
        "message": "Feedback submitted successfully.",
        "data": FeedbackResponse.model_validate(feedback).model_dump(mode="json"),
    }


@router.get("")
def list_feedback(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    product_id: uuid.UUID | None = Query(None),
    source: str | None = Query(None),
    customer_type: str | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    items, total = feedback_service.list_feedback(
        db,
        current_user.id,
        page=page,
        limit=limit,
        search=search,
        product_id=product_id,
        source=source,
        customer_type=customer_type,
    )
    return {
        "success": True,
        "data": {
            "items": [FeedbackResponse.model_validate(f).model_dump(mode="json") for f in items],
            "pagination": {"page": page, "limit": limit, "total": total, "pages": total_pages(total, limit)},
        },
    }


@router.get("/{feedback_id}")
def get_feedback(
    feedback_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    feedback = feedback_service.get_feedback(db, feedback_id, current_user.id)
    return {"success": True, "data": FeedbackResponse.model_validate(feedback).model_dump(mode="json")}


@router.put("/{feedback_id}")
def update_feedback(
    feedback_id: uuid.UUID,
    payload: FeedbackUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    feedback = feedback_service.update_feedback(db, feedback_id, payload, current_user.id)
    return {
        "success": True,
        "message": "Feedback updated successfully.",
        "data": FeedbackResponse.model_validate(feedback).model_dump(mode="json"),
    }


@router.delete("/{feedback_id}", status_code=204)
def delete_feedback(
    feedback_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    feedback_service.delete_feedback(db, feedback_id, current_user.id)


@router.post("/{feedback_id}/analyze")
async def analyze_feedback(
    feedback_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Triggers AI analysis for a single feedback item (FR-013). Matches the frontend's "Analyze Feedback" button."""
    analysis = await analysis_service.analyze_feedback(db, feedback_id, current_user.id)
    return {"success": True, "data": AnalysisResponse.model_validate(analysis).model_dump(mode="json")}
