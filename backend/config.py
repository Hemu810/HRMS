"""
config.py — Application Settings
==================================
Reads all configuration from environment variables using os.getenv().
The .env file (if present) is loaded first by env.load_env_file() so that
local development doesn't require exporting variables in the shell.

All values have safe defaults so the app starts without any .env file
(useful for CI and first-time setups). For production, override via:
  - A real .env file in the backend/ directory
  - Platform environment variables (Render, Railway, etc.)

Settings are frozen (frozen=True on the dataclass) to prevent accidental
mutation at runtime — treat them as read-only constants.
"""

from dataclasses import dataclass
import os
from urllib.parse import quote

from env import load_env_file


# Load .env from the same directory as this file before reading any os.getenv() calls.
load_env_file()


def _build_database_url() -> str:
    # If a full DATABASE_URL is explicitly provided, use it as-is.
    if os.getenv("DATABASE_URL"):
        return os.getenv("DATABASE_URL")

    # If the individual DB_* vars are set, build a pymssql URL (no ODBC driver needed).
    server = os.getenv("DB_SERVER")
    if server:
        db   = os.getenv("DB_DATABASE", "")
        user = os.getenv("DB_USERNAME", "")
        pwd  = os.getenv("DB_PASSWORD", "")
        return f"mssql+pymssql://{quote(user)}:{quote(pwd)}@{server}/{db}"

    # Local dev fallback — SQLite file in the backend/ directory.
    return "sqlite:///./doloxe_hrms_dev.db"


def _port() -> int:
    # IIS HttpPlatformHandler injects HTTP_PLATFORM_PORT; fall back to PORT, then 4000.
    return int(os.getenv("PORT") or os.getenv("HTTP_PLATFORM_PORT") or "4000")


@dataclass(frozen=True)
class Settings:
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = _port()
    reload: bool = os.getenv("RELOAD", "false").lower() == "true"
    frontend_origin: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
    database_url: str = _build_database_url()

    smtp_host: str   = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port: int   = int(os.getenv("SMTP_PORT", "465"))
    smtp_secure: bool = os.getenv("SMTP_SECURE", "true").lower() == "true"
    smtp_user: str   = os.getenv("SMTP_USER", "")
    smtp_pass: str   = os.getenv("SMTP_PASS", "")
    smtp_from: str   = os.getenv("SMTP_FROM", os.getenv("SMTP_USER", ""))


# Singleton settings object imported everywhere in the app.
settings = Settings()
