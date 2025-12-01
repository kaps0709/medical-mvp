from pydantic import BaseModel
from typing import Optional, Dict, Any, List


class TranscriptionRequest(BaseModel):
    audio_file_url: str


class TranscriptionResponse(BaseModel):
    transcription: str
    duration: Optional[float] = None


class SOAPNote(BaseModel):
    subjective: str
    objective: str
    assessment: str
    plan: str


class SOAPRequest(BaseModel):
    transcription: str


class SOAPResponse(BaseModel):
    soap_note: SOAPNote


class Medication(BaseModel):
    name: str
    dosage: str
    frequency: str
    duration: str
    instructions: Optional[str] = None


class PrescriptionRequest(BaseModel):
    patient_id: Optional [int] = None
    soap_assessment: str
    patient_info: Optional[Dict[str, Any]] = None


class PrescriptionResponse(BaseModel):
    medications: List[Medication]
    advice: List[str]
    prescription_text: str
    follow_up: Optional[str] = None
