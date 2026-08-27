import uuid

from sqlalchemy.orm import Session

from app.core.exceptions import AuthenticationException, ConflictException, NotFoundException
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.repositories import user_repository
from app.schemas.auth import LoginRequest, RegisterRequest


def register(db: Session, payload: RegisterRequest) -> User:
    """FR-001. Raises ConflictException if the email is already taken."""
    if user_repository.get_by_email(db, payload.email):
        raise ConflictException("An account with this email already exists.", error_code="EMAIL_ALREADY_EXISTS")

    return user_repository.create(
        db,
        full_name=payload.full_name,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )


def login(db: Session, payload: LoginRequest) -> str:
    """FR-002. Returns a JWT access token. Raises AuthenticationException on invalid credentials."""
    user = user_repository.get_by_email(db, payload.email)
    if not user or not verify_password(payload.password, user.password_hash):
        raise AuthenticationException("Invalid email or password.", error_code="INVALID_CREDENTIALS")

    return create_access_token(subject=str(user.id))


def get_current_user(db: Session, user_id: str) -> User:
    """Resolves the authenticated user from a validated JWT subject claim."""
    try:
        user = user_repository.get_by_id(db, uuid.UUID(user_id))
    except ValueError as exc:
        raise AuthenticationException("Invalid session.", error_code="INVALID_SESSION") from exc

    if not user:
        raise NotFoundException("User not found.", error_code="USER_NOT_FOUND")

    return user
