from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import Optional
from urllib.parse import quote_plus


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Gemini AI Configuration
    gemini_api_key: str
    
    # Database Configuration - Individual components
    db_host: str = "localhost"
    db_port: int = 5432
    db_user: str = "postgres"
    db_password: str = "postgres"
    db_name: str = "uniscan"
    
    # Database URL (can be overridden directly, or built from components)
    database_url: Optional[str] = None
    
    def get_database_url(self) -> str:
        """Build database URL from components or use provided DATABASE_URL."""
        if self.database_url:
            return self.database_url
        
        # URL encode password to handle special characters
        encoded_password = quote_plus(self.db_password)
        return f"postgresql://{self.db_user}:{encoded_password}@{self.db_host}:{self.db_port}/{self.db_name}"
    
    # Application Configuration
    app_name: str = "UniScan API"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # CORS Configuration
    cors_origins: list[str] = ["*"]
    
    # JWT Configuration
    secret_key: str = "your-secret-key-change-this-in-production-use-env-variable"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 30
    
    model_config = ConfigDict(
        env_file = ".env",
        case_sensitive = False,
        extra = "ignore"  # Ignore extra environment variables (like API_PORT)
    )


settings = Settings()

