from dataclasses import dataclass
import os

from env import load_env_file


load_env_file()


@dataclass(frozen=True)
class Settings:
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", "4000"))
    reload: bool = os.getenv("RELOAD", "false").lower() == "true"
    frontend_origin: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
    database_url: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./doloxe_hrms_dev.db",
    )
    smtp_host: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port: int = int(os.getenv("SMTP_PORT", "465"))
    smtp_secure: bool = os.getenv("SMTP_SECURE", "true").lower() == "true"
    smtp_user: str = os.getenv("SMTP_USER", "")
    smtp_pass: str = os.getenv("SMTP_PASS", "")
    smtp_from: str = os.getenv("SMTP_FROM", os.getenv("SMTP_USER", ""))


settings = Settings()
