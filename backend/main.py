"""
MediKiosk FastAPI Application Server
Ministry of AYUSH AI Case-Taking & Care Navigation Platform
Integrated with Relational DBMS (SQLAlchemy/SQLite/PostgreSQL) and FHIR R4 Document Store
"""

import os
import datetime
import uuid
from typing import List, Dict, Any, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from database import engine, get_db, mongo_db
from db_init import init_db
from models import (
    Doctor,
    Patient,
    IntakeSession,
    DoctorVerification,
    FhirBundleRecord,
    Appointment,
    AuditLog
)
from clinical_engine import check_red_flags, get_adaptive_questions, generate_fhir_r4_resource

# ---------------------------------------------------------------------------
# Lifespan Context for Database Initialization
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables and seed default data
    init_db()
    yield

app = FastAPI(
    title="MediKiosk AI Core & Clinical DBMS Server",
    description="Relational Patient EHR, ABDM FHIR R4 Document Repository & AYUSH Care Navigation API",
    version="2.0.0",
    lifespan=lifespan
)

# Enable CORS for React / Next.js Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Pydantic Request & Response Schemas
# ---------------------------------------------------------------------------
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

class DoctorCreateRequest(BaseModel):
    license_number: str
    name: str
    specialization: str
    department: str
    hospital: Optional[str] = "City Care Hospital"
    status: Optional[str] = "Active"
    pin: Optional[str] = "1234"
    email: Optional[str] = None
    phone: Optional[str] = None

class DoctorStatusUpdateRequest(BaseModel):
    status: str  # "Active" | "Pending"

# ---------------------------------------------------------------------------
# Health & Status Endpoint
# ---------------------------------------------------------------------------
@app.get("/")
def read_root(db: Session = Depends(get_db)):
    db_type = "PostgreSQL" if "postgresql" in str(engine.url) else "SQLite"
    return {
        "system": "MediKiosk AI Core Server & Clinical DBMS",
        "status": "ONLINE",
        "version": "2.0.0",
        "ministry": "Ministry of AYUSH (Government of India)",
        "database": {
            "type": db_type,
            "status": "CONNECTED",
            "mongodb_connected": mongo_db is not None
        },
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

# ---------------------------------------------------------------------------
# Patient Intake & Triage Endpoints
# ---------------------------------------------------------------------------
@app.post("/api/intake/voice-parse")
def parse_voice_intake(request: VoiceIntakeRequest, db: Session = Depends(get_db)):
    """Processes patient spoken input, detects red flags, returns adaptive SOCRATES questions, and persists session to DBMS."""
    session_id = f"SES-{uuid.uuid4().hex[:8].upper()}"
    
    # 1. Run AI Clinical Logic
    red_flag_res = check_red_flags(request.voice_text)
    adaptive_qs = get_adaptive_questions(request.voice_text)

    # 2. Get or create Patient record in relational DB
    patient = None
    if request.abha_id:
        patient = db.query(Patient).filter(Patient.abha_id == request.abha_id).first()
    
    if not patient:
        patient = Patient(
            abha_id=request.abha_id or f"91-{uuid.uuid4().hex[:4]}-{uuid.uuid4().hex[:4]}-4491",
            name=request.patient_name,
            age=request.age,
            gender=request.gender
        )
        db.add(patient)
        db.flush()

    # 3. Create IntakeSession in DBMS
    intake_session = IntakeSession(
        session_id=session_id,
        patient_id=patient.id,
        patient_name=request.patient_name,
        age=request.age,
        gender=request.gender,
        abha_id=patient.abha_id,
        language=request.language,
        body_location=request.body_location or "General",
        chief_complaint=request.voice_text,
        red_flag=red_flag_res,
        adaptive_questions=adaptive_qs,
        status="PENDING_VERIFICATION"
    )
    db.add(intake_session)

    # 4. DPDP Act Audit Log Entry
    audit_entry = AuditLog(
        event_type="PATIENT_INTAKE",
        actor_id=patient.abha_id,
        actor_role="PATIENT",
        description=f"Patient intake completed for {request.patient_name}. Emergency red flag: {red_flag_res.get('red_flag_triggered')}",
        details={"session_id": session_id, "red_flag": red_flag_res}
    )
    db.add(audit_entry)
    db.commit()

    return {
        "success": True,
        "session_id": session_id,
        "red_flag_alert": red_flag_res,
        "adaptive_questions": adaptive_qs,
        "message": "Voice intake parsed and saved to database successfully."
    }

# ---------------------------------------------------------------------------
# OCR & Medical Document Processing
# ---------------------------------------------------------------------------
@app.post("/api/ocr/scan-prescription")
async def scan_medical_document(
    session_id: str = Form(...),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """Simulates Medical Document OCR & Entity Extraction with Confidence Scores, persisting to DBMS."""
    session = db.query(IntakeSession).filter(IntakeSession.session_id == session_id).first()
    if not session:
        # Create a session if not found
        session = IntakeSession(
            session_id=session_id,
            patient_name="Rajesh Kumar",
            age=52,
            gender="Male",
            abha_id="91-8840-2910-4491",
            chief_complaint="Chest Pain & Jalan",
            status="PENDING_VERIFICATION"
        )
        db.add(session)
        db.flush()

    extracted_data = {
        "document_type": "Printed Lab Report & Handwritten Prescription",
        "extracted_entities": {
            "diagnoses": ["Hypertension (Known 5 Yrs)", "Type 2 Diabetes Mellitus"],
            "medications": [
                {"name": "Amlodipine", "dosage": "5mg", "frequency": "OD (Once Daily)", "confidence": 0.96},
                {"name": "Metformin", "dosage": "500mg", "frequency": "BD (Twice Daily)", "confidence": 0.94},
                {"name": "Ecosprin", "dosage": "75mg", "frequency": "OD", "confidence": 0.78}
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

    ai_summary = f"""CHIEF COMPLAINT: {session.chief_complaint or 'Chest Pain for 3 days'}
PAST MEDICAL HISTORY: Hypertension (5 yrs), Type 2 Diabetes Mellitus
CURRENT MEDICATIONS: Amlodipine 5mg OD, Metformin 500mg BD, Ecosprin 75mg OD (Flagged for Review)
FLAGGED LAB VALUES: BP 150/90 mmHg (Uncontrolled High), HbA1c 8.2% (Elevated)
AYUSH PARIKSHA PARAMETERS: Prakriti: Pitta-Kapha | Vikriti: Vata Dushti | Agni: Mandagni
AI SEVERITY SCORE: 4 / 5 (High Priority Queue)"""

    session.ocr_extracted = extracted_data
    session.ai_summary = ai_summary
    session.status = "PENDING_VERIFICATION"

    audit_entry = AuditLog(
        event_type="OCR_PRESCRIPTION_SCANNED",
        actor_id=session.abha_id or "ANON",
        actor_role="PATIENT",
        description=f"Prescription OCR processed for session {session_id}.",
        details={"low_confidence_count": len(extracted_data["low_confidence_flags"])}
    )
    db.add(audit_entry)
    db.commit()

    return {
        "success": True,
        "session_id": session_id,
        "ocr_result": extracted_data,
        "generated_clinical_summary": ai_summary
    }

# ---------------------------------------------------------------------------
# Doctor OPD Verification Queue
# ---------------------------------------------------------------------------
@app.get("/api/doctor/queue")
def get_doctor_queue(db: Session = Depends(get_db)):
    """Returns Doctor Verification OPD Queue from relational database."""
    sessions = db.query(IntakeSession).order_by(desc(IntakeSession.created_at)).all()
    queue = []
    for s in sessions:
        queue.append({
            "session_id": s.session_id,
            "patient_name": s.patient_name,
            "age": s.age,
            "summary": s.ai_summary or s.chief_complaint,
            "ocr_data": s.ocr_extracted,
            "status": s.status,
            "created_at": s.created_at.isoformat() if s.created_at else None
        })

    return {
        "total_pending": len([q for q in queue if q["status"] == "PENDING_VERIFICATION"]),
        "queue": queue
    }

@app.post("/api/doctor/verify-summary")
def verify_doctor_summary(request: DoctorVerificationRequest, db: Session = Depends(get_db)):
    """Doctor verifies summary with digital signature, generating ABDM FHIR R4 document bundle."""
    session = db.query(IntakeSession).filter(IntakeSession.session_id == request.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found in Doctor Queue.")

    session.status = request.status

    # Record Doctor Verification
    verification = db.query(DoctorVerification).filter(DoctorVerification.session_id == request.session_id).first()
    if not verification:
        verification = DoctorVerification(
            session_id=request.session_id,
            doctor_id=request.doctor_id,
            status=request.status,
            verified_summary=request.edited_summary,
            doctor_signature=request.doctor_signature
        )
        db.add(verification)
    else:
        verification.status = request.status
        verification.verified_summary = request.edited_summary
        verification.doctor_signature = request.doctor_signature

    # Generate ABDM FHIR R4 Bundle
    fhir_bundle = generate_fhir_r4_resource(request.session_id, {
        "name": session.patient_name,
        "abha_id": session.abha_id,
        "gender": session.gender,
        "chief_complaint": request.edited_summary or session.chief_complaint,
        "pulse_rate": 84
    })

    # Save FHIR R4 Bundle in Relational JSON / Document Store
    bundle_id = f"BUNDLE-{request.session_id}"
    fhir_rec = db.query(FhirBundleRecord).filter(FhirBundleRecord.bundle_id == bundle_id).first()
    if not fhir_rec:
        fhir_rec = FhirBundleRecord(
            bundle_id=bundle_id,
            session_id=request.session_id,
            abha_id=session.abha_id,
            resource_type="Bundle",
            fhir_json=fhir_bundle
        )
        db.add(fhir_rec)
    else:
        fhir_rec.fhir_json = fhir_bundle

    # Optional: Persist to MongoDB if connected
    if mongo_db is not None:
        try:
            mongo_db["fhir_bundles"].update_one(
                {"bundle_id": bundle_id},
                {"$set": {"fhir_bundle": fhir_bundle, "updated_at": datetime.datetime.now(datetime.timezone.utc)}},
                upsert=True
            )
        except Exception as e:
            pass

    # DPDP Audit Log
    audit_entry = AuditLog(
        event_type="DOCTOR_VERIFIED_SUMMARY",
        actor_id=request.doctor_id,
        actor_role="DOCTOR",
        description=f"Doctor {request.doctor_id} finalized summary for session {request.session_id}. Status: {request.status}",
        details={"session_id": request.session_id, "signature": request.doctor_signature}
    )
    db.add(audit_entry)
    db.commit()

    return {
        "success": True,
        "session_id": request.session_id,
        "status": request.status,
        "fhir_bundle": fhir_bundle,
        "message": "Summary verified and committed to Relational DBMS & FHIR R4 Store successfully."
    }

# ---------------------------------------------------------------------------
# Care Navigation & Appointment Booking
# ---------------------------------------------------------------------------
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
def book_appointment(request: AppointmentBookingRequest, db: Session = Depends(get_db)):
    """Books appointment and triggers DPDP explicit consent sharing in relational DB."""
    if not request.patient_consent:
        raise HTTPException(status_code=400, detail="Explicit Patient Consent is required under DPDP Act 2023.")
    
    booking_id = f"BK-{uuid.uuid4().hex[:6].upper()}"

    appointment = Appointment(
        booking_id=booking_id,
        session_id=request.session_id,
        hospital_id=request.hospital_id,
        specialist_name=request.specialist_name,
        department=request.department,
        slot_time=request.slot_time,
        patient_consent=request.patient_consent
    )
    db.add(appointment)

    # DPDP Audit Log
    audit_entry = AuditLog(
        event_type="CONSENT_AND_APPOINTMENT_BOOKED",
        actor_id=request.session_id,
        actor_role="PATIENT",
        description=f"Appointment {booking_id} confirmed with {request.specialist_name} under explicit patient consent.",
        details={"hospital_id": request.hospital_id, "slot_time": request.slot_time}
    )
    db.add(audit_entry)
    db.commit()

    return {
        "success": True,
        "booking_id": booking_id,
        "hospital_id": request.hospital_id,
        "specialist": request.specialist_name,
        "slot_time": request.slot_time,
        "consent_status": "GRANTED_BY_PATIENT",
        "message": f"Appointment confirmed in DBMS! Verified clinical summary securely transferred to {request.specialist_name}."
    }

# ---------------------------------------------------------------------------
# Admin Portal & Doctor Credential Management (Relational DBMS)
# ---------------------------------------------------------------------------
@app.get("/api/admin/doctors")
def get_all_doctors(db: Session = Depends(get_db)):
    """Returns list of registered doctors from the relational DBMS."""
    doctors = db.query(Doctor).order_by(Doctor.name).all()
    return [
        {
            "licenseNumber": d.license_number,
            "name": d.name,
            "specialization": d.specialization,
            "department": d.department,
            "hospital": d.hospital,
            "status": d.status,
            "email": d.email,
            "phone": d.phone
        }
        for d in doctors
    ]

@app.post("/api/admin/doctors", status_code=status.HTTP_201_CREATED)
def add_doctor(doctor_in: DoctorCreateRequest, db: Session = Depends(get_db)):
    """Registers a new doctor into the hospital relational database."""
    existing = db.query(Doctor).filter(Doctor.license_number == doctor_in.license_number).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Doctor with License Number '{doctor_in.license_number}' already exists."
        )

    new_doc = Doctor(
        license_number=doctor_in.license_number,
        name=doctor_in.name,
        specialization=doctor_in.specialization,
        department=doctor_in.department,
        hospital=doctor_in.hospital or "City Care Hospital",
        status=doctor_in.status or "Active",
        pin=doctor_in.pin or "1234",
        email=doctor_in.email,
        phone=doctor_in.phone
    )
    db.add(new_doc)

    audit_entry = AuditLog(
        event_type="ADMIN_DOCTOR_ADDED",
        actor_id="ADMIN",
        actor_role="ADMIN",
        description=f"New doctor registered: {doctor_in.name} ({doctor_in.license_number})",
        details=doctor_in.model_dump()
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(new_doc)

    return {
        "success": True,
        "doctor": {
            "licenseNumber": new_doc.license_number,
            "name": new_doc.name,
            "specialization": new_doc.specialization,
            "department": new_doc.department,
            "hospital": new_doc.hospital,
            "status": new_doc.status
        },
        "message": "Doctor credential registered in database successfully."
    }

@app.patch("/api/admin/doctors/{license_number}/status")
def update_doctor_status(license_number: str, payload: DoctorStatusUpdateRequest, db: Session = Depends(get_db)):
    """Toggles doctor Active/Pending status in DBMS."""
    doctor = db.query(Doctor).filter(Doctor.license_number == license_number).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found.")

    doctor.status = payload.status

    audit_entry = AuditLog(
        event_type="ADMIN_DOCTOR_STATUS_CHANGED",
        actor_id="ADMIN",
        actor_role="ADMIN",
        description=f"Doctor {doctor.name} ({license_number}) status updated to {payload.status}.",
        details={"license_number": license_number, "new_status": payload.status}
    )
    db.add(audit_entry)
    db.commit()

    return {
        "success": True,
        "licenseNumber": license_number,
        "new_status": doctor.status,
        "message": f"Status updated to {doctor.status} in DBMS."
    }

@app.delete("/api/admin/doctors/{license_number}")
def delete_doctor(license_number: str, db: Session = Depends(get_db)):
    """Deletes a doctor credential from relational DBMS."""
    doctor = db.query(Doctor).filter(Doctor.license_number == license_number).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found.")

    doctor_name = doctor.name
    db.delete(doctor)

    audit_entry = AuditLog(
        event_type="ADMIN_DOCTOR_DELETED",
        actor_id="ADMIN",
        actor_role="ADMIN",
        description=f"Doctor removed: {doctor_name} ({license_number})",
        details={"license_number": license_number}
    )
    db.add(audit_entry)
    db.commit()

    return {
        "success": True,
        "message": f"Doctor {doctor_name} removed from database."
    }

@app.get("/api/admin/stats")
def get_system_stats(db: Session = Depends(get_db)):
    """Returns aggregated real-time database statistics."""
    total_doctors = db.query(Doctor).count()
    active_doctors = db.query(Doctor).filter(Doctor.status == "Active").count()
    pending_doctors = db.query(Doctor).filter(Doctor.status == "Pending").count()
    total_patients = db.query(Patient).count()
    total_sessions = db.query(IntakeSession).count()
    pending_queue = db.query(IntakeSession).filter(IntakeSession.status == "PENDING_VERIFICATION").count()
    verified_sessions = db.query(IntakeSession).filter(IntakeSession.status.in_(["CONFIRMED", "EDITED"])).count()
    total_bundles = db.query(FhirBundleRecord).count()
    total_appointments = db.query(Appointment).count()
    total_audit_logs = db.query(AuditLog).count()

    return {
        "doctors": {
            "total": total_doctors,
            "active": active_doctors,
            "pending": pending_doctors
        },
        "intake": {
            "total_patients": total_patients,
            "total_sessions": total_sessions,
            "pending_verification": pending_queue,
            "verified_cases": verified_sessions
        },
        "fhir_r4": {
            "total_document_bundles": total_bundles
        },
        "appointments": {
            "total_booked": total_appointments
        },
        "compliance": {
            "dpdp_audit_log_entries": total_audit_logs
        }
    }

@app.get("/api/admin/audit-logs")
def get_audit_logs(limit: int = 50, db: Session = Depends(get_db)):
    """Returns DPDP Act 2023 compliance audit trail from DBMS."""
    logs = db.query(AuditLog).order_by(desc(AuditLog.timestamp)).limit(limit).all()
    return [
        {
            "id": log.id,
            "event_type": log.event_type,
            "actor_id": log.actor_id,
            "actor_role": log.actor_role,
            "description": log.description,
            "details": log.details,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None
        }
        for log in logs
    ]

# ---------------------------------------------------------------------------
# FHIR R4 Bundle Repository (ABDM Interoperability)
# ---------------------------------------------------------------------------
@app.get("/api/fhir/bundles")
def list_fhir_bundles(db: Session = Depends(get_db)):
    """Lists saved FHIR R4 document bundles from DBMS."""
    bundles = db.query(FhirBundleRecord).order_by(desc(FhirBundleRecord.created_at)).all()
    return [
        {
            "bundle_id": b.bundle_id,
            "session_id": b.session_id,
            "abha_id": b.abha_id,
            "created_at": b.created_at.isoformat() if b.created_at else None,
            "resource_type": b.resource_type
        }
        for b in bundles
    ]

@app.get("/api/fhir/bundles/{bundle_id}")
def get_fhir_bundle(bundle_id: str, db: Session = Depends(get_db)):
    """Returns full ABDM-compliant FHIR R4 JSON document bundle by ID."""
    b = db.query(FhirBundleRecord).filter(FhirBundleRecord.bundle_id == bundle_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="FHIR bundle not found.")
    return b.fhir_json
