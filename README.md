# UniScan API

REST API for analyzing university admission circulars using Google Gemini AI. Extracts structured data from admission circular URLs and stores results in PostgreSQL.

## Features

- **Single or Bulk URL Processing**: Submit one or multiple URLs for analysis
- **Asynchronous Processing**: Non-blocking background job processing
- **PostgreSQL Database**: Stores all analysis results and job status
- **Docker Support**: Easy deployment with Docker Compose
- **FastAPI**: Modern, fast API with automatic OpenAPI documentation

## Prerequisites

- Docker and Docker Compose
- Google Gemini API Key

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd uniscan
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your `GEMINI_API_KEY`:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Start the services**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations**
   ```bash
   docker-compose exec api alembic upgrade head
   ```

5. **Access the API**
   - API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs
   - Health Check: http://localhost:8000/health

## API Endpoints

### POST /api/analyze
Create a new analysis job for one or more URLs.

**Request:**
```json
{
  "urls": ["https://example.com/admission-circular.pdf"]
}
```

or for bulk processing:
```json
{
  "urls": [
    "https://example.com/circular1.pdf",
    "https://example.com/circular2.pdf"
  ]
}
```

**Response:**
```json
{
  "job_id": "uuid",
  "status": "processing",
  "urls_count": 1,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### GET /api/analyze/{job_id}
Get the status and results of an analysis job.

**Response:**
```json
{
  "job_id": "uuid",
  "status": "completed",
  "urls_count": 1,
  "created_at": "2024-01-01T00:00:00Z",
  "completed_at": "2024-01-01T00:05:00Z",
  "results": [...],
  "errors": []
}
```

### GET /api/results/{result_id}
Get a specific analysis result by ID.

### GET /api/results
List all analysis results with pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20, max: 100)
- `status`: Filter by status (optional)

## Development

### Running Locally (without Docker)

1. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up PostgreSQL** (or use SQLite by modifying `config.py`)

3. **Set environment variables**
   ```bash
   export GEMINI_API_KEY=your_key
   export DATABASE_URL=postgresql://user:pass@localhost/uniscan
   ```

4. **Run migrations**
   ```bash
   alembic upgrade head
   ```

5. **Start the server**
   ```bash
   uvicorn main:app --reload
   ```

### Database Migrations

Create a new migration:
```bash
docker-compose exec api alembic revision --autogenerate -m "description"
```

Apply migrations:
```bash
docker-compose exec api alembic upgrade head
```

## Project Structure

```
uniscan/
├── alembic/              # Database migrations
├── models/               # SQLAlchemy models
│   ├── database.py      # Database setup
│   └── analysis.py      # Analysis models
├── routers/             # API routes
│   ├── analyze.py       # Analysis endpoints
│   └── results.py       # Result endpoints
├── schemas/             # Pydantic schemas
│   └── analysis.py      # Request/response models
├── services/            # Business logic
│   ├── gemini_service.py # Gemini AI integration
│   └── processor.py     # Background processing
├── config.py            # Configuration
├── main.py              # FastAPI application
├── Dockerfile           # Docker image
├── docker-compose.yml   # Docker Compose config
└── requirements.txt     # Python dependencies
```

## License

MIT
