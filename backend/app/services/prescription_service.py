import json
from typing import Dict, Any, List, Optional
from openai import OpenAI
from app.core.config import settings


def get_openai_client():
    api_key = settings.OPENAI_API_KEY
    if not api_key:
        raise ValueError("OPENAI_API_KEY is not configured")
    return OpenAI(api_key=api_key)


def generate_prescription(
    soap_assessment: str,
    patient_info: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:

    client = get_openai_client()

    # Dummy patient info for demo mode
    if not patient_info:
        patient_info = {
            "name": "Demo Patient",
            "age": "N/A",
            "gender": "N/A",
            "medical_history": "Not available"
        }

    patient_context = f"""
Patient Information:
- Name: {patient_info.get("name")}
- Age: {patient_info.get("age")}
- Gender: {patient_info.get("gender")}
- Medical History: {patient_info.get("medical_history")}
"""

    system_prompt = """
You are an expert medical prescribing assistant.
Generate SAFE and BASIC clinical recommendations.

RULES:
- Only suggest common over-the-counter or standard medications.
- Never include antibiotics or controlled substances unless clearly justified.
- Keep doses standard.
- Keep explanations simple.
- If assessment is unclear, still provide general supportive care.

Return output EXACTLY in the following JSON format (IMPORTANT):

{
  "medications": [
    {
      "name": "",
      "dosage": "",
      "frequency": "",
      "duration": "",
      "instructions": ""
    }
  ],
  "advice": ["", ""],
  "follow_up": ""
}

Do NOT include extra text outside JSON.
"""

    user_prompt = f"""
SOAP ASSESSMENT:
{soap_assessment}

{patient_context}

Now generate the prescription JSON.
"""

    # ----------- FREE MODEL VERSION (SAFE FOR DEVELOPMENT) -----------
    response = client.chat.completions.create(
        model="gpt-4o-mini",     # FREE & SAFE
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.2
    )

    raw = response.choices[0].message.content.strip()

    # Try to extract JSON
    try:
        data = json.loads(raw)
    except Exception:
        # Fallback safety to prevent crashes
        data = {
            "medications": [],
            "advice": ["Rest, hydration, and monitor symptoms."],
            "follow_up": "Follow up in 3 days or if symptoms worsen."
        }

    medications = data.get("medications", [])
    advice = data.get("advice", [])
    follow_up = data.get("follow_up", "Follow up as needed.")

    prescription_text = format_prescription_text(medications, advice, follow_up)

    return {
        "medications": medications,
        "advice": advice,
        "prescription_text": prescription_text,
        "follow_up": follow_up,
    }


# -------------- OLD ADVANCED STRUCTURED OUTPUT (KEEP FOR LATER) --------------
"""
# Uncomment when switching to paid model:

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[...],
    response_format={
        "type": "json_schema",
        "json_schema": { ... }
    }
)
data = response.output_json
"""
# -----------------------------------------------------------------------------


def format_prescription_text(
    medications: List[Dict[str, str]],
    advice: List[str],
    follow_up: str
) -> str:

    lines = []
    lines.append("PRESCRIPTION")
    lines.append("=" * 40)
    lines.append("")

    # Medications Section
    lines.append("MEDICATIONS")
    lines.append("-" * 20)

    if not medications:
        lines.append("No medications recommended.\n")
    else:
        for idx, med in enumerate(medications, start=1):
            lines.append(f"{idx}. {med.get('name', 'Unknown')}")
            lines.append(f"   Dosage: {med.get('dosage', 'As directed')}")
            lines.append(f"   Frequency: {med.get('frequency', 'As directed')}")
            lines.append(f"   Duration: {med.get('duration', 'As directed')}")
            if med.get("instructions"):
                lines.append(f"   Instructions: {med['instructions']}")
            lines.append("")

    # Advice Section
    if advice:
        lines.append("ADVICE")
        lines.append("-" * 20)
        for item in advice:
            lines.append(f"• {item}")
        lines.append("")

    # Follow-up Section
    if follow_up:
        lines.append("FOLLOW-UP")
        lines.append("-" * 20)
        lines.append(follow_up)

    return "\n".join(lines)
