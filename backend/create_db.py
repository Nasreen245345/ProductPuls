from app.database.session import engine
from app.database.base import Base

# Ensure models are imported so they are registered on Base.metadata
import app.models.User  # noqa: F401

print('Creating database tables...')
Base.metadata.create_all(bind=engine)
print('Done.')
