import re
import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator, model_validator

_PASSWORD_PATTERN = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$")


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    full_name: str
    email: EmailStr
    theme_preference: str
    email_notifications_enabled: bool
    created_at: datetime
    updated_at: datetime


class ProfileUpdate(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None

    @field_validator("full_name")
    @classmethod
    def full_name_not_blank(cls, value: str | None) -> str | None:
        if value is not None and not value.strip():
            raise ValueError("Full name cannot be empty.")
        return value.strip() if value else value


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_new_password: str

    @field_validator("new_password")
    @classmethod
    def new_password_meets_strength_requirements(cls, value: str) -> str:
        if not _PASSWORD_PATTERN.match(value):
            raise ValueError(
                "Password must be at least 8 characters and include an uppercase letter, "
                "a lowercase letter, a number, and a special character."
            )
        return value

    @model_validator(mode="after")
    def passwords_match(self) -> "PasswordChangeRequest":
        if self.new_password != self.confirm_new_password:
            raise ValueError("New password and confirm password must match.")
        return self


class PreferencesUpdate(BaseModel):
    theme_preference: Literal["light", "dark"] | None = None
    email_notifications_enabled: bool | None = None
