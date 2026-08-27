import uuid

from sqlalchemy.orm import Session

from app.ai.llm_client import get_llm_client
from app.ai.parser import parse_llm_response
from app.ai.prompt_builder import INSIGHT_SYSTEM_PROMPT, build_insight_prompt
from app.ai.validator import validate_raw_insight_output
from app.core.exceptions import NotFoundException, ValidationAppException
from app.core.logging import get_logger
from app.models.product_insight import ProductInsight
from app.repositories import insight_repository
from app.repositories.analysis_repository import now_utc
from app.services import product_service

logger = get_logger(__name__)

MIN_ANALYZED_FEEDBACK = 1  # Below this, there's nothing meaningful to synthesize.


async def generate_insights(db: Session, product_id: uuid.UUID, user_id: uuid.UUID) -> ProductInsight:
    """Raises NotFoundException if the product doesn't exist/isn't owned; ValidationAppException if there's no analyzed feedback yet."""
    product_service.get_product(db, product_id, user_id)  # ownership check

    analyses = insight_repository.get_successful_analyses_for_product(db, product_id)
    if len(analyses) < MIN_ANALYZED_FEEDBACK:
        raise ValidationAppException(
            "This product has no analyzed feedback yet. Analyze some feedback first.",
            error_code="INSUFFICIENT_DATA",
        )

    stats = insight_repository.compute_aggregation(analyses)
    evidence = insight_repository.sample_evidence(analyses)

    client = get_llm_client()
    prompt = build_insight_prompt(stats, evidence)

    raw_text = await client.complete(INSIGHT_SYSTEM_PROMPT, prompt)
    parsed = parse_llm_response(raw_text)
    validated = validate_raw_insight_output(parsed)

    logger.info(
        "Generated insights for product %s from %d analyzed feedback items (model=%s)",
        product_id,
        len(analyses),
        client.model_name,
    )

    return insight_repository.upsert(
        db,
        product_id,
        summary=validated.summary,
        top_pain_points=[p.model_dump() for p in validated.top_pain_points],
        user_segments=[s.model_dump() for s in validated.user_segments],
        feature_opportunities=[f.model_dump() for f in validated.feature_opportunities],
        revenue_opportunities=[r.model_dump() for r in validated.revenue_opportunities],
        feedback_analyzed_count=len(analyses),
        model_name=client.model_name,
        generated_at=now_utc(),
    )


def get_insights(db: Session, product_id: uuid.UUID, user_id: uuid.UUID) -> ProductInsight:
    product_service.get_product(db, product_id, user_id)  # ownership check
    insight = insight_repository.get_by_product_id(db, product_id)
    if not insight:
        raise NotFoundException("No insights have been generated for this product yet.", error_code="INSIGHTS_NOT_FOUND")
    return insight
