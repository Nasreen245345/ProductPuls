from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Every model in app/models/ inherits from this. Alembic's env.py imports Base.metadata for autogenerate."""

    pass
