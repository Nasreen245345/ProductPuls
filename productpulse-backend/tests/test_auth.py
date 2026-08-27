from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

VALID_PASSWORD = "Str0ng!Pass"


def _unique_email():
    import uuid

    return f"test_{uuid.uuid4().hex[:8]}@example.com"


def test_register_success():
    response = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Test User",
            "email": _unique_email(),
            "password": VALID_PASSWORD,
            "confirm_password": VALID_PASSWORD,
        },
    )

    assert response.status_code == 201
    body = response.json()
    assert body["success"] is True


def test_register_rejects_weak_password():
    response = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Test User",
            "email": _unique_email(),
            "password": "weak",
            "confirm_password": "weak",
        },
    )

    assert response.status_code == 422


def test_register_rejects_mismatched_passwords():
    response = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Test User",
            "email": _unique_email(),
            "password": VALID_PASSWORD,
            "confirm_password": "Different!123",
        },
    )

    assert response.status_code == 422


def test_register_rejects_duplicate_email():
    email = _unique_email()
    payload = {"full_name": "Test User", "email": email, "password": VALID_PASSWORD, "confirm_password": VALID_PASSWORD}

    first = client.post("/api/v1/auth/register", json=payload)
    second = client.post("/api/v1/auth/register", json=payload)

    assert first.status_code == 201
    assert second.status_code == 409
    assert second.json()["error_code"] == "EMAIL_ALREADY_EXISTS"


def test_login_success_and_me():
    email = _unique_email()
    client.post(
        "/api/v1/auth/register",
        json={"full_name": "Test User", "email": email, "password": VALID_PASSWORD, "confirm_password": VALID_PASSWORD},
    )

    login_response = client.post("/api/v1/auth/login", json={"email": email, "password": VALID_PASSWORD})
    assert login_response.status_code == 200
    token = login_response.json()["data"]["access_token"]

    me_response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_response.status_code == 200
    assert me_response.json()["data"]["email"] == email
    assert "password" not in me_response.json()["data"]
    assert "password_hash" not in me_response.json()["data"]


def test_login_rejects_wrong_password():
    email = _unique_email()
    client.post(
        "/api/v1/auth/register",
        json={"full_name": "Test User", "email": email, "password": VALID_PASSWORD, "confirm_password": VALID_PASSWORD},
    )

    response = client.post("/api/v1/auth/login", json={"email": email, "password": "WrongPassword!1"})

    assert response.status_code == 401
    assert response.json()["error_code"] == "INVALID_CREDENTIALS"


def test_me_requires_authentication():
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_me_rejects_invalid_token():
    response = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer not-a-real-token"})
    assert response.status_code == 401
