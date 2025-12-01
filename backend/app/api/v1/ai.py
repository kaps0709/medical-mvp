from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
import uuid

from app.db.database import get_db
from app.models.visit import Visit
from app.models.patient import Patient
from app.schemas.ai import SOAPRequest, PrescriptionRequest, PrescriptionResponse
from app.services.transcription_service import transcribe_audio_from_url
from app.utils.logger import logger
from app.services.soap_service import generate_soap_note
from app.services.prescription_service import generate_prescription
from app.services.pdf_service import generate_prescription_pdf
from app.core.security import get_current_user
from app.core.config import settings

router = APIRouter()

# Directory for temporary audio uploads
AUDIO_UPLOAD_DIR = "tmp/audio"
os.makedirs(AUDIO_UPLOAD_DIR, exist_ok=True)


# ============================================================
#  TRANSCRIPTION ENDPOINT
# ============================================================
@router.post("/transcribe")
async def transcribe_audio_endpoint(
    audio: UploadFile = File(...),
    #current_user: dict = Depends(get_current_user)
):
    file_id = f"{uuid.uuid4()}.webm"
    file_path = os.path.join(AUDIO_UPLOAD_DIR, file_id)

    try:
        # Log request receipt for easier debugging and verification
        try:
            logger.info("POST /ai/transcribe called - filename=%s content_type=%s", audio.filename, getattr(audio, 'content_type', None))
        except Exception:
            # ensure logging never fails the endpoint
            logger.info("POST /ai/transcribe called")
        # Save uploaded audio to temporary directory
        with open(file_path, "wb") as f:
            f.write(await audio.read())

        # Perform transcription
        result = transcribe_audio_from_url(file_path)
        logger.info("Transcription finished for %s, result keys=%s", file_id, list(result.keys()) if isinstance(result, dict) else type(result))

        # Ensure consistent key for frontend
        return {
            "transcription": result.get("text", result.get("transcription", "")),
            "duration": result.get("duration"),
            "language": result.get("language")
        }

    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.exception("Error during /ai/transcribe: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transcription failed: {str(e)}"
        )
    finally:
        # Delete temporary audio file
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
                logger.info("Temporary audio file removed: %s", file_path)
            except Exception:
                pass  # silently ignore cleanup errors



# ============================================================
#  SOAP GENERATION ENDPOINT
# ============================================================
@router.post("/soap")
async def generate_soap_endpoint(
    request: SOAPRequest,
    #current_user: dict = Depends(get_current_user)
):
    try:
        soap_data = generate_soap_note(request.transcription)
        
        print("Generated SOAP data:", soap_data)

        return {
            "subjective": soap_data.get("subjective", ""),
            "objective": soap_data.get("objective", ""),
            "assessment": soap_data.get("assessment", ""),
            "plan": soap_data.get("plan", "")
        }

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"SOAP generation failed: {str(e)}"
        )


# ============================================================
#  PRESCRIPTION GENERATION ENDPOINT
# ============================================================
@router.post("/prescription1", response_model=PrescriptionResponse)
async def generate_prescription_endpoint(
    request: PrescriptionRequest,
    #db: Session = Depends(get_db),
    #current_user: dict = Depends(get_current_user)
):
    patient = db.query(Patient).filter(Patient.id == request.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    patient_info = {
        "name": patient.name,
        "age": patient.age,
        "gender": patient.gender,
        "medical_history": patient.medical_history
    }
    
    if request.patient_info:
        patient_info.update(request.patient_info)
    
    try:
        result = generate_prescription(
            soap_assessment=request.soap_assessment,
            patient_info=patient_info
        )
        
        medications = []
        for med in result.get("medications", []):
            medications.append({
                "name": med.get("name", ""),
                "dosage": med.get("dosage", ""),
                "frequency": med.get("frequency", ""),
                "duration": med.get("duration", ""),
                "instructions": med.get("instructions")
            })
        
        return PrescriptionResponse(
            medications=medications,
            advice=result.get("advice", []),
            prescription_text=result.get("prescription_text", ""),
            follow_up=result.get("follow_up")
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prescription generation failed: {str(e)}"
        )
        
        
@router.post("/prescription", response_model=PrescriptionResponse)
async def generate_prescription_endpoint(
    request: PrescriptionRequest,
):
    """
    Simplified demo version.
    - No database required
    - No authentication required
    - Dummy patient info is used
    """

    # Dummy patient profile for demo
    patient_info = {
        "name": "Demo Patient",
        "age": 30,
        "gender": "Male",
        "medical_history": "No significant medical history"
    }

    # Allow overriding patient info if provided
    if request.patient_info:
        patient_info.update(request.patient_info)

    try:
        # Generate AI prescription
        result = generate_prescription(
            soap_assessment=request.soap_assessment,
            patient_info=patient_info
        )

        medications = []
        for med in result.get("medications", []):
            medications.append({
                "name": med.get("name", ""),
                "dosage": med.get("dosage", ""),
                "frequency": med.get("frequency", ""),
                "duration": med.get("duration", ""),
                "instructions": med.get("instructions", "")
            })

        return PrescriptionResponse(
            medications=medications,
            advice=result.get("advice", []),
            prescription_text=result.get("prescription_text", ""),
            follow_up=result.get("follow_up")
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prescription generation failed: {str(e)}"
        )



# ============================================================
#  PRESCRIPTION PDF ENDPOINT
# ============================================================
@router.get("/prescription/{visit_id}/pdf")
async def get_prescription_pdf(
    visit_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    visit = db.query(Visit).filter(Visit.id == visit_id).first()
    if not visit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visit not found"
        )
    
    patient = db.query(Patient).filter(Patient.id == visit.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    patient_info = {
        "name": patient.name,
        "age": patient.age,
        "gender": patient.gender,
        "phone": patient.phone
    }
    
    prescription_data = {
        "medications": [],
        "advice": [],
        "follow_up": None
    }
    
    if visit.soap_note:
        soap = visit.soap_note
        if isinstance(soap, dict):
            prescription_data["assessment"] = soap.get("assessment", "")
            prescription_data["plan"] = soap.get("plan", "")
    
    if visit.prescription_text:
        prescription_data["prescription_text"] = visit.prescription_text
    
    doctor_info = {
        "username": current_user.get("username", "Doctor"),
        "full_name": current_user.get("full_name", current_user.get("username", "Doctor"))
    }
    
    try:
        pdf_path = generate_prescription_pdf(
            visit_id=visit_id,
            patient_info=patient_info,
            prescription_data=prescription_data,
            doctor_info=doctor_info
        )
        
        return FileResponse(
            path=pdf_path,
            filename=f"prescription_{visit_id}.pdf",
            media_type="application/pdf"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"PDF generation failed: {str(e)}"
        )
