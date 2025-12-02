"""
Student Registration Routers

API endpoints for student registration and management.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID

from app.core.database import get_db
from app.modules.student_registration.models import Student
from app.modules.student_registration.schemas import (
    StudentCreate, StudentUpdate, StudentResponse, StudentListResponse,
    EducationBoardResultRequest, EducationBoardResultResponse
)
from app.modules.student_registration.services.education_board import fetch_education_board_result
from app.modules.auth.dependencies import get_optional_user, get_current_active_user
from app.modules.auth.models import User

router = APIRouter(tags=["Student Registration"])


@router.post("/students", response_model=StudentResponse, status_code=201)
async def create_student(
    student_data: StudentCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Register a new student.
    If user is authenticated, link the student to the user account.
    """
    # Check if email already exists
    existing = db.query(Student).filter(Student.email == student_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create student
    student_dict = student_data.model_dump()
    
    # Link to authenticated user if available
    if current_user:
        student_dict['user_id'] = current_user.id
    
    student = Student(**student_dict)
    db.add(student)
    db.commit()
    db.refresh(student)
    
    return StudentResponse.model_validate(student)


@router.get("/students/me", response_model=StudentResponse)
async def get_my_student(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get student profile for the authenticated user.
    Returns 404 if no student profile exists.
    """
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    
    return StudentResponse.model_validate(student)


@router.get("/students/{student_id}", response_model=StudentResponse)
async def get_student(
    student_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get student by ID.
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return StudentResponse.model_validate(student)


@router.get("/students", response_model=StudentListResponse)
async def list_students(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    List all students with pagination.
    """
    total = db.query(Student).count()
    offset = (page - 1) * page_size
    
    students = db.query(Student).offset(offset).limit(page_size).all()
    
    return StudentListResponse(
        students=[StudentResponse.model_validate(s) for s in students],
        total=total,
        page=page,
        page_size=page_size
    )


@router.put("/students/{student_id}", response_model=StudentResponse)
async def update_student(
    student_id: UUID,
    student_data: StudentUpdate,
    db: Session = Depends(get_db)
):
    """
    Update student information.
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Update fields
    update_data = student_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(student, field, value)
    
    db.commit()
    db.refresh(student)
    
    return StudentResponse.model_validate(student)


@router.post("/students/fetch-education-board-result", response_model=EducationBoardResultResponse)
async def fetch_education_board_result_endpoint(
    request: EducationBoardResultRequest
):
    """
    Fetch student result from Education Board website.
    Extracts GPA, father's name, and mother's name.
    """
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"Fetching result for: {request.examination} {request.year}, Board: {request.board}, Roll: {request.roll}, Reg: {request.registration}")
    
    try:
        result = await fetch_education_board_result(
            examination=request.examination,
            year=request.year,
            board=request.board,
            roll=request.roll,
            registration=request.registration
        )
        logger.info(f"Result: success={result.get('success')}, error={result.get('error')}")
        return EducationBoardResultResponse(**result)
    except Exception as e:
        logger.error(f"Error fetching education board result: {str(e)}", exc_info=True)
        return EducationBoardResultResponse(
            success=False,
            gpa=None,
            father_name=None,
            mother_name=None,
            student_name=None,
            error=f"An error occurred: {str(e)}"
        )

