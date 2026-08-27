import uuid

from sqlalchemy.orm import Session

from app.repositories import analytics_repository as repo
from app.schemas.analytics import DashboardResponse


def _build_summary(total_feedback: int, category_counts: list[tuple], sentiment_counts: list[tuple]) -> str:
    """A computed narrative, not an LLM call — see module docstring."""
    if total_feedback == 0:
        return "No feedback has been analyzed yet. Submit and analyze feedback to see insights here."

    top_category = category_counts[0][0] if category_counts else None
    sentiment_map = dict(sentiment_counts)
    negative = sentiment_map.get("Negative", 0)
    total_sentiment = sum(sentiment_map.values()) or 1
    negative_share = round((negative / total_sentiment) * 100)

    parts = [f"{total_feedback} feedback item(s) analyzed across your products."]
    if top_category:
        parts.append(f"Most common category: {top_category}.")
    if negative > 0:
        parts.append(f"{negative_share}% of analyzed feedback is negative — worth reviewing top pain points below.")
    return " ".join(parts)


def get_dashboard(db: Session, user_id: uuid.UUID) -> DashboardResponse:
    total_products = repo.count_products(db, user_id)
    total_feedback = repo.count_feedback(db, user_id)
    total_feature_requests = repo.count_analyses_with_field(db, user_id, "feature_request")
    total_pain_points = repo.count_analyses_with_field(db, user_id, "pain_point")

    volume_rows = repo.feedback_volume_by_day(db, user_id)
    sentiment_rows = repo.sentiment_distribution(db, user_id)
    category_rows = repo.category_distribution(db, user_id)
    pain_point_rows = repo.top_pain_points(db, user_id)
    feature_request_rows = repo.top_feature_requests(db, user_id)
    recent_rows = repo.recent_feedback(db, user_id)

    return DashboardResponse(
        overview={
            "total_products": total_products,
            "total_feedback": total_feedback,
            "total_feature_requests": total_feature_requests,
            "total_pain_points": total_pain_points,
        },
        charts={
            "feedback_over_time": [{"date": d, "count": c} for d, c in volume_rows],
            "sentiment_distribution": [{"sentiment": s, "count": c} for s, c in sentiment_rows],
            "category_breakdown": [{"category": cat, "count": c} for cat, c in category_rows],
        },
        insights={
            "top_pain_points": [
                {"label": pain_point, "product_name": product_name, "mentions": mentions}
                for pain_point, product_name, mentions in pain_point_rows
            ],
            "top_feature_requests": [
                {"label": feature_request, "mentions": mentions} for feature_request, mentions in feature_request_rows
            ],
            "summary": _build_summary(total_feedback, category_rows, sentiment_rows),
        },
        recent_feedback=[
            {
                "id": fb.id,
                "product_id": fb.product_id,
                "product_name": product_name,
                "feedback_text": fb.feedback_text,
                "sentiment": sentiment,
                "created_at": fb.created_at,
            }
            for fb, product_name, sentiment in recent_rows
        ],
    )
