"""
Database connection and session management.
Uses SQLite by default for easy local development.
Set DATABASE_URL in .env to use PostgreSQL in production, e.g.:
  postgresql://user:password@localhost:5432/legaldoc
"""
import os
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

# Default to SQLite for zero-config local development
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./legaldoc.db"
)

# SQLite needs check_same_thread=False for FastAPI
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency that yields a DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables. Call once on startup or via script."""
    from models_db import User, Analysis  # noqa: F401
    Base.metadata.create_all(bind=engine)
