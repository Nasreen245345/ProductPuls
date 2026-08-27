import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.roadmap import RoadmapItemResponse, RoadmapStatusUpdate
from app.services import roadmap_service

router = APIRouter(prefix="/api/v1", tags=["Roadmap"])


@router.post("/products/{product_id}/roadmap/generate")
async def generate_roadmap(
    product_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    items = await roadmap_service.generate_roadmap(db, product_id, current_user.id)
    return {"success": True, "data": [RoadmapItemResponse.model_validate(i).model_dump(mode="json") for i in items]}


@router.get("/products/{product_id}/roadmap")
def get_roadmap(
    product_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    items = roadmap_service.get_roadmap(db, product_id, current_user.id)
    return {"success": True, "data": [RoadmapItemResponse.model_validate(i).model_dump(mode="json") for i in items]}


@router.patch("/roadmap/{item_id}")
def update_roadmap_item_status(
    item_id: uuid.UUID,
    payload: RoadmapStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    item = roadmap_service.update_item_status(db, item_id, current_user.id, payload.status)
    return {"success": True, "data": RoadmapItemResponse.model_validate(item).model_dump(mode="json")}
