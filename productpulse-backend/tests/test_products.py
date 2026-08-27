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


def test_create_and_list_products():
    headers = _register_and_login()

    create_response = client.post(
        "/api/v1/products", json={"name": "TaskFlow", "description": "PM tool"}, headers=headers
    )
    assert create_response.status_code == 201
    assert create_response.json()["data"]["name"] == "TaskFlow"

    list_response = client.get("/api/v1/products", headers=headers)
    assert list_response.status_code == 200
    assert len(list_response.json()["data"]["items"]) == 1


def test_create_product_requires_name():
    headers = _register_and_login()
    response = client.post("/api/v1/products", json={"name": "   "}, headers=headers)
    assert response.status_code == 422


def test_get_update_delete_product():
    headers = _register_and_login()
    created = client.post("/api/v1/products", json={"name": "InvoicePilot"}, headers=headers).json()["data"]
    product_id = created["id"]

    get_response = client.get(f"/api/v1/products/{product_id}", headers=headers)
    assert get_response.status_code == 200

    update_response = client.put(
        f"/api/v1/products/{product_id}", json={"description": "Updated description"}, headers=headers
    )
    assert update_response.status_code == 200
    assert update_response.json()["data"]["description"] == "Updated description"
    assert update_response.json()["data"]["name"] == "InvoicePilot"  # unchanged

    delete_response = client.delete(f"/api/v1/products/{product_id}", headers=headers)
    assert delete_response.status_code == 204

    get_after_delete = client.get(f"/api/v1/products/{product_id}", headers=headers)
    assert get_after_delete.status_code == 404


def test_product_not_found():
    headers = _register_and_login()
    response = client.get(f"/api/v1/products/{uuid.uuid4()}", headers=headers)
    assert response.status_code == 404
    assert response.json()["error_code"] == "PRODUCT_NOT_FOUND"


def test_user_cannot_access_another_users_product():
    """BR-004: a user cannot access another user's products."""
    user_a_headers = _register_and_login()
    user_b_headers = _register_and_login()

    product = client.post("/api/v1/products", json={"name": "UserA's Product"}, headers=user_a_headers).json()["data"]
    product_id = product["id"]

    # User B tries to read, update, and delete User A's product.
    get_response = client.get(f"/api/v1/products/{product_id}", headers=user_b_headers)
    assert get_response.status_code == 404

    update_response = client.put(f"/api/v1/products/{product_id}", json={"name": "Hijacked"}, headers=user_b_headers)
    assert update_response.status_code == 404

    delete_response = client.delete(f"/api/v1/products/{product_id}", headers=user_b_headers)
    assert delete_response.status_code == 404

    # Confirm it's untouched from User A's perspective.
    still_there = client.get(f"/api/v1/products/{product_id}", headers=user_a_headers)
    assert still_there.status_code == 200
    assert still_there.json()["data"]["name"] == "UserA's Product"


def test_products_require_authentication():
    response = client.get("/api/v1/products")
    assert response.status_code == 401


def test_products_pagination():
    headers = _register_and_login()
    for i in range(5):
        client.post("/api/v1/products", json={"name": f"Product {i}"}, headers=headers)

    page1 = client.get("/api/v1/products?page=1&limit=2", headers=headers)
    body = page1.json()["data"]
    assert len(body["items"]) == 2
    assert body["pagination"] == {"page": 1, "limit": 2, "total": 5, "pages": 3}


def test_products_search():
    headers = _register_and_login()
    client.post("/api/v1/products", json={"name": "TaskFlow"}, headers=headers)
    client.post("/api/v1/products", json={"name": "InvoicePilot"}, headers=headers)

    response = client.get("/api/v1/products?search=task", headers=headers)
    items = response.json()["data"]["items"]
    assert len(items) == 1
    assert items[0]["name"] == "TaskFlow"
