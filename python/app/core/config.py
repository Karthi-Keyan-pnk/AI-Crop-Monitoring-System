from pydantic import Field, AliasChoices
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )
    # General
    APP_NAME: str = Field(default="AI Crop Intelligence API")
    DEBUG: bool = Field(default=True)

    # Mongo
    MONGODB_URI: str = Field(
        default=" mongodb+srv://Hariharan:Admin123@cluster0.n8sxsza.mongodb.net/AI-Crop-Intelligence?retryWrites=true&w=majority&appName=Cluster0",
        validation_alias=AliasChoices("MONGODB_URI", "mongo_url"),
    )
    MONGODB_DB: str = Field(default="AI-Crop-Intelligence")

    # Gemini / Google Generative AI
    API_KEY: str | None = Field(
        default=None,
        validation_alias=AliasChoices("API_KEY", "openweather_api_key"),
    )

    # SMTP / Email
    SMTP_HOST: str | None = None
    SMTP_PORT: int | None = 587
    SMTP_USER: str | None = None
    SMTP_PASS: str | None = None
    SMTP_FROM: str | None = None

    # CORS
    CORS_ORIGINS: list[str] = Field(default_factory=lambda: ["*"])


@lru_cache
def get_settings() -> Settings:
    return Settings()
