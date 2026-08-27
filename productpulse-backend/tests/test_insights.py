import uuid

from fastapi.testclient import TestClient

from app.main import app

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


def _create_and_analyze_feedback(headers, product_id, text):
    feedback_id = client.post(
        "/api/v1/feedback", json={"product_id": product_id, "feedback_text": text}, headers=headers
    ).json()["data"]["id"]
    client.post(f"/api/v1/feedback/{feedback_id}/analyze", headers=headers)
    return feedback_id


def test_generate_insights_requires_analyzed_feedback():
    headers = _register_and_login()
    product_id = _create_product(headers)

    response = client.post(f"/api/v1/products/{product_id}/insights/generate", headers=headers)
    assert response.status_code == 400
    assert response.json()["error_code"] == "INSUFFICIENT_DATA"


def test_generate_insights_success():
    headers = _register_and_login()
    product_id = _create_product(headers)
    _create_and_analyze_feedback(headers, product_id, "The dashboard is very slow, our enterprise team is frustrated.")
    _create_and_analyze_feedback(headers, product_id, "Please add dark mode, it would help at night.")
    _create_and_analyze_feedback(headers, product_id, "Really love the clean interface, great work.")

    response = client.post(f"/api/v1/products/{product_id}/insights/generate", headers=headers)
    assert response.status_code == 200
    data = response.json()["data"]

    assert data["feedback_analyzed_count"] == 3
    assert data["model_name"] == "mock-heuristic-v1"
    assert data["summary"]
    assert isinstance(data["top_pain_points"], list)
    assert isinstance(data["user_segments"], list)
    assert isinstance(data["feature_opportunities"], list)
    assert isinstance(data["revenue_opportunities"], list)


def test_get_insights_before_generating_returns_404():
    headers = _register_and_login()
    product_id = _create_product(headers)
    _create_and_analyze_feedback(headers, product_id, "Some feedback.")

    response = client.get(f"/api/v1/products/{product_id}/insights", headers=headers)
    assert response.status_code == 404
    assert response.json()["error_code"] == "INSIGHTS_NOT_FOUND"


def test_regenerate_replaces_not_duplicates():
    headers = _register_and_login()
    product_id = _create_product(headers)
    _create_and_analyze_feedback(headers, product_id, "The export is slow.")

    first = client.post(f"/api/v1/products/{product_id}/insights/generate", headers=headers).json()["data"]
    second = client.post(f"/api/v1/products/{product_id}/insights/generate", headers=headers).json()["data"]

    assert first["id"] == second["id"]


def test_user_cannot_generate_or_read_insights_for_another_users_product():
    user_a_headers = _register_and_login()
    user_b_headers = _register_and_login()
    product_id = _create_product(user_a_headers)
    _create_and_analyze_feedback(user_a_headers, product_id, "Some feedback.")

    generate_response = client.post(f"/api/v1/products/{product_id}/insights/generate", headers=user_b_headers)
    assert generate_response.status_code == 404

    read_response = client.get(f"/api/v1/products/{product_id}/insights", headers=user_b_headers)
    assert read_response.status_code == 404


def test_insights_require_authentication():
    response = client.get(f"/api/v1/products/{uuid.uuid4()}/insights")
    assert response.status_code == 401
