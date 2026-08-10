import uuid

from sqlalchemy.orm import Session

from app.models.User import User
from app.core.security import hash_password, verify_password, create_access_token
from app.core.exceptions import ConflictException, AuthenticationException
from app.schemas.auth import RegisterRequest, LoginRequest


def get_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def get_by_id(db: Session, user_id: uuid.UUID) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def create(db: Session, *, full_name: str, email: str, password_hash: str) -> User:
    user = User(full_name=full_name, email=email, password_hash=password_hash)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def register(db: Session, payload: RegisterRequest) -> User:
    """Create a new user after validating uniqueness and hashing the password."""
    print('DEBUG: auth_service.register called for', payload.email)
    try:
        pw_len = len(payload.password)
    except Exception:
        pw_len = 'unknown'
    print('DEBUG: password length =', pw_len)
    # Ensure email isn't already registered
    existing = get_by_email(db, payload.email)
    if existing is not None:
        raise ConflictException("An account with that email already exists.", error_code="ACCOUNT_ALREADY_EXISTS")

    pw_hash = hash_password(payload.password)
    print('DEBUG: password hashed, creating user')
    return create(db, full_name=payload.full_name, email=payload.email, password_hash=pw_hash)


def login(db: Session, payload: LoginRequest) -> str:
    """Authenticate user and return an access token (JWT)."""
    user = get_by_email(db, payload.email)
    if user is None or not verify_password(payload.password, user.password_hash):
        raise AuthenticationException("Invalid email or password.", error_code="INVALID_CREDENTIALS")

    return create_access_token(str(user.id))


def get_current_user(db: Session, user_id: uuid.UUID) -> User | None:
    return get_by_id(db, user_id)