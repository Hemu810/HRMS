"""
reset_db.py — Wipe and recreate the database with hrms_ table names.

Usage (from backend/ directory):
  python reset_db.py

SQLite (dev):      deletes the .db file; init_database() recreates it fresh.
Production MSSQL/PostgreSQL: drops all hrms_ tables then recreates them.

After this, run `python setup_db.py` to seed employee data.
"""
import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

from config import settings

IS_SQLITE = settings.database_url.startswith("sqlite")

def drop_sqlite_file():
    db_path_part = settings.database_url.replace("sqlite:///", "")
    db_path = Path(db_path_part) if os.path.isabs(db_path_part) else BASE_DIR / db_path_part
    if db_path.exists():
        db_path.unlink()
        print(f"Deleted: {db_path}")
    else:
        print(f"No file at {db_path} — already clean.")

if __name__ == "__main__":
    print("=== HRMS Database Reset ===")
    print("WARNING: This will DELETE all data in the database.")
    confirm = input("Type 'yes' to continue: ").strip().lower()
    if confirm != "yes":
        print("Aborted.")
        sys.exit(0)

    if IS_SQLITE:
        drop_sqlite_file()
    else:
        # Production: drop all tables through SQLAlchemy then recreate below.
        from db import engine, metadata
        print("Dropping all hrms_ tables…")
        metadata.drop_all(engine)
        print("Dropped.")

    # Import db after potential file removal so the engine connects to a fresh DB.
    from db import init_database
    init_database()
    print("All hrms_ tables created successfully.")
    print("\nNext step: run `python setup_db.py` to seed employees.")
