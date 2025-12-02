from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from uuid import UUID
import uuid
import asyncio
from concurrent.futures import ThreadPoolExecutor

from app.core.database import get_db
from app.modules.requirement_analyzer.models import AnalysisJob, AnalysisResult, JobStatus, ResultStatus, AdmissionCircular
from app.modules.requirement_analyzer.schemas import (
    AnalyzeRequest, AnalyzeResponse, JobStatusResponse, ResultResponse,
    AdmissionCircularData, GpaRequirement, YearRequirement, ApplicationPeriod,
    DepartmentRequirement
)
from app.modules.requirement_analyzer.processor import process_job_background

# Thread pool for background tasks
executor = ThreadPoolExecutor(max_workers=5)

router = APIRouter(tags=["Requirement Analyzer"])


def circular_to_pydantic(circular: AdmissionCircular) -> AdmissionCircularData:
    """Convert database AdmissionCircular model to Pydantic model."""
    # Build department requirements
    dept_reqs = []
    for dept in circular.department_requirements:
        dept_reqs.append(DepartmentRequirement(
            departmentName=dept.department_name,
            departmentCode=dept.department_code,
            minGpaSSC=dept.min_gpa_ssc,
            minGpaHSC=dept.min_gpa_hsc,
            minGpaTotal=dept.min_gpa_total,
            requiredSubjects=dept.required_subjects,
            specialConditions=dept.special_conditions,
            seatsTotal=dept.seats_total,
            seatsQuotaFreedomFighter=dept.seats_quota_freedom_fighter,
            seatsQuotaTribal=dept.seats_quota_tribal,
            seatsQuotaOther=dept.seats_quota_other,
            admissionTestSubjects=dept.admission_test_subjects,
            admissionTestFormat=dept.admission_test_format,
        ))
    
    return AdmissionCircularData(
        universityName=circular.university_name,
        circularLink=circular.circular_link,
        websiteId=circular.website_id,
        applicationPeriod=ApplicationPeriod(
            start=circular.application_period_start,
            end=circular.application_period_end,
        ),
        examDate=circular.exam_date,
        examTime=circular.exam_time,
        examVenue=circular.exam_venue,
        examDuration=circular.exam_duration,
        generalGpaRequirements=GpaRequirement(
            ssc=circular.general_gpa_ssc,
            hsc=circular.general_gpa_hsc,
            total=circular.general_gpa_total,
            with4thSubject=circular.general_gpa_with_4th_subject,
        ),
        yearRequirements=YearRequirement(
            sscYears=circular.ssc_years or [],
            hscYears=circular.hsc_years or [],
        ),
        departmentWiseRequirements=dept_reqs,
        applicationFee=circular.application_fee,
        rawSummary=circular.raw_summary,
        ageLimitMin=circular.age_limit_min,
        ageLimitMax=circular.age_limit_max,
        nationalityRequirement=circular.nationality_requirement,
        genderRequirement=circular.gender_requirement,
        contactEmail=circular.contact_email,
        contactPhone=circular.contact_phone,
        contactAddress=circular.contact_address,
        requiredDocuments=circular.required_documents,
        quotaFreedomFighter=circular.quota_freedom_fighter,
        quotaTribal=circular.quota_tribal,
        quotaOther=circular.quota_other,
        additionalNotes=circular.additional_notes,
    )


def run_async_task(coro):
    """Helper to run async function in thread pool"""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@router.post("/analyze", response_model=AnalyzeResponse)
async def create_analysis_job(
    request: AnalyzeRequest,
    db: Session = Depends(get_db)
):
    """
    Create a new analysis job for one or more URLs.
    Returns immediately with a job_id for tracking.
    """
    # Normalize URLs to list
    if isinstance(request.urls, str):
        urls = [request.urls]
    else:
        urls = request.urls
    
    if not urls:
        raise HTTPException(status_code=400, detail="At least one URL is required")
    
    # Validate URLs
    for url in urls:
        if not url.startswith(('http://', 'https://')):
            raise HTTPException(status_code=400, detail=f"Invalid URL: {url}")
    
    # Create job
    job = AnalysisJob(
        status=JobStatus.PENDING,
        urls=urls,
        urls_count=len(urls)
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    
    # Create result records for each URL
    for url in urls:
        result = AnalysisResult(
            job_id=job.id,
            url=url,
            status=ResultStatus.PENDING
        )
        db.add(result)
    
    db.commit()
    
    # Start background processing in thread pool
    executor.submit(run_async_task, process_job_background(job.id))
    
    return AnalyzeResponse(
        job_id=job.id,
        status=job.status.value,
        urls_count=job.urls_count,
        created_at=job.created_at
    )


@router.get("/analyze/{job_id}", response_model=JobStatusResponse)
async def get_job_status(
    job_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get the status and results of an analysis job.
    """
    job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Get all results for this job with joined circular data
    results = db.query(AnalysisResult).options(
        joinedload(AnalysisResult.circular).joinedload(AdmissionCircular.department_requirements)
    ).filter(AnalysisResult.job_id == job_id).all()
    
    # Separate successful and failed results
    successful_results = []
    error_results = []
    
    for result in results:
        # Load structured data from database (already loaded via joinedload)
        data_model = None
        if result.status == ResultStatus.COMPLETED and result.circular:
            data_model = circular_to_pydantic(result.circular)
        
        result_response = ResultResponse(
            id=result.id,
            job_id=result.job_id,
            url=result.url,
            status=result.status.value,
            data=data_model,
            error=result.error,
            created_at=result.created_at,
            updated_at=result.updated_at
        )
        
        if result.status == ResultStatus.COMPLETED:
            successful_results.append(result_response)
        elif result.status == ResultStatus.FAILED:
            error_results.append(result_response)
    
    return JobStatusResponse(
        job_id=job.id,
        status=job.status.value,
        urls_count=job.urls_count,
        created_at=job.created_at,
        completed_at=job.completed_at,
        results=successful_results,
        errors=error_results
    )

