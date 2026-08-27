import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.insight import ProductInsightResponse
from app.services import insight_service

router = APIRouter(prefix="/api/v1/products", tags=["Insights"])


@router.post("/{product_id}/insights/generate")
async def generate_insights(
    product_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    insight = await insight_service.generate_insights(db, product_id, current_user.id)
    return {"success": True, "data": ProductInsightResponse.model_validate(insight).model_dump(mode="json")}


@router.get("/{product_id}/insights")
def get_insights(
    product_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    insight = insight_service.get_insights(db, product_id, current_user.id)
    return {"success": True, "data": ProductInsightResponse.model_validate(insight).model_dump(mode="json")}
