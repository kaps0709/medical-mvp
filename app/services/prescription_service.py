import json
from typing import Dict, Any, List, Optional
from openai import OpenAI
from app.core.config import settings


def get_openai_client():
    api_key = settings.OPENAI_API_KEY
    if not api_key:
        raise ValueError("OPENAI_API_KEY not configured")
    return OpenAI(api_key=api_key)


def generate_prescription(
    soap_assessment: str,
    patient_info: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    client = get_openai_client()
    
    patient_context = ""
    if patient_info:
        patient_context = f"""
Patient Information:
- Name: {patient_info.get('name', 'Not provided')}
- Age: {patient_info.get('age', 'Not provided')}
- Gender: {patient_info.get('gender', 'Not provided')}
- Medical History: {patient_info.get('medical_history', 'Not provided')}
"""

    system_prompt = """You are an experienced medical professional assistant helping to generate prescription recommendations.

Based on the SOAP assessment provided, generate appropriate prescription recommendations including:
1. Medications with dosage, frequency, and duration
2. General health advice
3. Follow-up recommendations

IMPORTANT: These are recommendations only. The prescribing physician must review and approve all medications.

Provide the response in the following JSON format:
{
    "medications": [
        {
            "name": "Medication name",
            "dosage": "Dosage amount",
            "frequency": "How often to take",
            "duration": "Duration of treatment",
            "instructions": "Special instructions if any"
        }
    ],
    "advice": ["List of general health advice"],
    "follow_up": "Follow-up recommendation"
}"""

    user_prompt = f"""Based on the following medical assessment, generate prescription recommendations:

{patient_context}

SOAP ASSESSMENT:
{soap_assessment}

Please provide appropriate prescription recommendations in JSON format."""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.3,
        response_format={"type": "json_object"}
    )
    
    prescription_content = response.choices[0].message.content
    prescription_data = json.loads(prescription_content)
    
    medications = prescription_data.get("medications", [])
    advice = prescription_data.get("advice", [])
    follow_up = prescription_data.get("follow_up", "Follow up as needed")
    
    prescription_text = format_prescription_text(medications, advice, follow_up)
    
    return {
        "medications": medications,
        "advice": advice,
        "prescription_text": prescription_text,
        "follow_up": follow_up
    }


def format_prescription_text(
    medications: List[Dict[str, str]],
    advice: List[str],
    follow_up: str
) -> str:
    lines = ["PRESCRIPTION", "=" * 40, ""]
    
    lines.append("MEDICATIONS:")
    lines.append("-" * 20)
    for i, med in enumerate(medications, 1):
        lines.append(f"{i}. {med.get('name', 'Unknown')}")
        lines.append(f"   Dosage: {med.get('dosage', 'As directed')}")
        lines.append(f"   Frequency: {med.get('frequency', 'As directed')}")
        lines.append(f"   Duration: {med.get('duration', 'As directed')}")
        if med.get('instructions'):
            lines.append(f"   Instructions: {med['instructions']}")
        lines.append("")
    
    if advice:
        lines.append("ADVICE:")
        lines.append("-" * 20)
        for item in advice:
            lines.append(f"• {item}")
        lines.append("")
    
    if follow_up:
        lines.append("FOLLOW-UP:")
        lines.append("-" * 20)
        lines.append(follow_up)
    
    return "\n".join(lines)
