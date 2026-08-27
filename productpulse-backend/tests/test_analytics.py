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


def _create_product(headers, name="TaskFlow"):
    return client.post("/api/v1/products", json={"name": name}, headers=headers).json()["data"]["id"]


def _create_and_analyze_feedback(headers, product_id, text):
    feedback_id = client.post(
        "/api/v1/feedback", json={"product_id": product_id, "feedback_text": text}, headers=headers
    ).json()["data"]["id"]
    client.post(f"/api/v1/feedback/{feedback_id}/analyze", headers=headers)
    return feedback_id


def test_dashboard_with_no_data():
    headers = _register_and_login()
    response = client.get("/api/v1/analytics/dashboard", headers=headers)
    assert response.status_code == 200
    data = response.json()["data"]

    assert data["overview"]["total_products"] == 0
    assert data["overview"]["total_feedback"] == 0
    assert data["charts"]["feedback_over_time"] == []
    assert data["insights"]["top_pain_points"] == []
    assert data["recent_feedback"] == []
    assert "No feedback" in data["insights"]["summary"]


def test_dashboard_aggregates_across_products():
    headers = _register_and_login()
    product_a = _create_product(headers, "TaskFlow")
    product_b = _create_product(headers, "InvoicePilot")

    _create_and_analyze_feedback(headers, product_a, "The dashboard is very slow, our enterprise team is frustrated.")
    _create_and_analyze_feedback(headers, product_a, "Please add dark mode, it would help at night.")
    _create_and_analyze_feedback(headers, product_b, "Really love the clean invoicing flow, great work.")

    response = client.get("/api/v1/analytics/dashboard", headers=headers)
    assert response.status_code == 200
    data = response.json()["data"]

    assert data["overview"]["total_products"] == 2
    assert data["overview"]["total_feedback"] == 3
    assert data["overview"]["total_pain_points"] >= 1
    assert data["overview"]["total_feature_requests"] >= 1

    assert sum(row["count"] for row in data["charts"]["sentiment_distribution"]) == 3
    assert len(data["recent_feedback"]) == 3
    # Recent feedback is joined with product name, not just product_id.
    assert all(item["product_name"] in ("TaskFlow", "InvoicePilot") for item in data["recent_feedback"])
    assert "3 feedback item(s)" in data["insights"]["summary"]


def test_dashboard_only_includes_current_users_data():
    user_a_headers = _register_and_login()
    user_b_headers = _register_and_login()
    product_id = _create_product(user_a_headers)
    _create_and_analyze_feedback(user_a_headers, product_id, "User A's feedback.")

    response = client.get("/api/v1/analytics/dashboard", headers=user_b_headers)
    data = response.json()["data"]
    assert data["overview"]["total_products"] == 0
    assert data["overview"]["total_feedback"] == 0


def test_dashboard_requires_authentication():
    response = client.get("/api/v1/analytics/dashboard")
    assert response.status_code == 401
