from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")
    # Empty only for route checks/tests. Production requires this value in Render.
    google_api_key: str = ""
    supabase_url: str | None = None
    supabase_key: str | None = None
    allowed_origins: str = "http://localhost:3000,https://ep-craft.vercel.app"
    gemini_model: str = "models/gemini-flash-lite-latest"
    embedding_model: str = "models/gemini-embedding-001"

    @property
    def cors_origins(self) -> list[str]:
        return [item.strip() for item in self.allowed_origins.split(",") if item.strip()]

@lru_cache
def get_settings() -> Settings:
    return Settings()
