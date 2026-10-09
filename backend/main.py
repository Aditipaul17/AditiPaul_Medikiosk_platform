"""
MediKiosk FastAPI Application Server
SIH 2026 - Problem Statement SIH26047 (Ministry of AYUSH)
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import datetime
import uuid

from clinical_engine import check_red_flags, get_adaptive_questions, generate_fhir_r4_resource

app = FastAPI(
    title="MediKiosk API Server",
    description="AI-Powered Patient Case-Taking & Care Navigation Platform",
    version="1.0.0"
)

# Enable CORS for React Native / Web Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-Memory Database Store for Prototype Session
PATIENT_SESSIONS: Dict[str, Dict[str, Any]] = {}
DOCTOR_QUEUE: List[Dict[str, Any]] = []

# Data Models
class VoiceIntakeRequest(BaseModel):
    patient_name: str
    age: int
    gender: str
    language: str
    voice_text: str
    body_location: Optional[str] = "Left Chest"
    abha_id: Optional[str] = "91-8840-2910-4491"

class DoctorVerificationRequest(BaseModel):
    session_id: str
    doctor_id: str
    status: str  # "CONFIRMED" | "EDITED" | "REJECTED"
    edited_summary: str
    doctor_signature: str

class AppointmentBookingRequest(BaseModel):
    session_id: str
    hospital_id: str
    specialist_name: str
    department: str
    slot_time: str
    patient_consent: bool

@app.get("/")
def read_root():
    return {
        "system": "MediKiosk AI Core Server",
        "status": "ONLINE",
        "version": "1.0.0",
        "ministry": "Ministry of AYUSH (SIH 2026)",
        "timestamp": datetime.datetime.now().isoformat()
    }

@app.post("/api/intake/voice-parse")
def parse_voice_intake(request: VoiceIntakeRequest):
    """Processes patient spoken input, detects red flags, returns adaptive SOCRATES questions."""
    session_id = f"SES-{uuid.uuid4().hex[:8].upper()}"
    
    # Check for acute red flags
    red_flag_res = check_red_flags(request.voice_text)
    adaptive_qs = get_adaptive_questions(request.voice_text)
    
    session_data = {
        "session_id": session_id,
        "patient_name": request.patient_name,
        "age": request.age,
        "gender": request.gender,
        "language": request.language,
        "abha_id": request.abha_id,
        "chief_complaint": request.voice_text,
        "body_location": request.body_location,
        "red_flag": red_flag_res,
        "adaptive_questions": adaptive_qs,
        "created_at": datetime.datetime.now().isoformat()
    }
    
    PATIENT_SESSIONS[session_id] = session_data
    return {
        "success": True,
        "session_id": session_id,
        "red_flag_alert": red_flag_res,
        "adaptive_questions": adaptive_qs,
        "message": "Voice intake parsed successfully."
    }

@app.post("/api/ocr/scan-prescription")
async def scan_medical_document(session_id: str = Form(...), file: Optional[UploadFile] = File(None)):
    """Simulates Medical Document OCR & Entity Extraction with Confidence Scores."""
    if session_id not in PATIENT_SESSIONS:
        # Create a mock session if not exists
        session_id = f"SES-MOCK-101"
        PATIENT_SESSIONS[session_id] = {"patient_name": "Rajesh Kumar", "chief_complaint": "Chest Pain"}
    
    # High-accuracy Extracted Entities (Mocking Transformer OCR + Clinical NER Pipeline)
    extracted_data = {
        "document_type": "Printed Lab Report & Handwritten Prescription",
        "extracted_entities": {
            "diagnoses": ["Hypertension (Known 5 Yrs)", "Type 2 Diabetes Mellitus"],
            "medications": [
                {"name": "Amlodipine", "dosage": "5mg", "frequency": "OD (Once Daily)", "confidence": 0.96},
                {"name": "Metformin", "dosage": "500mg", "frequency": "BD (Twice Daily)", "confidence": 0.94},
                {"name": "Ecosprin", "dosage": "75mg", "frequency": "OD", "confidence": 0.78}  # Low confidence flag demo!
            ],
            "lab_values": [
                {"test": "BP", "value": "150/90 mmHg", "status": "HIGH ⬆️", "confidence": 0.98},
                {"test": "HbA1c", "value": "8.2%", "status": "ELEVATED ⬆️", "confidence": 0.97},
                {"test": "Creatinine", "value": "1.1 mg/dL", "status": "NORMAL", "confidence": 0.95}
            ]
        },
        "low_confidence_flags": [
            {"entity": "Ecosprin 75mg", "confidence": 0.78, "action": "Requires Doctor Physical Verification"}
        ]
    }
    
    PATIENT_SESSIONS[session_id]["ocr_extracted"] = extracted_data
    
    # Synthesize AI Clinical Summary
    ai_summary = f"""CHIEF COMPLAINT: {PATIENT_SESSIONS[session_id].get('chief_complaint', 'Chest Pain for 3 days')}
PAST MEDICAL HISTORY: Hypertension (5 yrs), Type 2 Diabetes Mellitus
CURRENT MEDICATIONS: Amlodipine 5mg OD, Metformin 500mg BD, Ecosprin 75mg OD (Flagged for Review)
FLAGGED LAB VALUES: BP 150/90 mmHg (Uncontrolled High), HbA1c 8.2% (Elevated)
AYUSH PARIKSHA PARAMETERS: Prakriti: Pitta-Kapha | Vikriti: Vata Dushti | Agni: Mandagni
AI SEVERITY SCORE: 4 / 5 (High Priority Queue)"""
    
    PATIENT_SESSIONS[session_id]["ai_summary"] = ai_summary
    
    # Push to Doctor Queue
    DOCTOR_QUEUE.append({
        "session_id": session_id,
        "patient_name": PATIENT_SESSIONS[session_id].get("patient_name", "Rajesh Kumar"),
        "age": PATIENT_SESSIONS[session_id].get("age", 52),
        "summary": ai_summary,
        "ocr_data": extracted_data,
        "status": "PENDING_VERIFICATION"
    })
    
    return {
        "success": True,
        "session_id": session_id,
        "ocr_result": extracted_data,
        "generated_clinical_summary": ai_summary
    }

@app.get("/api/doctor/queue")
def get_doctor_queue():
    """Returns Doctor Dashboard Queue with structured draft summaries."""
    return {
        "total_pending": len(DOCTOR_QUEUE),
        "queue": DOCTOR_QUEUE
    }

@app.post("/api/doctor/verify-summary")
def verify_doctor_summary(request: DoctorVerificationRequest):
    """Doctor Edits / Confirms summary with digital signature."""
    for item in DOCTOR_QUEUE:
        if item["session_id"] == request.session_id:
            item["status"] = request.status
            item["verified_summary"] = request.edited_summary
            item["doctor_signature"] = request.doctor_signature
            item["verified_at"] = datetime.datetime.now().isoformat()
            
            # Generate FHIR Resource
            fhir_bundle = generate_fhir_r4_resource(request.session_id, {
                "name": item["patient_name"],
                "chief_complaint": item.get("summary", ""),
                "pulse_rate": 84
            })
            item["fhir_bundle"] = fhir_bundle
            
            return {
                "success": True,
                "session_id": request.session_id,
                "status": request.status,
                "fhir_bundle": fhir_bundle,
                "message": "Summary verified by Doctor successfully. Linked to ABHA & FHIR R4 standard."
            }
    raise HTTPException(status_code=404, detail="Session not found in Doctor Queue.")

@app.get("/api/navigation/nearby-hospitals")
def get_nearby_hospitals(latitude: float = 19.0760, longitude: float = 72.8777):
    """Care Navigation & Geolocation Hospital/Specialist Discovery."""
    return {
        "user_location": {"lat": latitude, "lng": longitude},
        "nearby_hospitals": [
            {
                "hospital_id": "HOSP-01",
                "name": "AIIMS Ayushman Apex Hospital",
                "distance_km": 1.2,
                "specialty": "Cardiology & Internal Medicine",
                "available_doctors": [
                    {"name": "Dr. A. K. Sharma (MD, DM Cardiology)", "next_slot": "10:30 AM Today", "rating": 4.9},
                    {"name": "Dr. Sunita Verma (BAMS, MD AYUSH)", "next_slot": "11:15 AM Today", "rating": 4.8}
                ]
            },
            {
                "hospital_id": "HOSP-02",
                "name": "District Civil Hospital & AYUSH Center",
                "distance_km": 2.8,
                "specialty": "General OPD & Ayurvedic Care",
                "available_doctors": [
                    {"name": "Dr. R. N. Patil (MBBS)", "next_slot": "11:00 AM Today", "rating": 4.7}
                ]
            }
        ]
    }

@app.post("/api/navigation/book-appointment")
def book_appointment(request: AppointmentBookingRequest):
    """Books appointment and triggers DPDP explicit consent sharing."""
    if not request.patient_consent:
        raise HTTPException(status_code=400, detail="Explicit Patient Consent is required to share records.")
    
    booking_id = f"BK-{uuid.uuid4().hex[:6].upper()}"
    return {
        "success": True,
        "booking_id": booking_id,
        "hospital_id": request.hospital_id,
        "specialist": request.specialist_name,
        "slot_time": request.slot_time,
        "consent_status": "GRANTED_BY_PATIENT",
        "message": f"Appointment confirmed! Verified clinical summary securely transferred to {request.specialist_name}."
    }
