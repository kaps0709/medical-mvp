import os
import sys
from typing import List
from pydantic_settings import BaseSettings
from pydantic import field_validator
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
    
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "*")
    CORS_ALLOW_CREDENTIALS: bool = False
    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    @property
    def cors_origins_list(self) -> List[str]:
        if self.CORS_ORIGINS == "*":
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
    
    @property
    def is_cors_wildcard(self) -> bool:
        return self.CORS_ORIGINS == "*" or "*" in self.cors_origins_list
    
    def validate_required(self) -> bool:
        errors = []
        if not self.DATABASE_URL:
            errors.append("DATABASE_URL environment variable is required")
        
        if errors:
            for error in errors:
                print(f"CRITICAL: {error}", file=sys.stderr)
            return False
        return True


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
