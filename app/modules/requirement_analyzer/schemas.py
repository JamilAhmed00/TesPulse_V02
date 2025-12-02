from pydantic import BaseModel, Field
from typing import Optional, List, Union
from datetime import datetime
from uuid import UUID

# This module contains schemas for the requirement analyzer module


# Request schemas
class AnalyzeRequest(BaseModel):
    urls: Union[str, List[str]] = Field(..., description="Single URL or list of URLs to analyze")


# Response schemas
class GpaRequirement(BaseModel):
    ssc: Optional[float] = None
    hsc: Optional[float] = None
    total: Optional[float] = None
    with4thSubject: Optional[bool] = None


class DepartmentRequirement(BaseModel):
    departmentName: str
    departmentCode: Optional[str] = None
    minGpaSSC: Optional[float] = None
    minGpaHSC: Optional[float] = None
    minGpaTotal: Optional[float] = None
    requiredSubjects: Optional[List[str]] = None
    specialConditions: Optional[str] = None
    seatsTotal: Optional[int] = None
    seatsQuotaFreedomFighter: Optional[int] = None
    seatsQuotaTribal: Optional[int] = None
    seatsQuotaOther: Optional[int] = None
    admissionTestSubjects: Optional[List[str]] = None
    admissionTestFormat: Optional[str] = None


class YearRequirement(BaseModel):
    sscYears: List[str]
    hscYears: List[str]


class ApplicationPeriod(BaseModel):
    start: Optional[str] = None
    end: Optional[str] = None


class AdmissionCircularData(BaseModel):
    universityName: str
    circularLink: str
    websiteId: str
    applicationPeriod: ApplicationPeriod
    examDate: Optional[str] = None
    examTime: Optional[str] = None
    examVenue: Optional[str] = None
    examDuration: Optional[str] = None
    generalGpaRequirements: GpaRequirement
    yearRequirements: YearRequirement
    departmentWiseRequirements: List[DepartmentRequirement]
    applicationFee: Optional[str] = None
    rawSummary: Optional[str] = None
    # Additional Requirements
    ageLimitMin: Optional[int] = None
    ageLimitMax: Optional[int] = None
    nationalityRequirement: Optional[str] = None
    genderRequirement: Optional[str] = None
    # Contact Information
    contactEmail: Optional[str] = None
    contactPhone: Optional[str] = None
    contactAddress: Optional[str] = None
    # Additional Documents
    requiredDocuments: Optional[List[str]] = None
    # Quota Information
    quotaFreedomFighter: Optional[int] = None
    quotaTribal: Optional[int] = None
    quotaOther: Optional[str] = None
    # Additional Notes
    additionalNotes: Optional[str] = None


class AnalyzeResponse(BaseModel):
    job_id: UUID
    status: str
    urls_count: int
    created_at: datetime


class ResultResponse(BaseModel):
    id: UUID
    job_id: UUID
    url: str
    status: str
    data: Optional[AdmissionCircularData] = None
    error: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class JobStatusResponse(BaseModel):
    job_id: UUID
    status: str
    urls_count: int
    created_at: datetime
    completed_at: Optional[datetime] = None
    results: List[ResultResponse] = []
    errors: List[ResultResponse] = []


class ResultsListResponse(BaseModel):
    results: List[ResultResponse]
    total: int
    page: int
    page_size: int

