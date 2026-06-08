"""
env.py — Minimal .env File Loader
===================================
Reads a .env file and loads each KEY=VALUE pair into os.environ using
os.environ.setdefault() — meaning it NEVER overwrites variables that are
already set in the shell environment. This respects the standard rule:
  "shell environment > .env file > code defaults"

Why not use python-dotenv?
  - This is a lightweight custom loader with zero external dependencies.
  - It handles the same basics: KEY=VALUE lines, # comments, quoted values.
  - Keeps the dependency list small for a simpler production deploy.

Usage:
    from env import load_env_file
    load_env_file()           # loads ./backend/.env (relative to this file)
    load_env_file("/path/.env")  # loads a specific path
"""

from pathlib import Path
import os


def load_env_file(path=None):
    """
    Loads KEY=VALUE pairs from a .env file into os.environ.

    - Resolves the file relative to this module's directory if no path is given.
    - Silently returns if the file doesn't exist (not required to be present).
    - Skips blank lines and comment lines (starting with #).
    - Strips surrounding quotes (" or ') from values.
    - Uses setdefault so already-set env vars are never overwritten.
    """
    # Default to <this_file's_directory>/.env
    env_path = Path(path) if path else Path(__file__).resolve().parent / ".env"

    # If no .env file exists, just return — not an error.
    if not env_path.exists():
        return

    for raw_line in env_path.read_text().splitlines():
        line = raw_line.strip()

        # Skip blank lines and comment lines.
        if not line or line.startswith("#") or "=" not in line:
            continue

        # Split on the FIRST "=" only — values can contain "=" (e.g. base64 strings).
        key, value = line.split("=", 1)
        key   = key.strip()
        value = value.strip().strip('"').strip("'")  # remove surrounding quotes

        # setdefault: only sets the variable if it isn't already in the environment.
        # This means "export MY_VAR=x" in the shell always wins over the .env file.
        os.environ.setdefault(key, value)
