import os
import whisper
#from openai import OpenAI  # Uncomment when using GPT-4o
from app.core.config import settings

# ============================================================
# LOCAL WHISPER SETUP
# ============================================================
# Load a small Whisper model for fast dev/demo. Change to larger models for more accuracy.
whisper_model = whisper.load_model("large")  # options: tiny, base, small, medium, large

def transcribe_audio_local(file_path: str) -> dict:
    """
    Transcribes audio using local Whisper model.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Audio file not found: {file_path}")
    
    try:
        result = whisper_model.transcribe(file_path)
        
        print(f"Whisper transcription result: {result}")  # Debug log
        
        return {
            "text": result["text"],
            "language": result.get("language")
        }
        
        
        
    except Exception as e:
        raise RuntimeError(f"Whisper transcription failed: {str(e)}")


# ============================================================
# OPENAI GPT-4o SETUP (PRODUCTION)
# ============================================================
"""
def get_openai_client():
    api_key = settings.OPENAI_API_KEY
    if not api_key:
        raise ValueError("OPENAI_API_KEY not configured")
    return OpenAI(api_key=api_key)

def transcribe_audio_openai(file_path: str) -> dict:
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Audio file not found: {file_path}")
    
    client = get_openai_client()
    try:
        with open(file_path, "rb") as audio_file:
            transcription = client.audio.transcriptions.create(
                file=audio_file,
                model="gpt-4o-transcribe"
            )
        return {
            "text": transcription.text,
            "duration": getattr(transcription, "duration", None),
            "language": getattr(transcription, "language", None)
        }
    except Exception as e:
        raise RuntimeError(f"OpenAI transcription failed: {str(e)}")
"""

# ============================================================
# WRAPPER FUNCTION (USED BY ROUTER)
# ============================================================
def transcribe_audio_from_url(audio_path: str) -> dict:
    """
    Currently uses local Whisper for dev/demo.
    To use OpenAI GPT-4o, replace the return call with transcribe_audio_openai(audio_path)
    """
    return transcribe_audio_local(audio_path)
    # return transcribe_audio_openai(audio_path)  # Uncomment for production
