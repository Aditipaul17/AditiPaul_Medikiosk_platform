"""
MediKiosk Clinical Engine Module
Handles:
- SOCRATES Adaptive History Elicitation
- Red-Flag Triage & Emergency Detection
- AYUSH Dashavidha Pariksha Intake Parameters
- FHIR R4 Standard Formatting
"""

from typing import List, Dict, Any, Optional
import datetime

# Critical emergency symptoms database
RED_FLAG_PATTERNS = [
    {"symptoms": ["chest pain", "left arm pain", "sweating"], "condition": "Suspected Acute Coronary Syndrome (Heart Attack)"},
    {"symptoms": ["facial drooping", "slurred speech", "arm weakness"], "condition": "Suspected Acute Ischemic Stroke (FAST Protocol)"},
    {"symptoms": ["severe breathlessness", "cyanosis", "chest tightness"], "condition": "Severe Acute Respiratory Failure"},
    {"symptoms": ["sudden unconsciousness", "seizure"], "condition": "Neurological / Cardiac Emergency"}
]

# SOCRATES Framework Questions Database
SOCRATES_QUESTIONS = {
    "chest pain": [
        {"id": "site", "question": "Kahan dard ho raha hai? (Where exactly is the pain located?)", "type": "touch_or_voice"},
        {"id": "onset", "question": "Dard achanak shuru hua ya dheere-dheere? (Was the onset sudden or gradual?)", "options": ["Sudden (Achanak)", "Gradual (Dheere-dheere)"]},
        {"id": "character", "question": "Dard kaisa lag raha hai? (What is the nature of the pain?)", "options": ["Pressure/Heavy (Bhaari-pan)", "Sharp (Tez chubhan)", "Burning (Jalan)"]},
        {"id": "radiation", "question": "Kya dard gale, peeth ya baayein haath ki taraf ja raha hai? (Does pain radiate to neck, back, or left arm?)", "options": ["Yes (Haan - Left Arm/Neck)", "No (Nahi)"]},
        {"id": "associated", "question": "Sath mein paseena, chakkar ya saans phool rahi hai? (Associated sweating, dizziness, or breathlessness?)", "options": ["Sweating & Breathlessness", "Dizziness", "None"]},
        {"id": "severity", "question": "Dard kitna tez hai 1 se 10 ke scale par? (Rate pain severity 1 to 10)", "options": ["1-3 (Mild)", "4-6 (Moderate)", "7-10 (Severe)"]}
    ],
    "headache": [
        {"id": "site", "question": "Sar mein dard kahan hai? (Front, back, or one side?)", "options": ["One Side (Ek taraf)", "Both Sides (Dono taraf)", "Back of head (Peeche)"]},
        {"id": "character", "question": "Dard kaisa hai? (Throbbing, dull, or sharp?)", "options": ["Throbbing (Dhadkan jaisa)", "Dull ache", "Heavy pressure"]},
        {"id": "associated", "question": "Kya roshni se dikkat ya ulti aati hai? (Sensitivity to light or nausea?)", "options": ["Yes (Light sensitivity/Nausea)", "No"]}
    ],
    "fever": [
        {"id": "duration", "question": "Bukhar kitne din se hai? (How many days of fever?)", "options": ["1-2 Days", "3-5 Days", "> 1 Week"]},
        {"id": "associated", "question": "Sath mein thand/chills ya body ache hai? (Chills or body ache?)", "options": ["Chills (Thand lagna)", "Body Ache (Badan dard)", "Cough & Cold"]}
    ]
}

def check_red_flags(symptoms_text: str) -> Dict[str, Any]:
    """Scans free-form input for emergency red flags."""
    text_lower = symptoms_text.lower()
    for pattern in RED_FLAG_PATTERNS:
        match_count = sum(1 for sym in pattern["symptoms"] if sym in text_lower)
        if match_count >= 2 or ("chest pain" in text_lower and ("arm" in text_lower or "sweat" in text_lower)):
            return {
                "red_flag_triggered": True,
                "urgency": "CRITICAL_EMERGENCY",
                "condition": pattern["condition"],
                "action": "BYPASS_QUEUE_IMMEDIATE_TRIAGE",
                "message": "🚨 Critical Red Flag Detected! Immediate Triage Alert Sent to Medical Staff."
            }
    return {
        "red_flag_triggered": False,
        "urgency": "ROUTINE_OPD",
        "action": "PROCEED_TO_INTAKE"
    }

def get_adaptive_questions(chief_complaint: str) -> List[Dict[str, Any]]:
    """Returns SOCRATES structured questions based on chief complaint."""
    cc_lower = chief_complaint.lower()
    for key in SOCRATES_QUESTIONS:
        if key in cc_lower:
            return SOCRATES_QUESTIONS[key]
    # Default fallback clinical questions
    return [
        {"id": "duration", "question": "Yeh takleef kab se hai? (How long have you had this issue?)", "options": ["1-3 Days", "1 Week", "> 1 Month"]},
        {"id": "severity", "question": "Takleef kitni tez hai? (Rate severity)", "options": ["Mild", "Moderate", "Severe"]}
    ]

def generate_fhir_r4_resource(patient_id: str, history_data: Dict[str, Any]) -> Dict[str, Any]:
    """Converts structured intake data into ABDM-compliant FHIR R4 JSON standard."""
    return {
        "resourceType": "Bundle",
        "type": "document",
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "entry": [
            {
                "resourceType": "Patient",
                "id": patient_id,
                "identifier": [{"system": "https://healthid.ndhm.gov.in", "value": history_data.get("abha_id", "91-0000-0000-0000")}],
                "name": [{"text": history_data.get("name", "Rajesh Kumar")}],
                "gender": history_data.get("gender", "male"),
                "birthDate": "1972-05-14"
            },
            {
                "resourceType": "Condition",
                "clinicalStatus": {"coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-clinical", "code": "active"}]},
                "code": {"text": history_data.get("chief_complaint", "Chest Pain")},
                "onsetDateTime": history_data.get("onset", "2026-09-05")
            },
            {
                "resourceType": "Observation",
                "status": "final",
                "category": [{"coding": [{"system": "http://terminology.hl7.org/CodeSystem/observation-category", "code": "vital-signs"}]}],
                "code": {"text": "Heart Rate Variability & Pulse"},
                "valueQuantity": {"value": history_data.get("pulse_rate", 78), "unit": "bpm"}
            }
        ]
    }
