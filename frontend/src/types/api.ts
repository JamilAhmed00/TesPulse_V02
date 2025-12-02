// API Type Definitions matching FastAPI schemas

// ============================================================================
// Authentication Types
// ============================================================================

export interface UserSignup {
  email: string;
  password: string;
  full_name: string;
  username?: string;
  role?: 'admin' | 'student';
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserResponse {
  id: string;
  email: string;
  username?: string | null;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login?: string | null;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface PasswordChange {
  current_password: string;
  new_password: string;
}

// ============================================================================
// Requirement Analyzer Types
// ============================================================================

export interface AnalyzeRequest {
  urls: string | string[];
}

export interface GpaRequirement {
  ssc?: number | null;
  hsc?: number | null;
  total?: number | null;
  with4thSubject?: boolean | null;
}

export interface DepartmentRequirement {
  departmentName: string;
  departmentCode?: string | null;
  minGpaSSC?: number | null;
  minGpaHSC?: number | null;
  minGpaTotal?: number | null;
  requiredSubjects?: string[] | null;
  specialConditions?: string | null;
  seatsTotal?: number | null;
  seatsQuotaFreedomFighter?: number | null;
  seatsQuotaTribal?: number | null;
  seatsQuotaOther?: number | null;
  admissionTestSubjects?: string[] | null;
  admissionTestFormat?: string | null;
}

export interface YearRequirement {
  sscYears: string[];
  hscYears: string[];
}

export interface ApplicationPeriod {
  start?: string | null;
  end?: string | null;
}

export interface AdmissionCircularData {
  universityName: string;
  circularLink: string;
  websiteId: string;
  applicationPeriod: ApplicationPeriod;
  examDate?: string | null;
  examTime?: string | null;
  examVenue?: string | null;
  examDuration?: string | null;
  generalGpaRequirements: GpaRequirement;
  yearRequirements: YearRequirement;
  departmentWiseRequirements: DepartmentRequirement[];
  applicationFee?: string | null;
  rawSummary?: string | null;
  ageLimitMin?: number | null;
  ageLimitMax?: number | null;
  nationalityRequirement?: string | null;
  genderRequirement?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactAddress?: string | null;
  requiredDocuments?: string[] | null;
  quotaFreedomFighter?: number | null;
  quotaTribal?: number | null;
  quotaOther?: string | null;
  additionalNotes?: string | null;
}

export interface AnalyzeResponse {
  job_id: string;
  status: string;
  urls_count: number;
  created_at: string;
}

export interface ResultResponse {
  id: string;
  job_id: string;
  url: string;
  status: string;
  data?: AdmissionCircularData | null;
  error?: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobStatusResponse {
  job_id: string;
  status: string;
  urls_count: number;
  created_at: string;
  completed_at?: string | null;
  results: ResultResponse[];
  errors: ResultResponse[];
}

export interface ResultsListResponse {
  results: ResultResponse[];
  total: number;
  page: number;
  page_size: number;
}

// ============================================================================
// Student Types
// ============================================================================

export interface StudentCreate {
  // Academic Information
  ssc_roll?: string | null;
  ssc_registration?: string | null;
  ssc_year?: string | null;
  ssc_board?: string | null;
  ssc_gpa?: string | null;
  hsc_roll?: string | null;
  hsc_registration?: string | null;
  hsc_year?: string | null;
  hsc_board?: string | null;
  hsc_gpa?: string | null;
  applied_faculty?: string | null;
  applied_program?: string | null;
  
  // Personal Information
  candidate_name?: string | null;
  father_name?: string | null;
  mother_name?: string | null;
  full_name: string;
  date_of_birth?: string | null;
  gender?: string | null;
  nationality?: string | null;
  religion?: string | null;
  nid_or_birth_certificate?: string | null;
  
  // Contact Information
  email: string;
  phone?: string | null;
  mobile_number?: string | null;
  
  // Present Address
  present_division?: string | null;
  present_district?: string | null;
  present_thana?: string | null;
  present_post_office?: string | null;
  present_village?: string | null;
  present_zip_code?: string | null;
  
  // Permanent Address
  same_as_present_address?: boolean;
  permanent_division?: string | null;
  permanent_district?: string | null;
  permanent_thana?: string | null;
  permanent_post_office?: string | null;
  permanent_village?: string | null;
  permanent_zip_code?: string | null;
  
  // Legacy fields
  address?: string | null;
}

export interface StudentUpdate {
  // Academic Information
  ssc_roll?: string | null;
  ssc_registration?: string | null;
  ssc_year?: string | null;
  ssc_board?: string | null;
  ssc_gpa?: string | null;
  hsc_roll?: string | null;
  hsc_registration?: string | null;
  hsc_year?: string | null;
  hsc_board?: string | null;
  hsc_gpa?: string | null;
  applied_faculty?: string | null;
  applied_program?: string | null;
  
  // Personal Information
  candidate_name?: string | null;
  father_name?: string | null;
  mother_name?: string | null;
  full_name?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  nationality?: string | null;
  religion?: string | null;
  nid_or_birth_certificate?: string | null;
  
  // Contact Information
  phone?: string | null;
  mobile_number?: string | null;
  
  // Present Address
  present_division?: string | null;
  present_district?: string | null;
  present_thana?: string | null;
  present_post_office?: string | null;
  present_village?: string | null;
  present_zip_code?: string | null;
  
  // Permanent Address
  same_as_present_address?: boolean | null;
  permanent_division?: string | null;
  permanent_district?: string | null;
  permanent_thana?: string | null;
  permanent_post_office?: string | null;
  permanent_village?: string | null;
  permanent_zip_code?: string | null;
  
  // Legacy fields
  address?: string | null;
}

export interface StudentResponse {
  id: string;
  user_id?: string | null;
  
  // Academic Information
  ssc_roll?: string | null;
  ssc_registration?: string | null;
  ssc_year?: string | null;
  ssc_board?: string | null;
  ssc_gpa?: string | null;
  hsc_roll?: string | null;
  hsc_registration?: string | null;
  hsc_year?: string | null;
  hsc_board?: string | null;
  hsc_gpa?: string | null;
  applied_faculty?: string | null;
  applied_program?: string | null;
  
  // Personal Information
  candidate_name?: string | null;
  father_name?: string | null;
  mother_name?: string | null;
  full_name: string;
  date_of_birth?: string | null;
  gender?: string | null;
  nationality?: string | null;
  religion?: string | null;
  nid_or_birth_certificate?: string | null;
  
  // Contact Information
  email: string;
  phone?: string | null;
  mobile_number?: string | null;
  
  // Present Address
  present_division?: string | null;
  present_district?: string | null;
  present_thana?: string | null;
  present_post_office?: string | null;
  present_village?: string | null;
  present_zip_code?: string | null;
  
  // Permanent Address
  same_as_present_address?: boolean;
  permanent_division?: string | null;
  permanent_district?: string | null;
  permanent_thana?: string | null;
  permanent_post_office?: string | null;
  permanent_village?: string | null;
  permanent_zip_code?: string | null;
  
  // Legacy fields
  address?: string | null;
  
  // Status
  status: string;
  created_at: string;
  updated_at: string;
}

export interface StudentListResponse {
  students: StudentResponse[];
  total: number;
  page: number;
  page_size: number;
}

export interface EducationBoardResultRequest {
  examination: string; // "SSC" | "HSC"
  year: string;
  board: string;
  roll: string;
  registration: string;
}

export interface EducationBoardResultResponse {
  success: boolean;
  gpa?: string | null;
  father_name?: string | null;
  mother_name?: string | null;
  student_name?: string | null;
  error?: string | null;
}

// ============================================================================
// Application Types
// ============================================================================

export interface ApplicationCreate {
  student_id: string;
  circular_id: string;
  department_id?: string | null;
  preferred_department?: string | null;
  personal_statement?: string | null;
  additional_notes?: string | null;
}

export interface ApplicationUpdate {
  preferred_department?: string | null;
  personal_statement?: string | null;
  additional_notes?: string | null;
  status?: string | null;
}

export interface ApplicationResponse {
  id: string;
  student_id: string;
  circular_id: string;
  department_id?: string | null;
  requirement_check_id?: string | null;
  preferred_department?: string | null;
  application_number?: string | null;
  status: string;
  payment_status?: string | null;
  application_fee_paid: boolean;
  personal_statement?: string | null;
  additional_notes?: string | null;
  submitted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationListResponse {
  applications: ApplicationResponse[];
  total: number;
  page: number;
  page_size: number;
}

// ============================================================================
// Requirement Check Types
// ============================================================================

export interface RequirementCheckRequest {
  student_id: string;
  circular_id: string;
  department_id?: string | null;
}

export interface RequirementCheckResponse {
  id: string;
  student_id: string;
  circular_id: string;
  department_id?: string | null;
  status: string;
  meets_general_gpa?: boolean | null;
  meets_department_gpa?: boolean | null;
  meets_year_requirement?: boolean | null;
  meets_subject_requirement?: boolean | null;
  meets_age_requirement?: boolean | null;
  meets_nationality_requirement?: boolean | null;
  missing_requirements?: string | null;
  notes?: string | null;
  gpa_difference?: number | null;
  created_at: string;
}

// ============================================================================
// API Error Types
// ============================================================================

export interface ApiError {
  detail: string;
}

