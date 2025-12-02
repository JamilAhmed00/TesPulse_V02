"""
University Application Models

Database models for university applications.
"""
from sqlalchemy import Column, String, DateTime, Enum, Integer, ForeignKey, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from app.core.database import Base


class ApplicationStatus(str, enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WAITLISTED = "waitlisted"
    WITHDRAWN = "withdrawn"


class UniversityApplication(Base):
    """Student application to a university."""
    __tablename__ = "university_applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Foreign keys
    student_id = Column(UUID(as_uuid=True), nullable=False)  # Reference to students table
    circular_id = Column(UUID(as_uuid=True), nullable=False)  # Reference to admission_circulars table
    department_id = Column(UUID(as_uuid=True), nullable=True)  # Reference to department_requirements table
    requirement_check_id = Column(UUID(as_uuid=True), nullable=True)  # Reference to requirement_checks table
    
    # Application Details
    preferred_department = Column(String, nullable=True)
    application_number = Column(String, unique=True, nullable=True)  # University-assigned application number
    
    # Status
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.DRAFT, nullable=False)
    
    # Payment Information
    payment_status = Column(String, nullable=True)  # paid, pending, failed
    payment_transaction_id = Column(String, nullable=True)
    application_fee_paid = Column(Boolean, default=False, nullable=False)
    
    # Additional Information
    personal_statement = Column(Text, nullable=True)
    additional_notes = Column(Text, nullable=True)
    
    # Timestamps
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class ApplicationDocument(Base):
    """Documents attached to an application."""
    __tablename__ = "application_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(UUID(as_uuid=True), nullable=False)  # Foreign key to university_applications
    
    document_type = Column(String, nullable=False)  # transcript, certificate, photo, etc.
    document_url = Column(String, nullable=False)
    file_name = Column(String, nullable=True)
    file_size_bytes = Column(Integer, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

