import asyncio
import uuid

from fastapi.testclient import TestClient

from app.main import app
from app.ai.llm_client import MockLLMClient

client = TestClient(app)

VALID_PASSWORD = "Str0ng!Pass"


def _register_and_login():
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    client.post(
        "/api/v1/auth/register",
        json={"full_name": "Test User", "email": email, "password": VALID_PASSWORD, "confirm_password": VALID_PASSWORD},
    )
    login = client.post("/api/v1/auth/login", json={"email": email, "password": VALID_PASSWORD})
    token = login.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _create_product(headers):
    return client.post("/api/v1/products", json={"name": "TaskFlow"}, headers=headers).json()["data"]["id"]


def _create_feedback(headers, product_id, text):
    return client.post("/api/v1/feedback", json={"product_id": product_id, "feedback_text": text}, headers=headers).json()[
        "data"
    ]["id"]


def test_analyze_negative_feedback():
    headers = _register_and_login()
    product_id = _create_product(headers)
    feedback_id = _create_feedback(headers, product_id, "The dashboard is very slow and it is frustrating our team.")

    response = client.post(f"/api/v1/feedback/{feedback_id}/analyze", headers=headers)
    assert response.status_code == 200
    data = response.json()["data"]

    assert data["analysis_status"] == "success"
    assert data["sentiment"] == "Negative"
    assert data["category"] == "Performance"
    assert data["model_name"] == "mock-heuristic-v1"  # honestly labeled, not claiming to be a real model
    assert data["pain_point"] is not None
    assert data["analyzed_at"] is not None
    assert data["business_impact"] in ("Low", "Medium", "High")


def test_analyze_positive_feedback():
    headers = _register_and_login()
    product_id = _create_product(headers)
    feedback_id = _create_feedback(headers, product_id, "This is a great tool, really love the clean interface.")

    response = client.post(f"/api/v1/feedback/{feedback_id}/analyze", headers=headers)
    data = response.json()["data"]
    assert data["sentiment"] == "Positive"
    assert data["pain_point"] is None


def test_analyze_feature_request():
    headers = _register_and_login()
    product_id = _create_product(headers)
    feedback_id = _create_feedback(
        headers, product_id, "The team really likes the product. Please add dark mode, it would help a lot at night."
    )

    response = client.post(f"/api/v1/feedback/{feedback_id}/analyze", headers=headers)
    data = response.json()["data"]
    assert data["feature_request"] is not None
    # The bug this guards against: grabbing the wrong sentence (a different
    # one) instead of the one that actually contains the request.
    assert "dark mode" in data["feature_request"].lower()
    assert data["category"] == "UI"


def test_analyze_stores_and_get_analysis_retrieves_it():
    headers = _register_and_login()
    product_id = _create_product(headers)
    feedback_id = _create_feedback(headers, product_id, "The invoice export is slow.")

    client.post(f"/api/v1/feedback/{feedback_id}/analyze", headers=headers)

    get_response = client.get(f"/api/v1/analysis/{feedback_id}", headers=headers)
    assert get_response.status_code == 200
    assert get_response.json()["data"]["feedback_id"] == feedback_id


def test_reanalyze_replaces_not_duplicates():
    """FR: one feedback can have only one active analysis."""
    headers = _register_and_login()
    product_id = _create_product(headers)
    feedback_id = _create_feedback(headers, product_id, "Please add Slack integration, it would save time.")

    first = client.post(f"/api/v1/feedback/{feedback_id}/analyze", headers=headers).json()["data"]
    second = client.post(f"/api/v1/feedback/{feedback_id}/analyze", headers=headers).json()["data"]

    assert first["id"] == second["id"]  # same row, updated in place


def test_get_analysis_before_analyzing_returns_404():
    headers = _register_and_login()
    product_id = _create_product(headers)
    feedback_id = _create_feedback(headers, product_id, "Some feedback text.")

    response = client.get(f"/api/v1/analysis/{feedback_id}", headers=headers)
    assert response.status_code == 404
    assert response.json()["error_code"] == "ANALYSIS_NOT_FOUND"


def test_user_cannot_analyze_or_read_another_users_feedback():
    user_a_headers = _register_and_login()
    user_b_headers = _register_and_login()
    product_id = _create_product(user_a_headers)
    feedback_id = _create_feedback(user_a_headers, product_id, "User A's feedback.")

    analyze_response = client.post(f"/api/v1/feedback/{feedback_id}/analyze", headers=user_b_headers)
    assert analyze_response.status_code == 404

    read_response = client.get(f"/api/v1/analysis/{feedback_id}", headers=user_b_headers)
    assert read_response.status_code == 404


def test_analysis_requires_authentication():
    response = client.get(f"/api/v1/analysis/{uuid.uuid4()}")
    assert response.status_code == 401


def test_mock_client_returns_valid_json_shape():
    """Direct check that the fallback client's output matches the schema the real orchestrator expects."""
    from app.ai.parser import parse_llm_response
    from app.ai.validator import validate_raw_output

    async def _run():
        mock_client = MockLLMClient()
        raw = await mock_client.complete("system prompt", 'Customer feedback:\n"""\nThe app crashes constantly.\n"""')
        return parse_llm_response(raw)

    parsed = asyncio.run(_run())
    validated = validate_raw_output(parsed)

    assert validated.sentiment in ("Positive", "Neutral", "Negative")
    assert validated.urgency in ("Low", "Medium", "High")
