from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    APP_NAME: str = "Cartiva Store API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    DATABASE_URL: str = "sqlite:///./cartiva_store.db"

    FRONTEND_ORIGIN: str = "http://localhost:5173"

    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100

    # Admin auth — values MUST be set in .env, no defaults here
    ADMIN_EMAIL: str
    ADMIN_PASSWORD: str
    SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440  # 24 hours

    # PostEx courier API
    POSTEX_API_KEY: str = ""
    POSTEX_BASE_URL: str = "https://api.postex.pk/services/integration/api/order/v3"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
        "extra": "ignore",          # tolerate unknown .env keys
    }


@lru_cache()
def get_settings() -> Settings:
    """Return cached settings instance."""
    return Settings()

