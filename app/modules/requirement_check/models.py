"""
Requirement Check Models

Database models for requirement checking and eligibility.
"""
from sqlalchemy import Column, String, DateTime, Enum, Integer, ForeignKey, Boolean, Text, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from app.core.database import Base


class EligibilityStatus(str, enum.Enum):
    ELIGIBLE = "eligible"
    NOT_ELIGIBLE = "not_eligible"
    CONDITIONAL = "conditional"  # Meets some but not all requirements


class RequirementCheck(Base):
    """Stores requirement check results for student-university combinations."""
    __tablename__ = "requirement_checks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Foreign keys
    student_id = Column(UUID(as_uuid=True), nullable=False)  # Reference to students table
    circular_id = Column(UUID(as_uuid=True), nullable=False)  # Reference to admission_circulars table
    department_id = Column(UUID(as_uuid=True), nullable=True)  # Reference to department_requirements table
    
    # Check Results
    meets_general_gpa = Column(Boolean, nullable=True)
    meets_department_gpa = Column(Boolean, nullable=True)
    meets_year_requirement = Column(Boolean, nullable=True)
    meets_subject_requirement = Column(Boolean, nullable=True)
    meets_age_requirement = Column(Boolean, nullable=True)
    meets_nationality_requirement = Column(Boolean, nullable=True)
    
    # Overall Status
    status = Column(Enum(EligibilityStatus), nullable=False)
    
    # Details
    missing_requirements = Column(Text, nullable=True)  # JSON or text describing what's missing
    notes = Column(Text, nullable=True)
    
    # Calculated scores
    gpa_difference = Column(Float, nullable=True)  # How much GPA is above/below requirement
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

