import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Application configuration — reads from environment variables.

    All secrets come from .env (never commit that file).
    Copy .env.example → .env and fill in your values.
    """

    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "postgresql://nexus:nexus@localhost:5455/nexus"
    )
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gpt-4o")
    CATALOG_PATH: str = os.getenv(
        "CATALOG_PATH", os.path.join(os.path.dirname(__file__), "catalog", "metadata.yaml")
    )
    MAX_QUERY_ROWS: int = int(os.getenv("MAX_QUERY_ROWS", "50"))
    QUERY_TIMEOUT_SECONDS: int = int(os.getenv("QUERY_TIMEOUT_SECONDS", "10"))
