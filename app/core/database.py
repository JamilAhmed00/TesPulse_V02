from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError, DatabaseError
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Use the get_database_url method to build URL from env vars
database_url = settings.get_database_url()

engine = create_engine(
    database_url,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=settings.debug,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency for getting database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_database_connection() -> bool:
    """Test database connection and return True if successful."""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            result.fetchone()
        logger.info("Database connection successful")
        return True
    except (OperationalError, DatabaseError) as e:
        logger.error(f"Database connection failed: {e}")
        return False


def check_database_exists() -> bool:
    """Check if the database exists."""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT current_database()"))
            db_name = result.fetchone()[0]
            logger.info(f"Connected to database: {db_name}")
            return True
    except (OperationalError, DatabaseError) as e:
        logger.error(f"Database check failed: {e}")
        return False

