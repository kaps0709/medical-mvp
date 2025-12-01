from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
import os
import uuid
from datetime import datetime
from app.db.database import get_db
from app.core.config import settings
from app.core.security import get_current_user

router = APIRouter()

ALLOWED_EXTENSIONS = {".wav", ".mp3", ".m4a", ".ogg", ".webm"}
MAX_FILE_SIZE = 50 * 1024 * 1024


@router.post("/upload")
async def upload_audio(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided"
        )
    
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE / (1024*1024)}MB"
        )
    
    unique_filename = f"{uuid.uuid4()}_{datetime.now().strftime('%Y%m%d_%H%M%S')}{file_ext}"
    file_path = os.path.join(settings.STORAGE_AUDIO_PATH, unique_filename)
    
    os.makedirs(settings.STORAGE_AUDIO_PATH, exist_ok=True)
    
    with open(file_path, "wb") as f:
        f.write(contents)
    
    file_url = f"/storage/audio/{unique_filename}"
    
    return {
        "message": "File uploaded successfully",
        "file_url": file_url,
        "file_path": file_path,
        "filename": unique_filename,
        "size": len(contents)
    }


@router.get("/files")
async def list_audio_files(
    current_user: dict = Depends(get_current_user)
):
    audio_path = settings.STORAGE_AUDIO_PATH
    
    if not os.path.exists(audio_path):
        return {"files": []}
    
    files = []
    for filename in os.listdir(audio_path):
        file_path = os.path.join(audio_path, filename)
        if os.path.isfile(file_path):
            files.append({
                "filename": filename,
                "file_url": f"/storage/audio/{filename}",
                "size": os.path.getsize(file_path)
            })
    
    return {"files": files}
