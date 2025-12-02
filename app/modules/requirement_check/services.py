"""
Requirement Check Services

Business logic for checking student eligibility against requirements.
"""
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional
from datetime import datetime

from app.modules.requirement_check.models import RequirementCheck, EligibilityStatus
from app.modules.student_registration.models import Student
from app.modules.requirement_analyzer.models import AdmissionCircular, DepartmentRequirement


async def check_requirements(
    db: Session,
    student_id: UUID,
    circular_id: UUID,
    department_id: Optional[UUID] = None
) -> RequirementCheck:
    """
    Check if a student meets the requirements for a university/department.
    
    Returns a RequirementCheck record with detailed results.
    """
    # Get student
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise ValueError("Student not found")
    
    # Get circular
    circular = db.query(AdmissionCircular).filter(AdmissionCircular.id == circular_id).first()
    if not circular:
        raise ValueError("Admission circular not found")
    
    # Initialize check results
    check = RequirementCheck(
        student_id=student_id,
        circular_id=circular_id,
        department_id=department_id,
        status=EligibilityStatus.ELIGIBLE  # Start optimistic
    )
    
    missing_requirements = []
    
    # Check General GPA Requirements
    if circular.general_gpa_ssc and student.ssc_gpa:
        try:
            student_ssc_gpa = float(student.ssc_gpa)
            if student_ssc_gpa < circular.general_gpa_ssc:
                check.meets_general_gpa = False
                check.status = EligibilityStatus.NOT_ELIGIBLE
                missing_requirements.append(f"SSC GPA requirement not met: {student_ssc_gpa} < {circular.general_gpa_ssc}")
            else:
                check.meets_general_gpa = True
        except ValueError:
            check.meets_general_gpa = None
    
    if circular.general_gpa_hsc and student.hsc_gpa:
        try:
            student_hsc_gpa = float(student.hsc_gpa)
            if student_hsc_gpa < circular.general_gpa_hsc:
                check.meets_general_gpa = False
                check.status = EligibilityStatus.NOT_ELIGIBLE
                missing_requirements.append(f"HSC GPA requirement not met: {student_hsc_gpa} < {circular.general_gpa_hsc}")
            else:
                check.meets_general_gpa = True
        except ValueError:
            check.meets_general_gpa = None
    
    # Check Year Requirements
    if circular.ssc_years and student.ssc_year:
        if student.ssc_year not in circular.ssc_years:
            check.meets_year_requirement = False
            check.status = EligibilityStatus.NOT_ELIGIBLE
            missing_requirements.append(f"SSC year {student.ssc_year} not in allowed years: {circular.ssc_years}")
        else:
            check.meets_year_requirement = True
    
    if circular.hsc_years and student.hsc_year:
        if student.hsc_year not in circular.hsc_years:
            check.meets_year_requirement = False
            check.status = EligibilityStatus.NOT_ELIGIBLE
            missing_requirements.append(f"HSC year {student.hsc_year} not in allowed years: {circular.hsc_years}")
        else:
            check.meets_year_requirement = True
    
    # Check Department-Specific Requirements (if specified)
    if department_id:
        dept_req = db.query(DepartmentRequirement).filter(DepartmentRequirement.id == department_id).first()
        if dept_req:
            # Check department GPA requirements
            if dept_req.min_gpa_total and student.ssc_gpa and student.hsc_gpa:
                try:
                    student_total = float(student.ssc_gpa) + float(student.hsc_gpa)
                    if student_total < dept_req.min_gpa_total:
                        check.meets_department_gpa = False
                        check.status = EligibilityStatus.NOT_ELIGIBLE
                        missing_requirements.append(f"Department GPA requirement not met: {student_total} < {dept_req.min_gpa_total}")
                    else:
                        check.meets_department_gpa = True
                        check.gpa_difference = student_total - dept_req.min_gpa_total
                except ValueError:
                    check.meets_department_gpa = None
    
    # Check Age Requirements
    if circular.age_limit_min or circular.age_limit_max:
        if student.date_of_birth:
            from datetime import date
            today = date.today()
            age = today.year - student.date_of_birth.year - ((today.month, today.day) < (student.date_of_birth.month, student.date_of_birth.day))
            
            if circular.age_limit_min and age < circular.age_limit_min:
                check.meets_age_requirement = False
                check.status = EligibilityStatus.NOT_ELIGIBLE
                missing_requirements.append(f"Age requirement not met: {age} < {circular.age_limit_min}")
            elif circular.age_limit_max and age > circular.age_limit_max:
                check.meets_age_requirement = False
                check.status = EligibilityStatus.NOT_ELIGIBLE
                missing_requirements.append(f"Age requirement not met: {age} > {circular.age_limit_max}")
            else:
                check.meets_age_requirement = True
    
    # Check Nationality
    if circular.nationality_requirement and student.nationality:
        if student.nationality.lower() != circular.nationality_requirement.lower():
            check.meets_nationality_requirement = False
            check.status = EligibilityStatus.NOT_ELIGIBLE
            missing_requirements.append(f"Nationality requirement not met")
        else:
            check.meets_nationality_requirement = True
    
    # Set missing requirements text
    if missing_requirements:
        check.missing_requirements = "; ".join(missing_requirements)
    
    # Save check result
    db.add(check)
    db.commit()
    db.refresh(check)
    
    return check

