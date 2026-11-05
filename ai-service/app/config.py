from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PORT: int = 8001
    MAX_TEXT_CHARS: int = 20000
    LLM_PROVIDER: str = ""
    LLM_API_KEY: str = ""
    LLM_MODEL: str = ""
    LLM_BASE_URL: str = ""
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
