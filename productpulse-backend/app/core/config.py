from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Single source of truth for configuration. Every value comes from the
    environment (.env locally, real env vars in production) — nothing here
    is a hardcoded secret. See Chapter 6 §16.
    """

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # --- Database ---
    database_url: str

    # --- Auth (Module 1 onward) ---
    jwt_secret: str = "dev-only-insecure-default-change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60

    # --- App ---
    debug: bool = False
    cors_origins: str = "http://localhost:5173"

    # --- AI provider (Module 4 onward) ---
    ai_api_key: str = ""

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


# Instantiated once, imported everywhere else via `from app.core.config import settings`.
settings = Settings()
