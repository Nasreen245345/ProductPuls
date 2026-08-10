from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models.User import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserResponse
from app.services import auth_service

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


@router.post("/register", status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> dict:
    auth_service.register(db, payload)
    return {"success": True, "message": "Account created successfully."}
@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> dict:
    access_token = auth_service.login(db, payload)
    return {
        "success": True,
        "data": TokenResponse(access_token=access_token).model_dump(),
    }
@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)) -> dict:
    return {"success": True, "data": UserResponse.model_validate(current_user).model_dump(mode="json")}