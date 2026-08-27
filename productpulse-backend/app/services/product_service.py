import uuid

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundException
from app.models.product import Product
from app.repositories import product_repository
from app.schemas.product import ProductCreate, ProductUpdate


def list_products(db: Session, user_id: uuid.UUID, *, page: int, limit: int, search: str | None) -> tuple[list[Product], int]:
    return product_repository.list_for_user(db, user_id, page=page, limit=limit, search=search)


def get_product(db: Session, product_id: uuid.UUID, user_id: uuid.UUID) -> Product:
    product = product_repository.get_by_id_for_user(db, product_id, user_id)
    if not product:
        raise NotFoundException("Product not found.", error_code="PRODUCT_NOT_FOUND")
    return product


def create_product(db: Session, payload: ProductCreate, user_id: uuid.UUID) -> Product:
    return product_repository.create(db, user_id=user_id, name=payload.name, description=payload.description)


def update_product(db: Session, product_id: uuid.UUID, payload: ProductUpdate, user_id: uuid.UUID) -> Product:
    product = get_product(db, product_id, user_id)  # raises NotFoundException if missing/not owned
    return product_repository.update(db, product, name=payload.name, description=payload.description)


def delete_product(db: Session, product_id: uuid.UUID, user_id: uuid.UUID) -> None:
    product = get_product(db, product_id, user_id)
    product_repository.delete(db, product)
