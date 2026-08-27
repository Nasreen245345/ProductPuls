import uuid

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

VALID_PASSWORD = "Str0ng!Pass"


def _register_and_login(email=None):
    email = email or f"test_{uuid.uuid4().hex[:8]}@example.com"
    client.post(
        "/api/v1/auth/register",
        json={"full_name": "Test User", "email": email, "password": VALID_PASSWORD, "confirm_password": VALID_PASSWORD},
    )
    login = client.post("/api/v1/auth/login", json={"email": email, "password": VALID_PASSWORD})
    token = login.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}, email


def test_me_includes_preferences_with_defaults():
    headers, _ = _register_and_login()
    response = client.get("/api/v1/auth/me", headers=headers)
    data = response.json()["data"]
    assert data["theme_preference"] == "light"
    assert data["email_notifications_enabled"] is True


def test_update_profile_full_name():
    headers, _ = _register_and_login()
    response = client.put("/api/v1/users/me", json={"full_name": "New Name"}, headers=headers)
    assert response.status_code == 200
    assert response.json()["data"]["full_name"] == "New Name"


def test_update_profile_email_rejects_duplicate():
    _, existing_email = _register_and_login()
    headers, _ = _register_and_login()

    response = client.put("/api/v1/users/me", json={"email": existing_email}, headers=headers)
    assert response.status_code == 409
    assert response.json()["error_code"] == "EMAIL_ALREADY_EXISTS"


def test_update_profile_email_success():
    headers, _ = _register_and_login()
    new_email = f"changed_{uuid.uuid4().hex[:8]}@example.com"
    response = client.put("/api/v1/users/me", json={"email": new_email}, headers=headers)
    assert response.status_code == 200
    assert response.json()["data"]["email"] == new_email


def test_change_password_success_and_relogin():
    headers, email = _register_and_login()
    new_password = "NewStr0ng!Pass"

    response = client.put(
        "/api/v1/users/me/password",
        json={"current_password": VALID_PASSWORD, "new_password": new_password, "confirm_new_password": new_password},
        headers=headers,
    )
    assert response.status_code == 200

    old_login = client.post("/api/v1/auth/login", json={"email": email, "password": VALID_PASSWORD})
    assert old_login.status_code == 401

    new_login = client.post("/api/v1/auth/login", json={"email": email, "password": new_password})
    assert new_login.status_code == 200


def test_change_password_rejects_wrong_current_password():
    headers, _ = _register_and_login()
    response = client.put(
        "/api/v1/users/me/password",
        json={"current_password": "WrongPass!1", "new_password": "NewStr0ng!Pass", "confirm_new_password": "NewStr0ng!Pass"},
        headers=headers,
    )
    assert response.status_code == 401
    assert response.json()["error_code"] == "INVALID_CURRENT_PASSWORD"


def test_change_password_rejects_weak_new_password():
    headers, _ = _register_and_login()
    response = client.put(
        "/api/v1/users/me/password",
        json={"current_password": VALID_PASSWORD, "new_password": "weak", "confirm_new_password": "weak"},
        headers=headers,
    )
    assert response.status_code == 422


def test_change_password_rejects_mismatched_confirmation():
    headers, _ = _register_and_login()
    response = client.put(
        "/api/v1/users/me/password",
        json={"current_password": VALID_PASSWORD, "new_password": "NewStr0ng!Pass", "confirm_new_password": "Different!123"},
        headers=headers,
    )
    assert response.status_code == 422


def test_update_preferences():
    headers, _ = _register_and_login()
    response = client.put(
        "/api/v1/users/me/preferences",
        json={"theme_preference": "dark", "email_notifications_enabled": False},
        headers=headers,
    )
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["theme_preference"] == "dark"
    assert data["email_notifications_enabled"] is False


def test_update_preferences_partial():
    headers, _ = _register_and_login()
    client.put("/api/v1/users/me/preferences", json={"theme_preference": "dark"}, headers=headers)
    response = client.put("/api/v1/users/me/preferences", json={"email_notifications_enabled": False}, headers=headers)
    data = response.json()["data"]
    # theme_preference should still be "dark" from the previous call — a partial update shouldn't reset it.
    assert data["theme_preference"] == "dark"
    assert data["email_notifications_enabled"] is False


def test_update_preferences_rejects_invalid_theme():
    headers, _ = _register_and_login()
    response = client.put("/api/v1/users/me/preferences", json={"theme_preference": "purple"}, headers=headers)
    assert response.status_code == 422


def test_account_endpoints_require_authentication():
    assert client.put("/api/v1/users/me", json={"full_name": "X"}).status_code == 401
    assert client.put("/api/v1/users/me/preferences", json={"theme_preference": "dark"}).status_code == 401
