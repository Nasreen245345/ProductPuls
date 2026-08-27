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


def test_create_feedback_requires_owned_product():
    headers = _register_and_login()
    fake_product_id = uuid.uuid4()
    response = client.post(
        "/api/v1/feedback",
        json={"product_id": str(fake_product_id), "feedback_text": "The dashboard is slow."},
        headers=headers,
    )
    assert response.status_code == 404
    assert response.json()["error_code"] == "PRODUCT_NOT_FOUND"


def test_create_feedback_rejects_blank_text():
    headers = _register_and_login()
    product_id = _create_product(headers)
    response = client.post(
        "/api/v1/feedback", json={"product_id": product_id, "feedback_text": "   "}, headers=headers
    )
    assert response.status_code == 422


def test_create_feedback_rejects_invalid_source():
    headers = _register_and_login()
    product_id = _create_product(headers)
    response = client.post(
        "/api/v1/feedback",
        json={"product_id": product_id, "feedback_text": "Great product!", "source": "Carrier Pigeon"},
        headers=headers,
    )
    assert response.status_code == 422


def test_create_and_get_feedback():
    headers = _register_and_login()
    product_id = _create_product(headers)

    created = client.post(
        "/api/v1/feedback",
        json={"product_id": product_id, "feedback_text": "Please add dark mode.", "source": "Email", "customer_type": "SMB"},
        headers=headers,
    )
    assert created.status_code == 201
    feedback_id = created.json()["data"]["id"]

    got = client.get(f"/api/v1/feedback/{feedback_id}", headers=headers)
    assert got.status_code == 200
    assert got.json()["data"]["feedback_text"] == "Please add dark mode."


def test_update_and_delete_feedback():
    headers = _register_and_login()
    product_id = _create_product(headers)
    feedback_id = client.post(
        "/api/v1/feedback", json={"product_id": product_id, "feedback_text": "Original text"}, headers=headers
    ).json()["data"]["id"]

    updated = client.put(f"/api/v1/feedback/{feedback_id}", json={"feedback_text": "Edited text"}, headers=headers)
    assert updated.status_code == 200
    assert updated.json()["data"]["feedback_text"] == "Edited text"

    deleted = client.delete(f"/api/v1/feedback/{feedback_id}", headers=headers)
    assert deleted.status_code == 204

    after = client.get(f"/api/v1/feedback/{feedback_id}", headers=headers)
    assert after.status_code == 404


def test_pagination():
    headers = _register_and_login()
    product_id = _create_product(headers)
    for i in range(5):
        client.post("/api/v1/feedback", json={"product_id": product_id, "feedback_text": f"Feedback {i}"}, headers=headers)

    page1 = client.get("/api/v1/feedback?page=1&limit=2", headers=headers)
    assert page1.status_code == 200
    body = page1.json()["data"]
    assert len(body["items"]) == 2
    assert body["pagination"] == {"page": 1, "limit": 2, "total": 5, "pages": 3}

    page3 = client.get("/api/v1/feedback?page=3&limit=2", headers=headers)
    assert len(page3.json()["data"]["items"]) == 1


def test_search_filters_by_text():
    headers = _register_and_login()
    product_id = _create_product(headers)
    client.post("/api/v1/feedback", json={"product_id": product_id, "feedback_text": "The dashboard is slow"}, headers=headers)
    client.post("/api/v1/feedback", json={"product_id": product_id, "feedback_text": "Please add dark mode"}, headers=headers)

    response = client.get("/api/v1/feedback?search=dashboard", headers=headers)
    items = response.json()["data"]["items"]
    assert len(items) == 1
    assert "dashboard" in items[0]["feedback_text"].lower()


def test_filter_by_source_and_product():
    headers = _register_and_login()
    product_a = _create_product(headers, "Product A")
    product_b = _create_product(headers, "Product B")
    client.post("/api/v1/feedback", json={"product_id": product_a, "feedback_text": "From email", "source": "Email"}, headers=headers)
    client.post("/api/v1/feedback", json={"product_id": product_b, "feedback_text": "From support", "source": "Support"}, headers=headers)

    by_source = client.get("/api/v1/feedback?source=Email", headers=headers)
    assert len(by_source.json()["data"]["items"]) == 1
    assert by_source.json()["data"]["items"][0]["source"] == "Email"

    by_product = client.get(f"/api/v1/feedback?product_id={product_b}", headers=headers)
    assert len(by_product.json()["data"]["items"]) == 1
    assert by_product.json()["data"]["items"][0]["product_id"] == product_b


def test_user_cannot_access_another_users_feedback():
    """BR-004, extended through the product join."""
    user_a_headers = _register_and_login()
    user_b_headers = _register_and_login()
    product_id = _create_product(user_a_headers)
    feedback_id = client.post(
        "/api/v1/feedback", json={"product_id": product_id, "feedback_text": "User A's feedback"}, headers=user_a_headers
    ).json()["data"]["id"]

    get_response = client.get(f"/api/v1/feedback/{feedback_id}", headers=user_b_headers)
    assert get_response.status_code == 404

    list_response = client.get("/api/v1/feedback", headers=user_b_headers)
    assert len(list_response.json()["data"]["items"]) == 0

    # User B also cannot attach feedback to User A's product.
    create_response = client.post(
        "/api/v1/feedback", json={"product_id": product_id, "feedback_text": "Hijack attempt"}, headers=user_b_headers
    )
    assert create_response.status_code == 404


def test_deleting_product_cascades_to_feedback():
    """BR-006: deleting a product removes its feedback (enforced at the DB level via ON DELETE CASCADE)."""
    headers = _register_and_login()
    product_id = _create_product(headers)
    feedback_id = client.post(
        "/api/v1/feedback", json={"product_id": product_id, "feedback_text": "Will be cascaded away"}, headers=headers
    ).json()["data"]["id"]

    client.delete(f"/api/v1/products/{product_id}", headers=headers)

    response = client.get(f"/api/v1/feedback/{feedback_id}", headers=headers)
    assert response.status_code == 404


def test_feedback_requires_authentication():
    response = client.get("/api/v1/feedback")
    assert response.status_code == 401
