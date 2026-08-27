import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator


class ProductCreate(BaseModel):
    name: str
    description: str | None = None

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Product name is required.")
        return value.strip()


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None

    @field_validator("name")
    @classmethod
    def name_not_blank_if_present(cls, value: str | None) -> str | None:
        if value is not None and not value.strip():
            raise ValueError("Product name cannot be empty.")
        return value.strip() if value else value


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    description: str | None
    created_at: datetime
    updated_at: datetime
