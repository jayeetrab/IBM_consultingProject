from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    reddit_client_id: str = ""
    reddit_secret: str = ""
    reddit_user_agent: str = "IBMCampusPulse/1.0"
    twitter_bearer_token: str = ""
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "ibm_campus_pulse"
    ingest_interval_hours: int = 6
    gemini_api_key: Optional[str] = None

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
