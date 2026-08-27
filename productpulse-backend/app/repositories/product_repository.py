import uuid

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.product import Product


def list_for_user(
    db: Session, user_id: uuid.UUID, *, page: int, limit: int, search: str | None = None
) -> tuple[list[Product], int]:
    query = db.query(Product).filter(Product.user_id == user_id)
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))

    total = query.with_entities(func.count(Product.id)).scalar()
    items = query.order_by(Product.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
    return items, total


def get_by_id_for_user(db: Session, product_id: uuid.UUID, user_id: uuid.UUID) -> Product | None:
    """Scoped to user_id — a product belonging to someone else simply doesn't match, same as not existing."""
    return db.query(Product).filter(Product.id == product_id, Product.user_id == user_id).first()


def create(db: Session, *, user_id: uuid.UUID, name: str, description: str | None) -> Product:
    product = Product(user_id=user_id, name=name, description=description)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def update(db: Session, product: Product, *, name: str | None, description: str | None) -> Product:
    if name is not None:
        product.name = name
    if description is not None:
        product.description = description
    db.commit()
    db.refresh(product)
    return product


def delete(db: Session, product: Product) -> None:
    db.delete(product)
    db.commit()
