"""
Student Registration Schemas

Pydantic models for student registration API requests and responses.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import date, datetime
from uuid import UUID


class StudentCreate(BaseModel):
    """Schema for creating a new student."""
    # Academic Information
    ssc_roll: Optional[str] = None
    ssc_registration: Optional[str] = None
    ssc_year: Optional[str] = None
    ssc_board: Optional[str] = None
    ssc_gpa: Optional[str] = None
    
    hsc_roll: Optional[str] = None
    hsc_registration: Optional[str] = None
    hsc_year: Optional[str] = None
    hsc_board: Optional[str] = None
    hsc_gpa: Optional[str] = None
    
    applied_faculty: Optional[str] = None
    applied_program: Optional[str] = None
    
    # Personal Information
    candidate_name: Optional[str] = None
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    full_name: str = Field(..., min_length=1, max_length=200)  # Required for backward compatibility
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    nationality: Optional[str] = None
    religion: Optional[str] = None
    nid_or_birth_certificate: Optional[str] = None
    
    # Contact Information
    email: EmailStr
    phone: Optional[str] = None
    mobile_number: Optional[str] = None
    
    # Present Address
    present_division: Optional[str] = None
    present_district: Optional[str] = None
    present_thana: Optional[str] = None
    present_post_office: Optional[str] = None
    present_village: Optional[str] = None
    present_zip_code: Optional[str] = None
    
    # Permanent Address
    same_as_present_address: bool = False
    permanent_division: Optional[str] = None
    permanent_district: Optional[str] = None
    permanent_thana: Optional[str] = None
    permanent_post_office: Optional[str] = None
    permanent_village: Optional[str] = None
    permanent_zip_code: Optional[str] = None
    
    # Legacy fields
    address: Optional[str] = None


class StudentUpdate(BaseModel):
    """Schema for updating student information."""
    # Academic Information
    ssc_roll: Optional[str] = None
    ssc_registration: Optional[str] = None
    ssc_year: Optional[str] = None
    ssc_board: Optional[str] = None
    ssc_gpa: Optional[str] = None
    
    hsc_roll: Optional[str] = None
    hsc_registration: Optional[str] = None
    hsc_year: Optional[str] = None
    hsc_board: Optional[str] = None
    hsc_gpa: Optional[str] = None
    
    applied_faculty: Optional[str] = None
    applied_program: Optional[str] = None
    
    # Personal Information
    candidate_name: Optional[str] = None
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    full_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    nationality: Optional[str] = None
    religion: Optional[str] = None
    nid_or_birth_certificate: Optional[str] = None
    
    # Contact Information
    phone: Optional[str] = None
    mobile_number: Optional[str] = None
    
    # Present Address
    present_division: Optional[str] = None
    present_district: Optional[str] = None
    present_thana: Optional[str] = None
    present_post_office: Optional[str] = None
    present_village: Optional[str] = None
    present_zip_code: Optional[str] = None
    
    # Permanent Address
    same_as_present_address: Optional[bool] = None
    permanent_division: Optional[str] = None
    permanent_district: Optional[str] = None
    permanent_thana: Optional[str] = None
    permanent_post_office: Optional[str] = None
    permanent_village: Optional[str] = None
    permanent_zip_code: Optional[str] = None
    
    # Legacy fields
    address: Optional[str] = None


class StudentResponse(BaseModel):
    """Schema for student response."""
    id: UUID
    user_id: Optional[UUID] = None
    
    # Academic Information
    ssc_roll: Optional[str] = None
    ssc_registration: Optional[str] = None
    ssc_year: Optional[str] = None
    ssc_board: Optional[str] = None
    ssc_gpa: Optional[str] = None
    
    hsc_roll: Optional[str] = None
    hsc_registration: Optional[str] = None
    hsc_year: Optional[str] = None
    hsc_board: Optional[str] = None
    hsc_gpa: Optional[str] = None
    
    applied_faculty: Optional[str] = None
    applied_program: Optional[str] = None
    
    # Personal Information
    candidate_name: Optional[str] = None
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    full_name: str
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    nationality: Optional[str] = None
    religion: Optional[str] = None
    nid_or_birth_certificate: Optional[str] = None
    
    # Contact Information
    email: str
    phone: Optional[str] = None
    mobile_number: Optional[str] = None
    
    # Present Address
    present_division: Optional[str] = None
    present_district: Optional[str] = None
    present_thana: Optional[str] = None
    present_post_office: Optional[str] = None
    present_village: Optional[str] = None
    present_zip_code: Optional[str] = None
    
    # Permanent Address
    same_as_present_address: bool = False
    permanent_division: Optional[str] = None
    permanent_district: Optional[str] = None
    permanent_thana: Optional[str] = None
    permanent_post_office: Optional[str] = None
    permanent_village: Optional[str] = None
    permanent_zip_code: Optional[str] = None
    
    # Legacy fields
    address: Optional[str] = None
    
    # Status
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class StudentListResponse(BaseModel):
    """Schema for listing students."""
    students: list[StudentResponse]
    total: int
    page: int
    page_size: int


class EducationBoardResultRequest(BaseModel):
    """Schema for fetching Education Board result."""
    examination: str = Field(..., description="Examination type: SSC or HSC")
    year: str = Field(..., description="Year of examination")
    board: str = Field(..., description="Board name (e.g., Dhaka, Chittagong)")
    roll: str = Field(..., description="Roll number")
    registration: str = Field(..., description="Registration number")


class EducationBoardResultResponse(BaseModel):
    """Schema for Education Board result response."""
    success: bool
    gpa: Optional[str] = None
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    student_name: Optional[str] = None
    error: Optional[str] = None

