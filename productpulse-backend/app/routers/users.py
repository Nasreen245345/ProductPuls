from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.user import PasswordChangeRequest, PreferencesUpdate, ProfileUpdate, UserResponse
from app.services import user_service

router = APIRouter(prefix="/api/v1/users", tags=["Users"])


@router.put("/me")
def update_profile(
    payload: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    user = user_service.update_profile(db, current_user, payload)
    return {
        "success": True,
        "message": "Profile updated successfully.",
        "data": UserResponse.model_validate(user).model_dump(mode="json"),
    }


@router.put("/me/password")
def change_password(
    payload: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    user_service.change_password(db, current_user, payload)
    return {"success": True, "message": "Password changed successfully."}


@router.put("/me/preferences")
def update_preferences(
    payload: PreferencesUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    user = user_service.update_preferences(db, current_user, payload)
    return {
        "success": True,
        "message": "Preferences updated successfully.",
        "data": UserResponse.model_validate(user).model_dump(mode="json"),
    }
