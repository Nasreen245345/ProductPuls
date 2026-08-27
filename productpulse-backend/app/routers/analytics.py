from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.services import analytics_service

router = APIRouter(prefix="/api/v1/analytics", tags=["Analytics"])


@router.get("/dashboard")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    dashboard = analytics_service.get_dashboard(db, current_user.id)
    return {"success": True, "data": dashboard.model_dump(mode="json")}
