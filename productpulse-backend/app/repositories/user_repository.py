import uuid

from sqlalchemy.orm import Session

from app.models.User import User


def get_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def get_by_id(db: Session, user_id: uuid.UUID) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def create(db: Session, *, full_name: str, email: str, password_hash: str) -> User:
    print("Inside create()")

    user = User(
        full_name=full_name,
        email=email,
        password_hash=password_hash,
    )

    db.add(user)
    print("Before commit")

    db.commit()
    print("After commit")

    db.refresh(user)
    print("Inserted User ID:", user.id)

    return user