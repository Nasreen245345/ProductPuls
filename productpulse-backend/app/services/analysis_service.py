import time
import uuid

from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.ai.llm_client import get_llm_client
from app.ai.parser import MalformedAIResponseError, parse_llm_response
from app.ai.prompt_builder import SYSTEM_PROMPT, build_analysis_prompt
from app.ai.validator import validate_raw_output
from app.core.exceptions import NotFoundException
from app.core.logging import get_logger
from app.models.feedback_analysis import FeedbackAnalysis
from app.repositories import analysis_repository
from app.services import feedback_service

logger = get_logger(__name__)

MAX_ATTEMPTS = 3  # Chapter 8 §11 retry strategy.
PROMPT_VERSION = "v1"


async def analyze_feedback(db: Session, feedback_id: uuid.UUID, user_id: uuid.UUID) -> FeedbackAnalysis:
    """
    FR-013 through FR-016. Ownership is checked first (raises NotFoundException
    if the feedback doesn't exist or isn't the caller's). Retries up to
    MAX_ATTEMPTS on malformed/invalid AI output; on total failure, stores a
    'failed' analysis with the error rather than losing anything — the raw
    feedback was already safely persisted before this function is ever called.
    """
    feedback = feedback_service.get_feedback(db, feedback_id, user_id)
    analysis_repository.mark_pending(db, feedback.id)

    client = get_llm_client()
    prompt = build_analysis_prompt(feedback.feedback_text)

    last_error: Exception | None = None
    started_at = time.monotonic()

    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            raw_text = await client.complete(SYSTEM_PROMPT, prompt)
            parsed = parse_llm_response(raw_text)
            validated = validate_raw_output(parsed)

            processing_time_ms = int((time.monotonic() - started_at) * 1000)
            logger.info(
                "Analysis succeeded for feedback %s (attempt %d/%d, model=%s, %dms)",
                feedback.id,
                attempt,
                MAX_ATTEMPTS,
                client.model_name,
                processing_time_ms,
            )

            return analysis_repository.upsert(
                db,
                feedback.id,
                pain_point=validated.pain_point,
                feature_request=validated.feature_request,
                category=validated.category,
                sentiment=validated.sentiment,
                urgency=validated.urgency,
                user_type=validated.user_type,
                business_impact=validated.business_impact,
                summary=validated.summary,
                model_name=client.model_name,
                model_version=None,
                prompt_version=PROMPT_VERSION,
                confidence_score=None,  # Not requested from the model — never fabricate a number here.
                processing_time_ms=processing_time_ms,
                analysis_status="success",
                error_message=None,
                analyzed_at=analysis_repository.now_utc(),
            )

        except (MalformedAIResponseError, ValidationError) as exc:
            last_error = exc
            logger.warning("Analysis attempt %d/%d failed for feedback %s: %s", attempt, MAX_ATTEMPTS, feedback.id, exc)
        except Exception as exc:  # network/provider errors — still retryable, still logged, never silent
            last_error = exc
            logger.warning("Analysis attempt %d/%d errored for feedback %s: %s", attempt, MAX_ATTEMPTS, feedback.id, exc)

    processing_time_ms = int((time.monotonic() - started_at) * 1000)
    logger.error("Analysis failed for feedback %s after %d attempts: %s", feedback.id, MAX_ATTEMPTS, last_error)

    return analysis_repository.upsert(
        db,
        feedback.id,
        model_name=client.model_name,
        prompt_version=PROMPT_VERSION,
        processing_time_ms=processing_time_ms,
        analysis_status="failed",
        error_message=str(last_error)[:500] if last_error else "Unknown error.",
        analyzed_at=analysis_repository.now_utc(),
    )


def get_analysis(db: Session, feedback_id: uuid.UUID, user_id: uuid.UUID) -> FeedbackAnalysis:
    feedback_service.get_feedback(db, feedback_id, user_id)  # raises NotFoundException if missing/not owned
    analysis = analysis_repository.get_by_feedback_id(db, feedback_id)
    if not analysis:
        raise NotFoundException("Analysis not found for this feedback.", error_code="ANALYSIS_NOT_FOUND")
    return analysis
