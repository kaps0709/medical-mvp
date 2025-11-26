# AI Medical Scribe

## Overview
A production-ready FastAPI backend for an AI-powered medical scribe application. The system handles audio uploads, AI-powered transcription using OpenAI Whisper, AI-generated medical SOAP notes, prescription generation, patient management, and PDF export.

## Tech Stack
- **Backend**: Python 3.11, FastAPI, Uvicorn
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Migrations**: Alembic
- **Authentication**: JWT (PyJWT, python-jose)
- **AI Services**: OpenAI (Whisper for transcription, GPT-4 for SOAP/prescriptions)
- **PDF Generation**: ReportLab

## Project Structure
```
├── app/
│   ├── api/v1/          # API routes (auth, patients, visits, audio, ai)
│   ├── core/            # Configuration and security
│   ├── db/              # Database connection
│   ├── models/          # SQLAlchemy models (User, Patient, Visit)
│   ├── schemas/         # Pydantic validation schemas
│   ├── services/        # Business logic (transcription, SOAP, prescription, PDF)
│   └── utils/           # Utilities (logging)
├── alembic/             # Database migrations
├── storage/
│   ├── audio/           # Uploaded audio files
│   └── prescriptions/   # Generated PDF prescriptions
└── main.py              # Application entry point
```

## API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /register` - Register new user (doctor/receptionist/admin)
- `POST /login` - Login and get JWT token
- `GET /me` - Get current user info

### Patients (`/api/v1/patients`)
- `GET /` - List patients (with search)
- `POST /` - Create patient
- `GET /{id}` - Get patient details
- `PUT /{id}` - Update patient
- `DELETE /{id}` - Delete patient
- `GET /{id}/visits` - Get patient's visits

### Visits (`/api/v1/visits`)
- `GET /` - List visits
- `POST /` - Create visit
- `GET /{id}` - Get visit details
- `PUT /{id}` - Update visit
- `DELETE /{id}` - Delete visit

### Audio (`/api/v1/audio`)
- `POST /upload` - Upload audio file (WAV/MP3/M4A/OGG/WebM)
- `GET /files` - List uploaded files

### AI Services (`/api/v1/ai`)
- `POST /transcribe` - Transcribe audio to text using OpenAI Whisper
- `POST /soap` - Generate SOAP note from transcription using GPT-4
- `POST /prescription` - Generate prescription from assessment
- `GET /prescription/{visit_id}/pdf` - Download prescription PDF

## Environment Variables

### Required
- `DATABASE_URL` - PostgreSQL connection string (auto-configured on Replit)
- `SESSION_SECRET` - JWT secret key (auto-configured on Replit)

### Optional
- `OPENAI_API_KEY` - OpenAI API key for AI features (transcription, SOAP notes, prescriptions)
- `CORS_ORIGINS` - Comma-separated list of allowed origins (default: `*`)
  - Example: `https://example.com,https://app.example.com`
  - When set to `*`, credentials are disabled for security

## Running the Application
```bash
# Start the server
uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload

# Run migrations
alembic upgrade head

# Create new migration
alembic revision --autogenerate -m "description"
```

## API Documentation
- Swagger UI: `/docs`
- ReDoc: `/redoc`

## User Roles
- **doctor** - Full access to all features
- **receptionist** - Patient management, visit scheduling
- **admin** - System administration

## Recent Changes
- Initial project setup with complete FastAPI architecture
- JWT authentication with role-based access (doctor, receptionist, admin)
- Patient and visit CRUD operations with search functionality
- Audio upload with file storage (WAV, MP3, M4A, OGG, WebM support)
- OpenAI Whisper integration for audio transcription
- GPT-4 powered SOAP note generation with structured output
- Prescription generation with medication suggestions and advice
- PDF prescription export with professional medical template
- CORS configuration with proper wildcard/credentials handling
- Startup validation for required environment variables
