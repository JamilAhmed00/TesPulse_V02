"""
University Application Routers

API endpoints for university applications.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
from datetime import datetime

from app.core.database import get_db
from app.modules.university_application.models import UniversityApplication, ApplicationStatus
from app.modules.university_application.schemas import (
    ApplicationCreate, ApplicationUpdate, ApplicationResponse,
    ApplicationListResponse, ApplicationSubmitRequest
)

router = APIRouter(tags=["University Applications"])


@router.post("/applications", response_model=ApplicationResponse, status_code=201)
async def create_application(
    application_data: ApplicationCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new university application (draft).
    """
    # Verify student exists
    from app.modules.student_registration.models import Student
    student = db.query(Student).filter(Student.id == application_data.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Verify circular exists
    from app.modules.requirement_analyzer.models import AdmissionCircular
    circular = db.query(AdmissionCircular).filter(AdmissionCircular.id == application_data.circular_id).first()
    if not circular:
        raise HTTPException(status_code=404, detail="Admission circular not found")
    
    # Create application
    application = UniversityApplication(
        **application_data.model_dump(),
        status=ApplicationStatus.DRAFT
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    
    return ApplicationResponse.model_validate(application)


@router.get("/applications/{application_id}", response_model=ApplicationResponse)
async def get_application(
    application_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get application by ID.
    """
    application = db.query(UniversityApplication).filter(UniversityApplication.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    return ApplicationResponse.model_validate(application)


@router.put("/applications/{application_id}", response_model=ApplicationResponse)
async def update_application(
    application_id: UUID,
    application_data: ApplicationUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an application (only draft applications can be updated).
    """
    application = db.query(UniversityApplication).filter(UniversityApplication.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if application.status != ApplicationStatus.DRAFT:
        raise HTTPException(status_code=400, detail="Only draft applications can be updated")
    
    # Update fields
    update_data = application_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(application, field, value)
    
    db.commit()
    db.refresh(application)
    
    return ApplicationResponse.model_validate(application)


@router.post("/applications/{application_id}/submit", response_model=ApplicationResponse)
async def submit_application(
    application_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Submit an application (change status from draft to submitted).
    """
    application = db.query(UniversityApplication).filter(UniversityApplication.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if application.status != ApplicationStatus.DRAFT:
        raise HTTPException(status_code=400, detail="Only draft applications can be submitted")
    
    # TODO: Perform requirement check before submission
    # TODO: Verify payment if required
    
    application.status = ApplicationStatus.SUBMITTED
    application.submitted_at = datetime.utcnow()
    
    db.commit()
    db.refresh(application)
    
    return ApplicationResponse.model_validate(application)


@router.get("/applications", response_model=ApplicationListResponse)
async def list_applications(
    student_id: Optional[UUID] = Query(None, description="Filter by student ID"),
    circular_id: Optional[UUID] = Query(None, description="Filter by circular ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    List applications with optional filters.
    """
    query = db.query(UniversityApplication)
    
    if student_id:
        query = query.filter(UniversityApplication.student_id == student_id)
    
    if circular_id:
        query = query.filter(UniversityApplication.circular_id == circular_id)
    
    if status:
        query = query.filter(UniversityApplication.status == status)
    
    total = query.count()
    offset = (page - 1) * page_size
    
    applications = query.order_by(UniversityApplication.created_at.desc()).offset(offset).limit(page_size).all()
    
    return ApplicationListResponse(
        applications=[ApplicationResponse.model_validate(a) for a in applications],
        total=total,
        page=page,
        page_size=page_size
    )

