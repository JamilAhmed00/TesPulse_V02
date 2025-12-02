"""
Student Registration Models

Database models for student registration and profiles.
"""
from sqlalchemy import Column, String, DateTime, Enum, Integer, Text, Date, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from app.core.database import Base


class Gender(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class StudentStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"


class Student(Base):
    """Student profile model."""
    __tablename__ = "students"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=True, unique=True, index=True)  # Link to auth user
    
    # ==================== Academic Information ====================
    # SSC Details
    ssc_roll = Column(String, nullable=True)
    ssc_registration = Column(String, nullable=True)
    ssc_year = Column(String, nullable=True)
    ssc_board = Column(String, nullable=True)
    ssc_gpa = Column(String, nullable=True)
    
    # HSC Details
    hsc_roll = Column(String, nullable=True)
    hsc_registration = Column(String, nullable=True)
    hsc_year = Column(String, nullable=True)
    hsc_board = Column(String, nullable=True)
    hsc_gpa = Column(String, nullable=True)
    
    # Applied Faculty/Program
    applied_faculty = Column(String, nullable=True)
    applied_program = Column(String, nullable=True)
    
    # ==================== Personal Information ====================
    candidate_name = Column(String, nullable=True)  # Full name
    father_name = Column(String, nullable=True)
    mother_name = Column(String, nullable=True)
    full_name = Column(String, nullable=False)  # Keep for backward compatibility
    date_of_birth = Column(Date, nullable=True)
    gender = Column(Enum(Gender), nullable=True)
    nationality = Column(String, nullable=True)
    religion = Column(String, nullable=True)
    nid_or_birth_certificate = Column(String, nullable=True)
    
    # ==================== Contact Information ====================
    email = Column(String, unique=True, nullable=False, index=True)
    phone = Column(String, nullable=True)
    mobile_number = Column(String, nullable=True)  # Alternative phone field
    
    # ==================== Present Address ====================
    present_division = Column(String, nullable=True)
    present_district = Column(String, nullable=True)
    present_thana = Column(String, nullable=True)
    present_post_office = Column(String, nullable=True)
    present_village = Column(String, nullable=True)
    present_zip_code = Column(String, nullable=True)
    
    # ==================== Permanent Address ====================
    same_as_present_address = Column(Boolean, default=False, nullable=False)
    permanent_division = Column(String, nullable=True)
    permanent_district = Column(String, nullable=True)
    permanent_thana = Column(String, nullable=True)
    permanent_post_office = Column(String, nullable=True)
    permanent_village = Column(String, nullable=True)
    permanent_zip_code = Column(String, nullable=True)
    
    # ==================== Legacy/Additional Fields ====================
    address = Column(Text, nullable=True)  # Keep for backward compatibility
    profile_picture_url = Column(String, nullable=True)
    
    # Status
    status = Column(Enum(StudentStatus), default=StudentStatus.ACTIVE, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    # applications = relationship("UniversityApplication", back_populates="student")


class StudentDocument(Base):
    """Student documents (certificates, photos, etc.)"""
    __tablename__ = "student_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), nullable=False)  # Foreign key to students
    
    document_type = Column(String, nullable=False)  # ssc_certificate, hsc_certificate, photo, etc.
    document_url = Column(String, nullable=False)
    file_name = Column(String, nullable=True)
    file_size_bytes = Column(Integer, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

