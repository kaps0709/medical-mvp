from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class VisitBase(BaseModel):
    patient_id: int
    transcription_text: Optional[str] = None
    soap_note: Optional[Dict[str, Any]] = None
    prescription_text: Optional[str] = None
    audio_file_url: Optional[str] = None
    doctor_notes: Optional[str] = None


class VisitCreate(BaseModel):
    patient_id: int
    doctor_notes: Optional[str] = None


class VisitUpdate(BaseModel):
    transcription_text: Optional[str] = None
    soap_note: Optional[Dict[str, Any]] = None
    prescription_text: Optional[str] = None
    audio_file_url: Optional[str] = None
    doctor_notes: Optional[str] = None


class VisitResponse(VisitBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
