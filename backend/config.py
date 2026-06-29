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
import secrets
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


def _frontend_origins() -> tuple:
    # FRONTEND_ORIGIN may be a single URL or a comma-separated list — e.g. when both
    # a production Render frontend and a local dev server need to call this API.
    # No trailing slashes; the browser's Origin header never has one, and CORS does
    # an exact string match against allow_origins.
    raw = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
    return tuple(origin.strip().rstrip("/") for origin in raw.split(",") if origin.strip())


# RENDER is auto-injected by Render on every service, so this is true only when actually
# deployed there — never on a local machine. Used to fail fast on missing prod secrets
# instead of silently falling back to a value that breaks auth after every restart/deploy.
IS_RENDER = bool(os.getenv("RENDER"))


@dataclass(frozen=True)
class Settings:
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = _port()
    reload: bool = os.getenv("RELOAD", "false").lower() == "true"
    frontend_origins: tuple = _frontend_origins()
    database_url: str = _build_database_url()

    smtp_host: str   = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port: int   = int(os.getenv("SMTP_PORT", "465"))
    smtp_secure: bool = os.getenv("SMTP_SECURE", "true").lower() == "true"
    smtp_user: str   = os.getenv("SMTP_USER", "")
    smtp_pass: str   = os.getenv("SMTP_PASS", "")
    smtp_from: str   = os.getenv("SMTP_FROM", os.getenv("SMTP_USER", ""))

    # JWT — set JWT_SECRET in production; dev gets a random key (tokens reset on restart)
    jwt_secret:       str = os.getenv("JWT_SECRET", secrets.token_hex(32))
    jwt_algorithm:    str = "HS256"
    jwt_expire_hours: int = int(os.getenv("JWT_EXPIRE_HOURS", "24"))


# Singleton settings object imported everywhere in the app.
settings = Settings()


def validate_production_env() -> None:
    """
    Fails the deploy loudly instead of starting with broken auth/CORS silently.
    Only enforced on Render (IS_RENDER) — local dev keeps working with defaults.
    Call this once at startup, before the app accepts traffic.
    """
    missing = []
    if IS_RENDER and not os.getenv("JWT_SECRET"):
        missing.append(
            "JWT_SECRET is not set. Without it, every redeploy or free-tier "
            "spin-down/spin-up regenerates a random signing key, which invalidates "
            "every logged-in user's token and makes every protected API call return "
            "401 Unauthorized. Set a fixed JWT_SECRET in Render's Environment tab."
        )
    if IS_RENDER and settings.frontend_origins == ("http://localhost:5173",):
        missing.append(
            "FRONTEND_ORIGIN is not set (still defaulting to localhost:5173). "
            "Set it to your deployed frontend's exact URL "
            "(e.g. https://your-frontend.onrender.com, no trailing slash) "
            "in Render's Environment tab, or CORS will block every request "
            "from the deployed frontend."
        )
    if missing:
        raise RuntimeError("Production environment misconfigured:\n- " + "\n- ".join(missing))
