"""
Requirement Check Routers

API endpoints for checking student eligibility against university requirements.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.modules.requirement_check.models import RequirementCheck
from app.modules.requirement_check.schemas import (
    RequirementCheckRequest, RequirementCheckResponse
)
from app.modules.requirement_check.services import check_requirements

router = APIRouter(tags=["Requirement Check"])


@router.post("/check", response_model=RequirementCheckResponse)
async def check_student_requirements(
    request: RequirementCheckRequest,
    db: Session = Depends(get_db)
):
    """
    Check if a student meets the requirements for a specific university/department.
    """
    # Check if student exists
    from app.modules.student_registration.models import Student
    student = db.query(Student).filter(Student.id == request.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Check if circular exists
    from app.modules.requirement_analyzer.models import AdmissionCircular
    circular = db.query(AdmissionCircular).filter(AdmissionCircular.id == request.circular_id).first()
    if not circular:
        raise HTTPException(status_code=404, detail="Admission circular not found")
    
    # Perform requirement check
    check_result = await check_requirements(db, request.student_id, request.circular_id, request.department_id)
    
    return RequirementCheckResponse.model_validate(check_result)


@router.get("/check/{check_id}", response_model=RequirementCheckResponse)
async def get_check_result(
    check_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get a specific requirement check result.
    """
    check = db.query(RequirementCheck).filter(RequirementCheck.id == check_id).first()
    if not check:
        raise HTTPException(status_code=404, detail="Check result not found")
    
    return RequirementCheckResponse.model_validate(check)

