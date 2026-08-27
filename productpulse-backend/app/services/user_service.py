from sqlalchemy.orm import Session

from app.core.exceptions import AuthenticationException, ConflictException
from app.core.security import hash_password, verify_password
from app.models.user import User
from app.repositories import user_repository
from app.schemas.user import PasswordChangeRequest, PreferencesUpdate, ProfileUpdate


def update_profile(db: Session, user: User, payload: ProfileUpdate) -> User:
    if payload.email and payload.email != user.email:
        existing = user_repository.get_by_email(db, payload.email)
        if existing:
            raise ConflictException("An account with this email already exists.", error_code="EMAIL_ALREADY_EXISTS")

    return user_repository.update(db, user, full_name=payload.full_name, email=payload.email)


def change_password(db: Session, user: User, payload: PasswordChangeRequest) -> None:
    if not verify_password(payload.current_password, user.password_hash):
        raise AuthenticationException("Current password is incorrect.", error_code="INVALID_CURRENT_PASSWORD")

    user_repository.update(db, user, password_hash=hash_password(payload.new_password))


def update_preferences(db: Session, user: User, payload: PreferencesUpdate) -> User:
    return user_repository.update(
        db,
        user,
        theme_preference=payload.theme_preference,
        email_notifications_enabled=payload.email_notifications_enabled,
    )
