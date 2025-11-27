import json
from openai import OpenAI
from app.core.config import settings


def get_openai_client():
    api_key = settings.OPENAI_API_KEY
    if not api_key:
        raise ValueError("OPENAI_API_KEY is not configured")
    return OpenAI(api_key=api_key)


def generate_soap_note(transcription: str) -> dict:
    """
    SOAP Note generator using free-tier model.
    Strong JSON forcing + inference-friendly clinical logic.
    """

    client = get_openai_client()

    system_prompt = """
You are a clinical documentation AI. Convert patient conversation text
into a **complete SOAP note in VALID JSON format only**.

RULES:
- ALWAYS return valid JSON. No explanations, no extra text.
- The JSON MUST contain:
  {
    "subjective": "",
    "objective": "",
    "assessment": "",
    "plan": ""
  }

- SUBJECTIVE:
  Summarize patient complaints and history using clinical wording.

- OBJECTIVE:
  If the transcript has no vitals/exam findings, write:
  "No objective findings provided."

- ASSESSMENT:
  * Provide a reasonable clinical impression based on symptoms.
  * If patient says “fever for 3 days”, infer a likely diagnosis such as:
      - "Acute febrile illness"
      - "Likely viral fever"
  * Never leave blank.

- PLAN:
  * Provide general medical guidance based on symptoms.
  * May include tests, rest, hydration, give names of commonly available OTC medicines if appropriate.

STRICT RULE:
- The response MUST be only JSON and nothing else.
"""

    user_prompt = f"""
Create the SOAP note in JSON.

TRANSCRIPT:
{transcription}

Return ONLY JSON. No markdown. No comments.
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.2
    )

    raw = response.choices[0].message.content.strip()

    # Extra safety: ensure the string contains JSON only
    try:
        soap = json.loads(raw)
    except Exception:
        raise ValueError(f"AI returned invalid JSON:\n{raw}")

    # Ensure all fields exist
    return {
        "subjective": soap.get("subjective", "Missing"),
        "objective": soap.get("objective", "Missing"),
        "assessment": soap.get("assessment", "Missing"),
        "plan": soap.get("plan", "Missing"),
    }
