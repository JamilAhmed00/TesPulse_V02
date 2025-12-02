# UniScan API - Project Context

## Overview

UniScan is a REST API service that automatically extracts structured admission requirements data from Bangladeshi university admission circulars. The system processes PDF documents and web pages using Google Gemini AI's OCR capabilities to extract detailed information about GPA requirements, application periods, exam dates, department-specific requirements, and more.

## Architecture

### Technology Stack

- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL (via Docker)
- **AI/ML**: Google Gemini 1.5 Pro (for OCR and data extraction)
- **ORM**: SQLAlchemy
- **Migrations**: Alembic
- **Containerization**: Docker & Docker Compose
- **Async Processing**: Python asyncio with concurrent processing

### System Components

#### 1. API Layer (`routers/`)
- **`analyze.py`**: Handles analysis job creation and status checking
  - `POST /api/analyze`: Create new analysis jobs (single or bulk URLs)
  - `GET /api/analyze/{job_id}`: Get job status and results
- **`results.py`**: Handles result retrieval
  - `GET /api/results/{result_id}`: Get individual result
  - `GET /api/results`: List all results with pagination

#### 2. Service Layer (`services/`)
- **`gemini_service.py`**: Core AI processing
  - Downloads PDFs/images from URLs
  - Uses Gemini 1.5 Pro for OCR and data extraction
  - Handles both direct file processing and URL-based inference
  - Extracts structured JSON data matching the admission circular schema
- **`processor.py`**: Background job processing
  - Processes URLs asynchronously
  - Manages concurrent processing (max 5 concurrent requests)
  - Updates database as results complete
  - Handles errors and retries

#### 3. Data Layer (`models/`)
- **`database.py`**: SQLAlchemy database setup and session management
- **`analysis.py`**: Database models
  - `AnalysisJob`: Tracks bulk processing jobs
  - `AnalysisResult`: Tracks individual URL processing results
  - `AdmissionCircular`: Stores extracted admission circular data
  - `DepartmentRequirement`: Stores department-specific requirements

#### 4. Schema Layer (`schemas/`)
- **`analysis.py`**: Pydantic models for request/response validation
  - Request models: `AnalyzeRequest`
  - Response models: `AnalyzeResponse`, `JobStatusResponse`, `ResultResponse`
  - Data models: `AdmissionCircularData`, `DepartmentRequirement`, etc.

## Data Flow

### 1. Job Creation Flow

```
Client Request (POST /api/analyze)
    ↓
Create AnalysisJob record (status: PENDING)
    ↓
Create AnalysisResult records for each URL (status: PENDING)
    ↓
Start background processing task
    ↓
Return job_id immediately
```

### 2. Processing Flow (Background)

```
For each URL in job:
    ↓
Update status to PROCESSING
    ↓
Download PDF/image (if possible)
    ↓
Send to Gemini AI for OCR + extraction
    ↓
Parse JSON response
    ↓
Save structured data to database:
    - AdmissionCircular record
    - DepartmentRequirement records (one per department)
    ↓
Update status to COMPLETED or FAILED
    ↓
When all URLs done → Update job status to COMPLETED
```

### 3. Data Extraction Process

#### PDF/Image Processing
1. **Download**: Attempts to download PDF/image directly from URL
2. **Upload**: Uploads file to Gemini API
3. **OCR**: Gemini performs OCR to extract all text
4. **Extraction**: AI analyzes text and extracts structured data
5. **Parsing**: JSON response is parsed and validated
6. **Storage**: Data is saved to structured database tables

#### URL-Based Processing (Fallback)
1. **Inference**: If download fails, infers university from URL
2. **Knowledge**: Uses AI's training data about the university
3. **Estimation**: Provides reasonable estimates based on typical requirements
4. **Storage**: Saves inferred data (marked as estimated)

## Database Schema

### Tables

#### `analysis_jobs`
- Tracks bulk processing jobs
- Fields: `id`, `status`, `urls[]`, `urls_count`, `created_at`, `completed_at`

#### `analysis_results`
- Tracks individual URL processing
- Fields: `id`, `job_id`, `url`, `status`, `error`, `processing_time_ms`, `file_size_bytes`, `file_mime_type`, `created_at`, `updated_at`
- Relationship: One-to-one with `admission_circulars`

#### `admission_circulars`
- Stores extracted admission circular data
- Fields:
  - Basic: `university_name`, `circular_link`, `website_id`
  - Dates: `application_period_start`, `application_period_end`, `exam_date`, `exam_time`, `exam_venue`, `exam_duration`
  - GPA: `general_gpa_ssc`, `general_gpa_hsc`, `general_gpa_total`, `general_gpa_with_4th_subject`
  - Years: `ssc_years[]`, `hsc_years[]`
  - Requirements: `age_limit_min`, `age_limit_max`, `nationality_requirement`, `gender_requirement`
  - Contact: `contact_email`, `contact_phone`, `contact_address`
  - Documents: `required_documents[]`
  - Quotas: `quota_freedom_fighter`, `quota_tribal`, `quota_other`
  - Other: `application_fee`, `raw_summary`, `additional_notes`, `raw_response`
- Relationship: One-to-many with `department_requirements`

#### `department_requirements`
- Stores department-specific requirements
- Fields:
  - Basic: `department_name`, `department_code`
  - GPA: `min_gpa_ssc`, `min_gpa_hsc`, `min_gpa_total`
  - Subjects: `required_subjects[]`
  - Seats: `seats_total`, `seats_quota_freedom_fighter`, `seats_quota_tribal`, `seats_quota_other`
  - Test: `admission_test_subjects[]`, `admission_test_format`
  - Other: `special_conditions`
- Relationship: Many-to-one with `admission_circulars`

## Key Features

### 1. Bulk Processing
- Accepts single URL or array of URLs
- Processes multiple URLs concurrently (up to 5 at a time)
- Non-blocking - returns job_id immediately
- Tracks progress and status for each URL

### 2. Robust OCR
- Uses Gemini 1.5 Pro for high-quality OCR
- Handles both Bangla and English text
- Extracts data from tables, headers, and fine print
- Converts Bangla numerals to English numbers

### 3. Structured Data Storage
- All data stored in normalized database tables
- No JSON blobs - everything is queryable
- Proper relationships between entities
- Supports complex queries and reporting

### 4. Error Handling
- Graceful handling of download failures
- JSON repair for malformed OCR responses
- Detailed error messages for debugging
- Continues processing other URLs if one fails

### 5. Comprehensive Data Extraction
- Extracts 30+ fields per circular
- Department-wise requirements
- Quota information
- Contact details
- Required documents
- Exam schedules
- Age and nationality requirements

## API Endpoints

### POST /api/analyze
Creates a new analysis job.

**Request:**
```json
{
  "urls": ["url1", "url2", ...]  // or single string
}
```

**Response:**
```json
{
  "job_id": "uuid",
  "status": "processing",
  "urls_count": 2,
  "created_at": "2025-12-02T13:00:00Z"
}
```

### GET /api/analyze/{job_id}
Gets job status and all results.

**Response:**
```json
{
  "job_id": "uuid",
  "status": "completed",
  "urls_count": 2,
  "created_at": "2025-12-02T13:00:00Z",
  "completed_at": "2025-12-02T13:05:00Z",
  "results": [...],  // Successful extractions
  "errors": [...]    // Failed extractions
}
```

### GET /api/results/{result_id}
Gets a specific result by ID.

### GET /api/results
Lists all results with pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20, max: 100)
- `status`: Filter by status (optional)

## Configuration

### Environment Variables

- `GEMINI_API_KEY`: Google Gemini API key (required)
- `DATABASE_URL`: PostgreSQL connection string (default: postgresql://postgres:postgres@postgres:5432/uniscan)
- `APP_NAME`: Application name (default: "UniScan API")
- `APP_VERSION`: Application version (default: "1.0.0")
- `DEBUG`: Debug mode (default: false)

### Docker Setup

The project uses Docker Compose with:
- **PostgreSQL**: Database service
- **FastAPI**: Application service

Both services are configured in `docker-compose.yml`.

## Data Extraction Schema

The system extracts the following information:

### Basic Information
- University name
- Circular link (source URL)
- Website ID (official domain)

### Application Information
- Application period (start/end dates)
- Application fee
- Required documents

### Exam Information
- Exam date(s)
- Exam time
- Exam venue/location
- Exam duration

### GPA Requirements
- General requirements: SSC, HSC, Total, 4th subject inclusion
- Year requirements: Allowed passing years for SSC and HSC

### Department Requirements
- Department name and code
- Minimum GPA requirements (SSC, HSC, Total)
- Required subjects
- Special conditions
- Seat allocations (total and by quota)
- Admission test information

### Additional Information
- Age limits (min/max)
- Nationality requirements
- Gender requirements
- Contact information (email, phone, address)
- Quota information (freedom fighter, tribal, other)
- Additional notes

## Processing Modes

### Mode 1: Direct File Processing (Preferred)
- URL points to a downloadable PDF/image
- File is downloaded and uploaded to Gemini
- High-quality OCR extraction
- Most accurate results

### Mode 2: URL-Based Inference (Fallback)
- URL cannot be downloaded (HTML page, access restrictions)
- AI infers university from URL
- Uses training data to provide estimates
- Less accurate but still useful

## Error Handling

### Common Errors and Solutions

1. **"list indices must be integers or slices, not str"**
   - Fixed: Added proper response parsing and type checking
   - Handles cases where response is a list instead of dict

2. **"Unterminated string" JSON errors**
   - Fixed: Added JSON repair function
   - Fixes common OCR issues (unclosed strings, trailing commas)

3. **"upload_file() got an unexpected keyword argument"**
   - Fixed: Uses correct parameter name (`path` instead of `path_or_bytes`)

4. **"Unknown field for FunctionDeclaration: google_search"**
   - Fixed: Removed invalid tool configuration
   - Uses model's built-in knowledge instead

## Performance Considerations

- **Concurrent Processing**: Up to 5 URLs processed simultaneously
- **Rate Limiting**: Semaphore prevents overwhelming the API
- **Database Optimization**: Uses joinedload to prevent N+1 queries
- **Background Processing**: Non-blocking job creation
- **Error Isolation**: One URL failure doesn't stop others

## Future Enhancements

Potential improvements:
- Retry mechanism for failed URLs
- Caching of previously analyzed URLs
- Webhook notifications for job completion
- Export functionality (CSV, Excel)
- Advanced filtering and search
- Analytics dashboard
- Rate limiting per user/IP
- Authentication and authorization

## Development

### Running Locally

```bash
# Start services
docker-compose up -d

# Run migrations
docker-compose exec api alembic upgrade head

# View logs
docker-compose logs -f api
```

### Creating Migrations

```bash
docker-compose exec api alembic revision --autogenerate -m "description"
docker-compose exec api alembic upgrade head
```

### Testing

Access API documentation at: `http://localhost:8000/docs`

## Project Structure

```
uniscan/
├── alembic/              # Database migrations
│   ├── env.py
│   └── versions/
├── models/               # SQLAlchemy models
│   ├── database.py
│   └── analysis.py
├── routers/              # API endpoints
│   ├── analyze.py
│   └── results.py
├── schemas/              # Pydantic schemas
│   └── analysis.py
├── services/             # Business logic
│   ├── gemini_service.py
│   └── processor.py
├── config.py             # Configuration
├── main.py               # FastAPI app
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── README.md
```

## License

MIT

