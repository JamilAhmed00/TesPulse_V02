from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.config import settings
from app.core.database import engine, Base, get_db, test_database_connection, check_database_exists
import logging

logger = logging.getLogger(__name__)

# Import routers from modules
from app.modules.auth.routers import router as auth_router
from app.modules.requirement_analyzer import analyze_router, results_router
from app.modules.student_registration.routers import router as student_router
from app.modules.requirement_check.routers import router as requirement_check_router
from app.modules.university_application.routers import router as application_router

# Test database connection on startup
logger.info(f"Connecting to database: {settings.get_database_url().split('@')[1] if '@' in settings.get_database_url() else 'unknown'}")
if not test_database_connection():
    logger.warning("Database connection test failed on startup, but continuing...")

# Create database tables
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created/verified successfully")
except Exception as e:
    logger.error(f"Failed to create database tables: {e}")

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="TestPulse API - University Admission Management System",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    # Ensure ReDoc can access the OpenAPI spec
    servers=[{"url": "/", "description": "Default server"}],
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
# Authentication Module
app.include_router(auth_router, prefix="/api/auth")

# Requirement Analyzer Module
app.include_router(analyze_router, prefix="/api/analyze")
app.include_router(results_router, prefix="/api/results")

# Student Registration Module
app.include_router(student_router, prefix="/api")

# Requirement Check Module
app.include_router(requirement_check_router, prefix="/api/requirements")

# University Application Module
app.include_router(application_router, prefix="/api")


@app.get("/")
async def root():
    return {
        "message": "TestPulse API",
        "version": settings.app_version,
        "docs": "/docs",
        "modules": [
            "auth",
            "requirement_analyzer",
            "student_registration",
            "requirement_check",
            "university_application"
        ]
    }


@app.get("/health")
async def health():
    """Basic health check endpoint."""
    return {"status": "healthy"}


@app.get("/health/db")
async def health_db(db: Session = Depends(get_db)):
    """Database health check endpoint."""
    try:
        # Test database connection
        if not test_database_connection():
            raise HTTPException(status_code=503, detail="Database connection failed")
        
        # Test database query
        result = db.execute(text("SELECT version()"))
        version = result.fetchone()[0]
        
        # Check database name
        result = db.execute(text("SELECT current_database()"))
        db_name = result.fetchone()[0]
        
        return {
            "status": "healthy",
            "database": {
                "connected": True,
                "name": db_name,
                "version": version.split(",")[0] if version else "unknown"
            }
        }
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        raise HTTPException(status_code=503, detail=f"Database health check failed: {str(e)}")

