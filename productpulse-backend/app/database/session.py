from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

engine = create_engine(settings.database_url, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency — yields a session per request and always closes it,
    even if the request raises. Routers depend on this via
    `db: Session = Depends(get_db)`; they never construct a session directly.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
