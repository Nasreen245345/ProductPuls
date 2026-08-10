from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.dependencies import get_db

router = APIRouter(prefix="/api/v1/health", tags=["Health"])


@router.get("")
def health_check(db: Session = Depends(get_db)) -> dict:
    """Returns 200 with database status. A monitoring/deploy tool hits this to confirm the app is ready."""
    db.execute(text("SELECT 1"))
    return {"success": True, "message": "OK", "data": {"status": "healthy", "database": "connected"}}
