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

from env import load_env_file


# Load .env from the same directory as this file before reading any os.getenv() calls.
load_env_file()


@dataclass(frozen=True)
class Settings:
    # Server bind address and port.
    # "0.0.0.0" means listen on all network interfaces (required for Docker/cloud).
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", "4000"))

    # reload=True enables Uvicorn hot-reload in development (watches for file changes).
    # Always False in production to avoid performance overhead.
    reload: bool = os.getenv("RELOAD", "false").lower() == "true"

    # The React frontend origin that's allowed to make cross-origin requests.
    # In dev: http://localhost:5173 (Vite default).
    # In prod: set to your deployed frontend URL.
    frontend_origin: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

    # SQLAlchemy connection string.
    # Default is a local SQLite file (zero-config for local dev).
    # For production use a full connection string, e.g.:
    #   mssql+pyodbc://user:pass@server/db?driver=ODBC+Driver+18+for+SQL+Server
    #   postgresql+psycopg2://user:pass@host/db
    database_url: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./doloxe_hrms_dev.db",
    )

    # SMTP settings for payslip email delivery.
    # smtp_secure=True uses SMTP_SSL (port 465); False uses STARTTLS (port 587).
    # Leave smtp_user / smtp_pass / smtp_from empty to disable email sending
    # (the mailer will raise a RuntimeError if you attempt to send without them).
    smtp_host: str   = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port: int   = int(os.getenv("SMTP_PORT", "465"))
    smtp_secure: bool = os.getenv("SMTP_SECURE", "true").lower() == "true"
    smtp_user: str   = os.getenv("SMTP_USER", "")
    smtp_pass: str   = os.getenv("SMTP_PASS", "")
    # smtp_from defaults to smtp_user so you only need to set one env var for Gmail.
    smtp_from: str   = os.getenv("SMTP_FROM", os.getenv("SMTP_USER", ""))


# Singleton settings object imported everywhere in the app.
settings = Settings()
