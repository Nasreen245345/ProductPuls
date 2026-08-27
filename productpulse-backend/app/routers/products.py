import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.repositories.feedback_repository import total_pages
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate
from app.services import product_service

router = APIRouter(prefix="/api/v1/products", tags=["Products"])


@router.post("", status_code=201)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    product = product_service.create_product(db, payload, current_user.id)
    return {
        "success": True,
        "message": "Product created successfully.",
        "data": ProductResponse.model_validate(product).model_dump(mode="json"),
    }


@router.get("")
def list_products(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    items, total = product_service.list_products(db, current_user.id, page=page, limit=limit, search=search)
    return {
        "success": True,
        "data": {
            "items": [ProductResponse.model_validate(p).model_dump(mode="json") for p in items],
            "pagination": {"page": page, "limit": limit, "total": total, "pages": total_pages(total, limit)},
        },
    }


@router.get("/{product_id}")
def get_product(
    product_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    product = product_service.get_product(db, product_id, current_user.id)
    return {"success": True, "data": ProductResponse.model_validate(product).model_dump(mode="json")}


@router.put("/{product_id}")
def update_product(
    product_id: uuid.UUID,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    product = product_service.update_product(db, product_id, payload, current_user.id)
    return {
        "success": True,
        "message": "Product updated successfully.",
        "data": ProductResponse.model_validate(product).model_dump(mode="json"),
    }


@router.delete("/{product_id}", status_code=204)
def delete_product(
    product_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    product_service.delete_product(db, product_id, current_user.id)
