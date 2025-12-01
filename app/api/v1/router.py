from fastapi import APIRouter
from app.api.v1 import auth, patients, visits, audio, ai

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(patients.router, prefix="/patients", tags=["Patients"])
api_router.include_router(visits.router, prefix="/visits", tags=["Visits"])
api_router.include_router(audio.router, prefix="/audio", tags=["Audio"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI Services"])
