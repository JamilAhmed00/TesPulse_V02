"""
University Application Schemas

Pydantic models for university application API.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class ApplicationCreate(BaseModel):
    """Schema for creating a new application."""
    student_id: UUID
    circular_id: UUID
    department_id: Optional[UUID] = None
    preferred_department: Optional[str] = None
    personal_statement: Optional[str] = None
    additional_notes: Optional[str] = None


class ApplicationUpdate(BaseModel):
    """Schema for updating an application."""
    preferred_department: Optional[str] = None
    personal_statement: Optional[str] = None
    additional_notes: Optional[str] = None
    status: Optional[str] = None  # Only for admin updates


class ApplicationResponse(BaseModel):
    """Schema for application response."""
    id: UUID
    student_id: UUID
    circular_id: UUID
    department_id: Optional[UUID] = None
    requirement_check_id: Optional[UUID] = None
    preferred_department: Optional[str] = None
    application_number: Optional[str] = None
    status: str
    payment_status: Optional[str] = None
    application_fee_paid: bool
    personal_statement: Optional[str] = None
    additional_notes: Optional[str] = None
    submitted_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ApplicationListResponse(BaseModel):
    """Schema for listing applications."""
    applications: list[ApplicationResponse]
    total: int
    page: int
    page_size: int


class ApplicationSubmitRequest(BaseModel):
    """Request to submit an application."""
    application_id: UUID
    # Could include payment information here

