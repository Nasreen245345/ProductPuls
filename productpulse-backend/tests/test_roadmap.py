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


def _seed_product_with_insights(headers):
    product_id = _create_product(headers)
    _create_and_analyze_feedback(headers, product_id, "The dashboard is very slow, our enterprise team is frustrated.")
    _create_and_analyze_feedback(headers, product_id, "Please add dark mode, it would help our team at night.")
    client.post(f"/api/v1/products/{product_id}/insights/generate", headers=headers)
    return product_id


def test_generate_roadmap_requires_insights_first():
    headers = _register_and_login()
    product_id = _create_product(headers)

    response = client.post(f"/api/v1/products/{product_id}/roadmap/generate", headers=headers)
    assert response.status_code == 400
    assert response.json()["error_code"] == "INSIGHTS_REQUIRED"


def test_generate_roadmap_success():
    headers = _register_and_login()
    product_id = _seed_product_with_insights(headers)

    response = client.post(f"/api/v1/products/{product_id}/roadmap/generate", headers=headers)
    assert response.status_code == 200
    items = response.json()["data"]

    assert len(items) > 0
    assert items[0]["priority"] == 1
    assert all(item["status"] == "Planned" for item in items)
    assert all(item["expected_impact"] in ("Low", "Medium", "High") for item in items)
    # Priorities are sequential starting at 1, in ascending order.
    assert [item["priority"] for item in items] == sorted(item["priority"] for item in items)


def test_get_roadmap_before_generating_returns_404():
    headers = _register_and_login()
    product_id = _create_product(headers)

    response = client.get(f"/api/v1/products/{product_id}/roadmap", headers=headers)
    assert response.status_code == 404
    assert response.json()["error_code"] == "ROADMAP_NOT_FOUND"


def test_regenerate_replaces_and_resets_status():
    headers = _register_and_login()
    product_id = _seed_product_with_insights(headers)

    first = client.post(f"/api/v1/products/{product_id}/roadmap/generate", headers=headers).json()["data"]
    item_id = first[0]["id"]

    # Mark an item In Progress, then regenerate — it should reset to Planned (new items, old ones gone).
    client.patch(f"/api/v1/roadmap/{item_id}", json={"status": "In Progress"}, headers=headers)
    second = client.post(f"/api/v1/products/{product_id}/roadmap/generate", headers=headers).json()["data"]

    assert all(item["status"] == "Planned" for item in second)
    get_after = client.get(f"/api/v1/products/{product_id}/roadmap", headers=headers).json()["data"]
    assert len(get_after) == len(second)


def test_update_status():
    headers = _register_and_login()
    product_id = _seed_product_with_insights(headers)
    items = client.post(f"/api/v1/products/{product_id}/roadmap/generate", headers=headers).json()["data"]
    item_id = items[0]["id"]

    response = client.patch(f"/api/v1/roadmap/{item_id}", json={"status": "In Progress"}, headers=headers)
    assert response.status_code == 200
    assert response.json()["data"]["status"] == "In Progress"


def test_update_status_rejects_invalid_value():
    headers = _register_and_login()
    product_id = _seed_product_with_insights(headers)
    items = client.post(f"/api/v1/products/{product_id}/roadmap/generate", headers=headers).json()["data"]
    item_id = items[0]["id"]

    response = client.patch(f"/api/v1/roadmap/{item_id}", json={"status": "Cancelled"}, headers=headers)
    assert response.status_code == 422


def test_user_cannot_access_or_update_another_users_roadmap():
    user_a_headers = _register_and_login()
    user_b_headers = _register_and_login()
    product_id = _seed_product_with_insights(user_a_headers)
    items = client.post(f"/api/v1/products/{product_id}/roadmap/generate", headers=user_a_headers).json()["data"]
    item_id = items[0]["id"]

    generate_response = client.post(f"/api/v1/products/{product_id}/roadmap/generate", headers=user_b_headers)
    assert generate_response.status_code == 404

    get_response = client.get(f"/api/v1/products/{product_id}/roadmap", headers=user_b_headers)
    assert get_response.status_code == 404

    status_response = client.patch(f"/api/v1/roadmap/{item_id}", json={"status": "Completed"}, headers=user_b_headers)
    assert status_response.status_code == 404


def test_roadmap_requires_authentication():
    response = client.get(f"/api/v1/products/{uuid.uuid4()}/roadmap")
    assert response.status_code == 401
