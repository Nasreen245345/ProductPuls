import uuid

from sqlalchemy.orm import Session

from app.ai.llm_client import get_llm_client
from app.ai.parser import parse_llm_response
from app.ai.prompt_builder import ROADMAP_SYSTEM_PROMPT, build_roadmap_prompt
from app.ai.validator import validate_raw_roadmap_output
from app.core.exceptions import NotFoundException, ValidationAppException
from app.core.logging import get_logger
from app.models.roadmap_item import RoadmapItem
from app.repositories import insight_repository, roadmap_repository
from app.repositories.analysis_repository import now_utc
from app.services import product_service

logger = get_logger(__name__)


async def generate_roadmap(db: Session, product_id: uuid.UUID, user_id: uuid.UUID) -> list[RoadmapItem]:
    """Requires an existing ProductInsight (generate insights first). Raises ValidationAppException otherwise."""
    product_service.get_product(db, product_id, user_id)  # ownership check

    insight = insight_repository.get_by_product_id(db, product_id)
    if not insight or not insight.feature_opportunities:
        raise ValidationAppException(
            "No product insights available yet. Generate insights for this product first.",
            error_code="INSIGHTS_REQUIRED",
        )

    client = get_llm_client()
    prompt = build_roadmap_prompt(insight.summary or "", insight.top_pain_points or [], insight.feature_opportunities or [])

    raw_text = await client.complete(ROADMAP_SYSTEM_PROMPT, prompt)
    parsed = parse_llm_response(raw_text)
    validated = validate_raw_roadmap_output(parsed)

    generated_at = now_utc()
    items = [
        {**item.model_dump(), "generated_at": generated_at, "status": "Planned"} for item in validated.items
    ]

    logger.info("Generated %d roadmap items for product %s (model=%s)", len(items), product_id, client.model_name)

    return roadmap_repository.replace_all(db, product_id, items)


def get_roadmap(db: Session, product_id: uuid.UUID, user_id: uuid.UUID) -> list[RoadmapItem]:
    product_service.get_product(db, product_id, user_id)  # ownership check
    items = roadmap_repository.list_for_product(db, product_id)
    if not items:
        raise NotFoundException("No roadmap has been generated for this product yet.", error_code="ROADMAP_NOT_FOUND")
    return items


def update_item_status(db: Session, item_id: uuid.UUID, user_id: uuid.UUID, status: str) -> RoadmapItem:
    item = roadmap_repository.get_by_id_for_user(db, item_id, user_id)
    if not item:
        raise NotFoundException("Roadmap item not found.", error_code="ROADMAP_ITEM_NOT_FOUND")
    return roadmap_repository.update_status(db, item, status)
