import os
from openai import OpenAI
from app.core.config import settings


def get_openai_client():
    api_key = settings.OPENAI_API_KEY
    if not api_key:
        raise ValueError("OPENAI_API_KEY not configured")
    return OpenAI(api_key=api_key)


def transcribe_audio(file_path: str) -> dict:
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Audio file not found: {file_path}")
    
    client = get_openai_client()
    
    with open(file_path, "rb") as audio_file:
        transcription = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            response_format="verbose_json"
        )
    
    return {
        "transcription": transcription.text,
        "duration": getattr(transcription, 'duration', None),
        "language": getattr(transcription, 'language', None)
    }


def transcribe_audio_from_url(audio_url: str) -> dict:
    if audio_url.startswith("/storage/audio/"):
        filename = audio_url.replace("/storage/audio/", "")
        file_path = os.path.join(settings.STORAGE_AUDIO_PATH, filename)
    else:
        file_path = audio_url
    
    return transcribe_audio(file_path)
