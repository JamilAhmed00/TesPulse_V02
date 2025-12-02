import asyncio
from typing import List
from sqlalchemy.orm import Session
from app.modules.requirement_analyzer.models import (
    AnalysisJob, AnalysisResult, JobStatus, ResultStatus,
    AdmissionCircular, DepartmentRequirement
)
from app.core.database import SessionLocal
from app.modules.requirement_analyzer.services import analyze_circular
from app.modules.requirement_analyzer.schemas import AdmissionCircularData
import uuid


def save_circular_data(db: Session, result_id: uuid.UUID, data: AdmissionCircularData, raw_response: str = None) -> None:
    """
    Save admission circular data in structured format to the database.
    """
    # Create or update AdmissionCircular record
    circular = AdmissionCircular(
        result_id=result_id,
        university_name=data.universityName,
        circular_link=data.circularLink,
        website_id=data.websiteId,
        application_period_start=data.applicationPeriod.start if data.applicationPeriod else None,
        application_period_end=data.applicationPeriod.end if data.applicationPeriod else None,
        exam_date=data.examDate,
        exam_time=data.examTime,
        exam_venue=data.examVenue,
        exam_duration=data.examDuration,
        general_gpa_ssc=data.generalGpaRequirements.ssc if data.generalGpaRequirements else None,
        general_gpa_hsc=data.generalGpaRequirements.hsc if data.generalGpaRequirements else None,
        general_gpa_total=data.generalGpaRequirements.total if data.generalGpaRequirements else None,
        general_gpa_with_4th_subject=data.generalGpaRequirements.with4thSubject if data.generalGpaRequirements else None,
        ssc_years=data.yearRequirements.sscYears if data.yearRequirements else [],
        hsc_years=data.yearRequirements.hscYears if data.yearRequirements else [],
        application_fee=data.applicationFee,
        raw_summary=data.rawSummary,
        # Additional Requirements
        age_limit_min=data.ageLimitMin,
        age_limit_max=data.ageLimitMax,
        nationality_requirement=data.nationalityRequirement,
        gender_requirement=data.genderRequirement,
        # Contact Information
        contact_email=data.contactEmail,
        contact_phone=data.contactPhone,
        contact_address=data.contactAddress,
        # Additional Documents
        required_documents=data.requiredDocuments,
        # Quota Information
        quota_freedom_fighter=data.quotaFreedomFighter,
        quota_tribal=data.quotaTribal,
        quota_other=data.quotaOther,
        # Additional Notes
        additional_notes=data.additionalNotes,
        # Raw Response
        raw_response=raw_response,
    )
    db.add(circular)
    db.flush()  # Flush to get the circular ID
    
    # Save department requirements
    if data.departmentWiseRequirements:
        for dept_req in data.departmentWiseRequirements:
            dept = DepartmentRequirement(
                circular_id=circular.id,
                department_name=dept_req.departmentName,
                department_code=dept_req.departmentCode,
                min_gpa_ssc=dept_req.minGpaSSC,
                min_gpa_hsc=dept_req.minGpaHSC,
                min_gpa_total=dept_req.minGpaTotal,
                required_subjects=dept_req.requiredSubjects,
                special_conditions=dept_req.specialConditions,
                seats_total=dept_req.seatsTotal,
                seats_quota_freedom_fighter=dept_req.seatsQuotaFreedomFighter,
                seats_quota_tribal=dept_req.seatsQuotaTribal,
                seats_quota_other=dept_req.seatsQuotaOther,
                admission_test_subjects=dept_req.admissionTestSubjects,
                admission_test_format=dept_req.admissionTestFormat,
            )
            db.add(dept)
    
    db.commit()


async def process_single_url(
    db: Session,
    job_id: uuid.UUID,
    url: str,
    result_id: uuid.UUID
) -> None:
    """
    Process a single URL and save the result to the database.
    """
    import time
    from datetime import datetime
    
    # Get the result record
    result = db.query(AnalysisResult).filter(AnalysisResult.id == result_id).first()
    if not result:
        return
    
    start_time = time.time()
    
    try:
        # Update status to processing
        result.status = ResultStatus.PROCESSING
        db.commit()
        
        # Analyze the URL
        data, raw_response = await analyze_circular(url)
        
        # Calculate processing time
        processing_time_ms = int((time.time() - start_time) * 1000)
        
        # Save the structured data
        save_circular_data(db, result_id, data, raw_response)
        
        # Update result status and metadata
        result.status = ResultStatus.COMPLETED
        result.processing_time_ms = processing_time_ms
        db.commit()
        
    except Exception as e:
        # Save error
        result.status = ResultStatus.FAILED
        result.error = str(e)
        result.processing_time_ms = int((time.time() - start_time) * 1000)
        db.commit()


async def process_job(db: Session, job_id: uuid.UUID) -> None:
    """
    Process all URLs in a job concurrently.
    """
    # Get the job
    job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
    if not job:
        return
    
    # Update job status to processing
    job.status = JobStatus.PROCESSING
    db.commit()
    
    # Get all pending results for this job
    results = db.query(AnalysisResult).filter(
        AnalysisResult.job_id == job_id,
        AnalysisResult.status == ResultStatus.PENDING
    ).all()
    
    # Process URLs concurrently (limit to 5 concurrent requests)
    semaphore = asyncio.Semaphore(5)
    
    async def process_with_semaphore(result: AnalysisResult):
        async with semaphore:
            await process_single_url(db, job_id, result.url, result.id)
    
    # Create tasks
    tasks = [process_with_semaphore(result) for result in results]
    
    # Wait for all tasks to complete
    await asyncio.gather(*tasks)
    
    # Check job status
    job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
    if job:
        # Check if all results are completed or failed
        remaining = db.query(AnalysisResult).filter(
            AnalysisResult.job_id == job_id,
            AnalysisResult.status.in_([ResultStatus.PENDING, ResultStatus.PROCESSING])
        ).count()
        
        if remaining == 0:
            # All results are done
            job.status = JobStatus.COMPLETED
            from datetime import datetime
            job.completed_at = datetime.utcnow()
            db.commit()


async def process_job_background(job_id: uuid.UUID) -> None:
    """
    Background task to process a job.
    This should be called in a background task/thread.
    Creates its own database session.
    """
    db = SessionLocal()
    try:
        await process_job(db, job_id)
    except Exception as e:
        # Update job status to failed
        job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
        if job:
            job.status = JobStatus.FAILED
            db.commit()
        raise e
    finally:
        db.close()

