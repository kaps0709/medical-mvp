from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import time
import os
from app.api.v1.router import api_router
from app.core.config import settings
from app.db.database import engine, Base
from app.utils.logger import logger

os.makedirs("storage/audio", exist_ok=True)
os.makedirs("storage/prescriptions", exist_ok=True)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered Medical Scribe API for audio transcription, SOAP notes, and prescription generation",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    logger.info(
        f"{request.method} {request.url.path} - {response.status_code} - {process_time:.3f}s"
    )
    
    response.headers["X-Process-Time"] = str(process_time)
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )


app.include_router(api_router, prefix="/api/v1")

app.mount("/storage", StaticFiles(directory="storage"), name="storage")


@app.get("/")
async def root():
    return {
        "message": "Welcome to AI Medical Scribe API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": settings.APP_VERSION
    }


def init_db():
    from app.models import User, Patient, Visit
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created")


@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    init_db()
    logger.info("Application startup complete")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Application shutdown")
