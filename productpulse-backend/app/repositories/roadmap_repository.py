import uuid

from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.roadmap_item import RoadmapItem


def list_for_product(db: Session, product_id: uuid.UUID) -> list[RoadmapItem]:
    return db.query(RoadmapItem).filter(RoadmapItem.product_id == product_id).order_by(RoadmapItem.priority).all()


def replace_all(db: Session, product_id: uuid.UUID, items: list[dict]) -> list[RoadmapItem]:
    """Regeneration replaces the whole roadmap — matches how Insights is regenerated. Status resets to Planned."""
    db.query(RoadmapItem).filter(RoadmapItem.product_id == product_id).delete()

    created = []
    for item in items:
        row = RoadmapItem(product_id=product_id, **item)
        db.add(row)
        created.append(row)

    db.commit()
    for row in created:
        db.refresh(row)
    return sorted(created, key=lambda r: r.priority)


def get_by_id_for_user(db: Session, item_id: uuid.UUID, user_id: uuid.UUID) -> RoadmapItem | None:
    """Ownership enforced by joining through Product, same pattern as Feedback."""
    return (
        db.query(RoadmapItem)
        .join(Product, RoadmapItem.product_id == Product.id)
        .filter(RoadmapItem.id == item_id, Product.user_id == user_id)
        .first()
    )


def update_status(db: Session, item: RoadmapItem, status: str) -> RoadmapItem:
    item.status = status
    db.commit()
    db.refresh(item)
    return item
