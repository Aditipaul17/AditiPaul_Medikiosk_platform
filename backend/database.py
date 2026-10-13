"""
MediKiosk Database Layer
Configures Relational DBMS (SQLite default, PostgreSQL via DATABASE_URL)
and Document Store (MongoDB via MONGODB_URL with fallback to SQLAlchemy JSON)
"""

import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

logger = logging.getLogger("medikiosk.db")

# ---------------------------------------------------------------------------
# Relational DBMS Setup (PostgreSQL / MySQL / SQLite)
# ---------------------------------------------------------------------------
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./medikiosk.db")

# Connect args specific to SQLite (thread check disabled for FastAPI concurrency)
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """FastAPI Dependency providing request-scoped database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------------------------------------------------------------------
# Semi-Structured Document Store (MongoDB optional connector)
# ---------------------------------------------------------------------------
MONGODB_URL = os.getenv("MONGODB_URL", None)
mongo_client = None
mongo_db = None

if MONGODB_URL:
    try:
        from pymongo import MongoClient
        mongo_client = MongoClient(MONGODB_URL, serverSelectionTimeoutMS=2000)
        # Ping to test connection
        mongo_client.admin.command('ping')
        mongo_db = mongo_client["medikiosk_fhir"]
        logger.info("Connected to MongoDB at %s", MONGODB_URL)
    except Exception as e:
        logger.warning("MongoDB specified but connection failed: %s. Falling back to Relational JSON store.", e)
        mongo_client = None
        mongo_db = None
