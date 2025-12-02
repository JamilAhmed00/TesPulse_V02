from sqlalchemy import Column, String, DateTime, Enum, Integer, ForeignKey, Text, Float, Boolean
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from app.core.database import Base


class JobStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class ResultStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class AnalysisJob(Base):
    __tablename__ = "analysis_jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    status = Column(Enum(JobStatus), default=JobStatus.PENDING, nullable=False)
    urls = Column(ARRAY(String), nullable=False)
    urls_count = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    results = relationship("AnalysisResult", back_populates="job", cascade="all, delete-orphan")


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(UUID(as_uuid=True), ForeignKey("analysis_jobs.id"), nullable=False)
    url = Column(String, nullable=False)
    status = Column(Enum(ResultStatus), default=ResultStatus.PENDING, nullable=False)
    error = Column(Text, nullable=True)
    # Processing metadata
    processing_time_ms = Column(Integer, nullable=True)  # Time taken to process in milliseconds
    file_size_bytes = Column(Integer, nullable=True)  # File size if applicable
    file_mime_type = Column(String, nullable=True)  # MIME type of the file
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    job = relationship("AnalysisJob", back_populates="results")
    circular = relationship(
        "AdmissionCircular", 
        back_populates="result", 
        uselist=False, 
        cascade="all, delete-orphan",
        lazy="joined"  # Eagerly load circular data
    )


class AdmissionCircular(Base):
    __tablename__ = "admission_circulars"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    result_id = Column(UUID(as_uuid=True), ForeignKey("analysis_results.id"), nullable=False, unique=True)
    
    # Basic Information
    university_name = Column(String, nullable=False)
    circular_link = Column(String, nullable=False)
    website_id = Column(String, nullable=False)
    
    # Application Period
    application_period_start = Column(String, nullable=True)
    application_period_end = Column(String, nullable=True)
    
    # Exam Information
    exam_date = Column(String, nullable=True)
    exam_time = Column(String, nullable=True)  # Exam time if mentioned
    exam_venue = Column(String, nullable=True)  # Exam venue/location
    exam_duration = Column(String, nullable=True)  # Exam duration
    
    # Additional Requirements
    age_limit_min = Column(Integer, nullable=True)  # Minimum age requirement
    age_limit_max = Column(Integer, nullable=True)  # Maximum age requirement
    nationality_requirement = Column(String, nullable=True)  # Nationality requirements
    gender_requirement = Column(String, nullable=True)  # Gender requirements if any
    
    # Contact Information
    contact_email = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
    contact_address = Column(Text, nullable=True)
    
    # Additional Documents
    required_documents = Column(ARRAY(String), nullable=True)  # List of required documents
    
    # Quota Information
    quota_freedom_fighter = Column(Integer, nullable=True)  # Freedom fighter quota seats
    quota_tribal = Column(Integer, nullable=True)  # Tribal quota seats
    quota_other = Column(Text, nullable=True)  # Other quota information as text
    
    # General GPA Requirements
    general_gpa_ssc = Column(Float, nullable=True)
    general_gpa_hsc = Column(Float, nullable=True)
    general_gpa_total = Column(Float, nullable=True)
    general_gpa_with_4th_subject = Column(Boolean, nullable=True)
    
    # Year Requirements
    ssc_years = Column(ARRAY(String), nullable=False)
    hsc_years = Column(ARRAY(String), nullable=False)
    
    # Application Fee
    application_fee = Column(String, nullable=True)
    
    # Summary
    raw_summary = Column(Text, nullable=True)
    
    # Additional Notes
    additional_notes = Column(Text, nullable=True)  # Any additional important notes
    
    # Raw Data (for debugging/backup)
    raw_response = Column(Text, nullable=True)  # Store raw JSON response from Gemini
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    result = relationship("AnalysisResult", back_populates="circular")
    department_requirements = relationship(
        "DepartmentRequirement", 
        back_populates="circular", 
        cascade="all, delete-orphan",
        lazy="joined"  # Eagerly load department requirements
    )


class DepartmentRequirement(Base):
    __tablename__ = "department_requirements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    circular_id = Column(UUID(as_uuid=True), ForeignKey("admission_circulars.id"), nullable=False)
    
    # Department Information
    department_name = Column(String, nullable=False)
    department_code = Column(String, nullable=True)  # Department code if available
    
    # GPA Requirements
    min_gpa_ssc = Column(Float, nullable=True)
    min_gpa_hsc = Column(Float, nullable=True)
    min_gpa_total = Column(Float, nullable=True)
    
    # Required Subjects
    required_subjects = Column(ARRAY(String), nullable=True)
    
    # Special Conditions
    special_conditions = Column(Text, nullable=True)
    
    # Department-specific quotas
    seats_total = Column(Integer, nullable=True)  # Total seats available
    seats_quota_freedom_fighter = Column(Integer, nullable=True)
    seats_quota_tribal = Column(Integer, nullable=True)
    seats_quota_other = Column(Integer, nullable=True)
    
    # Admission test information for this department
    admission_test_subjects = Column(ARRAY(String), nullable=True)  # Subjects tested for this department
    admission_test_format = Column(String, nullable=True)  # MCQ, Written, etc.
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    circular = relationship("AdmissionCircular", back_populates="department_requirements")

