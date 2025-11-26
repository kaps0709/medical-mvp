from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.schemas.patient import PatientCreate, PatientUpdate, PatientResponse
from app.schemas.visit import VisitCreate, VisitUpdate, VisitResponse
from app.schemas.ai import TranscriptionRequest, TranscriptionResponse, SOAPRequest, SOAPResponse, PrescriptionRequest, PrescriptionResponse

__all__ = [
    "UserCreate", "UserLogin", "UserResponse", "Token",
    "PatientCreate", "PatientUpdate", "PatientResponse",
    "VisitCreate", "VisitUpdate", "VisitResponse",
    "TranscriptionRequest", "TranscriptionResponse", 
    "SOAPRequest", "SOAPResponse",
    "PrescriptionRequest", "PrescriptionResponse"
]
