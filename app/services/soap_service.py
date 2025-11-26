import json
from openai import OpenAI
from app.core.config import settings


def get_openai_client():
    api_key = settings.OPENAI_API_KEY
    if not api_key:
        raise ValueError("OPENAI_API_KEY not configured")
    return OpenAI(api_key=api_key)


def generate_soap_note(transcription: str) -> dict:
    client = get_openai_client()
    
    system_prompt = """You are an experienced medical professional assistant. 
Your task is to convert a doctor-patient conversation transcript into a structured SOAP note.

SOAP Note Format:
- Subjective: Patient's complaints, symptoms, history as reported by the patient
- Objective: Observable, measurable findings (vital signs, physical exam findings mentioned)
- Assessment: Medical assessment, diagnosis, or differential diagnoses
- Plan: Treatment plan, medications, follow-up recommendations

Provide the response in the following JSON format:
{
    "subjective": "Patient's subjective complaints and history",
    "objective": "Objective findings from examination",
    "assessment": "Medical assessment and diagnosis",
    "plan": "Treatment plan and recommendations"
}

If certain sections cannot be determined from the transcript, provide reasonable placeholders indicating what information would typically be needed."""

    user_prompt = f"""Please convert the following medical consultation transcript into a SOAP note:

TRANSCRIPT:
{transcription}

Provide the SOAP note in JSON format."""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.3,
        response_format={"type": "json_object"}
    )
    
    soap_content = response.choices[0].message.content
    soap_note = json.loads(soap_content)
    
    required_fields = ["subjective", "objective", "assessment", "plan"]
    for field in required_fields:
        if field not in soap_note:
            soap_note[field] = "Not determined from transcript"
    
    return {
        "subjective": soap_note.get("subjective", ""),
        "objective": soap_note.get("objective", ""),
        "assessment": soap_note.get("assessment", ""),
        "plan": soap_note.get("plan", "")
    }
