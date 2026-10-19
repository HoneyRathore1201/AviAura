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

    groq_api_key: str = ""
    groq_api_keys: str = ""
    groq_model: str = "qwen/qwen3.8-27b"

    gemini_api_key: str = ""
    gemini_api_keys: str = ""
    gemini_model: str = "gemini-2.5-flash"

    openweathermap_api_key: str
    openweathermap_units: str = "metric"

    google_client_id: str = ""
    google_client_secret: str = ""

    def get_groq_keys(self) -> list[str]:
        keys = []
        if self.groq_api_keys:
            keys.extend([k.strip() for k in self.groq_api_keys.split(",") if k.strip()])
        if self.groq_api_key and self.groq_api_key.strip() not in keys:
            keys.append(self.groq_api_key.strip())
        return keys

    def get_gemini_keys(self) -> list[str]:
        keys = []
        if self.gemini_api_keys:
            keys.extend([k.strip() for k in self.gemini_api_keys.split(",") if k.strip()])
        if self.gemini_api_key and self.gemini_api_key.strip() not in keys:
            keys.append(self.gemini_api_key.strip())
        return keys



@lru_cache
def get_settings() -> Settings:
    return Settings()
