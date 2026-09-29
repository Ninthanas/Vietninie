from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    turso_database_url: str = ""
    turso_auth_token: str = ""
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    secret_key: str = "vietninie-jwt-secret-key-2024"

    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
