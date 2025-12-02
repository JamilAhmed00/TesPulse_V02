"""
Requirement Check Schemas

Pydantic models for requirement checking API.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class RequirementCheckRequest(BaseModel):
    """Request to check if a student meets requirements."""
    student_id: UUID
    circular_id: UUID
    department_id: Optional[UUID] = None  # Check specific department requirements


class RequirementCheckResult(BaseModel):
    """Result of requirement check."""
    meets_general_gpa: Optional[bool] = None
    meets_department_gpa: Optional[bool] = None
    meets_year_requirement: Optional[bool] = None
    meets_subject_requirement: Optional[bool] = None
    meets_age_requirement: Optional[bool] = None
    meets_nationality_requirement: Optional[bool] = None
    status: str  # eligible, not_eligible, conditional
    missing_requirements: Optional[str] = None
    notes: Optional[str] = None
    gpa_difference: Optional[float] = None


class RequirementCheckResponse(BaseModel):
    """Full requirement check response."""
    id: UUID
    student_id: UUID
    circular_id: UUID
    department_id: Optional[UUID] = None
    status: str
    meets_general_gpa: Optional[bool] = None
    meets_department_gpa: Optional[bool] = None
    meets_year_requirement: Optional[bool] = None
    meets_subject_requirement: Optional[bool] = None
    meets_age_requirement: Optional[bool] = None
    meets_nationality_requirement: Optional[bool] = None
    missing_requirements: Optional[str] = None
    notes: Optional[str] = None
    gpa_difference: Optional[float] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

