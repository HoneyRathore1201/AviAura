"""Load environment variables used by the FastAPI app."""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_BACKEND_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    """All secrets and tunables come from backend/.env (see .env.example)."""

    model_config = SettingsConfigDict(
        env_file=str(_BACKEND_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Aviaura"
    app_env: str = "development"
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    frontend_origin: str = "http://localhost:5173"

    mongodb_uri: str
    mongodb_db_name: str = "aviaura"

    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 10080

    groq_api_key: str
    groq_model: str = "llama3-8b-8192"

    openweathermap_api_key: str
    openweathermap_units: str = "metric"

    google_client_id: str = ""
    google_client_secret: str = ""



@lru_cache
def get_settings() -> Settings:
    return Settings()
