from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from uuid import UUID
from typing import Optional

from app.core.database import get_db
from app.modules.requirement_analyzer.models import AnalysisResult, AdmissionCircular, ResultStatus
from app.modules.requirement_analyzer.schemas import (
    ResultResponse, ResultsListResponse, AdmissionCircularData,
    GpaRequirement, YearRequirement, ApplicationPeriod, DepartmentRequirement
)

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


@router.get("/results/{result_id}", response_model=ResultResponse)
async def get_result(
    result_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get a specific analysis result by ID.
    """
    result = db.query(AnalysisResult).options(
        joinedload(AnalysisResult.circular).joinedload(AdmissionCircular.department_requirements)
    ).filter(AnalysisResult.id == result_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    
    # Load structured data from database (already loaded via joinedload)
    data_model = None
    if result.status == ResultStatus.COMPLETED and result.circular:
        data_model = circular_to_pydantic(result.circular)
    
    return ResultResponse(
        id=result.id,
        job_id=result.job_id,
        url=result.url,
        status=result.status.value,
        data=data_model,
        error=result.error,
        created_at=result.created_at,
        updated_at=result.updated_at
    )


@router.get("/results", response_model=ResultsListResponse)
async def list_results(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    status: Optional[str] = Query(None, description="Filter by status (pending, processing, completed, failed)"),
    db: Session = Depends(get_db)
):
    """
    List all analysis results with pagination.
    Returns university admission circulars with full details including requirements.
    """
    query = db.query(AnalysisResult)
    
    # Filter by status if provided (convert string to enum if valid)
    if status:
        try:
            # Try to match the status string to enum value
            status_lower = status.lower()
            status_enum = None
            for enum_value in ResultStatus:
                if enum_value.value.lower() == status_lower:
                    status_enum = enum_value
                    break
            
            if status_enum:
                query = query.filter(AnalysisResult.status == status_enum)
            else:
                # Invalid status value, return empty results
                return ResultsListResponse(
                    results=[],
                    total=0,
                    page=page,
                    page_size=page_size
                )
        except Exception:
            # Invalid status value, return empty results
            return ResultsListResponse(
                results=[],
                total=0,
                page=page,
                page_size=page_size
            )
    
    # Optimize: Only load circular data for completed results
    # For other statuses, we don't need the circular data
    if status and status.lower() == 'completed':
        query = query.options(
            joinedload(AnalysisResult.circular).joinedload(AdmissionCircular.department_requirements)
        )
    else:
        # Still load circular for all results in case some are completed
        query = query.options(
            joinedload(AnalysisResult.circular).joinedload(AdmissionCircular.department_requirements)
        )
    
    # Get total count before pagination
    total = query.count()
    
    # Apply pagination and ordering
    offset = (page - 1) * page_size
    results = query.order_by(AnalysisResult.created_at.desc()).offset(offset).limit(page_size).all()
    
    result_responses = []
    for result in results:
        # Load structured data from database (already loaded via joinedload)
        data_model = None
        if result.status == ResultStatus.COMPLETED and result.circular:
            try:
                data_model = circular_to_pydantic(result.circular)
            except Exception as e:
                # Log error but continue processing other results
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error converting circular to pydantic for result {result.id}: {str(e)}")
                data_model = None
        
        result_responses.append(
            ResultResponse(
                id=result.id,
                job_id=result.job_id,
                url=result.url,
                status=result.status.value,
                data=data_model,
                error=result.error,
                created_at=result.created_at,
                updated_at=result.updated_at
            )
        )
    
    return ResultsListResponse(
        results=result_responses,
        total=total,
        page=page,
        page_size=page_size
    )

