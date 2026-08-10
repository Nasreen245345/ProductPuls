import jwt
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.exceptions import AuthenticationException
from app.core.security import decode_access_token
from app.database.session import get_db
from app.models.User import User
from app.services import auth_service

__all__ = ["get_db", "get_current_user"]

_bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Chapter 6 §9: every protected endpoint verifies the JWT before
    processing the request. Routers depend on this; they never touch
    the token or the users table directly.
    """
    if credentials is None:
        raise AuthenticationException("Authentication required.", error_code="AUTHENTICATION_ERROR")

    try:
        user_id = decode_access_token(credentials.credentials)
    except jwt.PyJWTError as exc:
        raise AuthenticationException("Invalid or expired token.", error_code="INVALID_TOKEN") from exc

    return auth_service.get_current_user(db, user_id)