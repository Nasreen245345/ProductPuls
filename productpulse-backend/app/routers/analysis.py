import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.analysis import AnalysisResponse
from app.services import analysis_service

router = APIRouter(prefix="/api/v1/analysis", tags=["Analysis"])


@router.get("/{feedback_id}")
def get_analysis(
    feedback_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    analysis = analysis_service.get_analysis(db, feedback_id, current_user.id)
    return {"success": True, "data": AnalysisResponse.model_validate(analysis).model_dump(mode="json")}
