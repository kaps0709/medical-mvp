import os
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    APP_NAME: str = "AI Medical Scribe"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    
    SECRET_KEY: str = os.getenv("SESSION_SECRET", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    STORAGE_AUDIO_PATH: str = "storage/audio"
    STORAGE_PRESCRIPTIONS_PATH: str = "storage/prescriptions"
    
    CORS_ORIGINS: list = ["*"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
