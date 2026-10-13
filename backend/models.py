"""
MediKiosk SQLAlchemy Relational Models & Schemas
Implements relational schema for patients, doctors, intake sessions, appointments,
audit logs (DPDP Act 2023 compliant), and FHIR R4 document bundles.
"""

import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

def get_utc_now():
    return datetime.datetime.now(datetime.timezone.utc)

class Doctor(Base):
    """Hospital Doctor Credentials & Profile."""
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    license_number = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    specialization = Column(String(100), nullable=False)
    department = Column(String(100), nullable=False)
    hospital = Column(String(150), default="City Care Hospital", nullable=False)
    status = Column(String(20), default="Active")  # "Active" | "Pending"
    pin = Column(String(20), default="1234")  # Doctor login PIN
    email = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=get_utc_now)

class Patient(Base):
    """Patient Master Demographics & ABHA Identity."""
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    abha_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(20), nullable=False)
    phone = Column(String(20), nullable=True)
    address = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=get_utc_now)

    # Relationships
    sessions = relationship("IntakeSession", back_populates="patient", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="patient")

class IntakeSession(Base):
    """Kiosk Intake Clinical Session & Red-flag Triage."""
    __tablename__ = "intake_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(50), unique=True, index=True, nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True)
    patient_name = Column(String(150), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(20), nullable=False)
    abha_id = Column(String(50), nullable=True)
    language = Column(String(50), default="English")
    body_location = Column(String(100), default="General")
    chief_complaint = Column(Text, nullable=False)
    
    # Semi-structured JSON fields
    red_flag = Column(JSON, nullable=True)
    adaptive_questions = Column(JSON, nullable=True)
    ocr_extracted = Column(JSON, nullable=True)
    ai_summary = Column(Text, nullable=True)
    
    status = Column(String(30), default="PENDING_VERIFICATION")  # "PENDING_VERIFICATION" | "CONFIRMED" | "EDITED" | "REJECTED"
    created_at = Column(DateTime, default=get_utc_now)

    # Relationships
    patient = relationship("Patient", back_populates="sessions")
    verification = relationship("DoctorVerification", back_populates="session", uselist=False)
    fhir_bundle = relationship("FhirBundleRecord", back_populates="session", uselist=False)

class DoctorVerification(Base):
    """Doctor OPD Sign-off & Verification Record."""
    __tablename__ = "doctor_verifications"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(50), ForeignKey("intake_sessions.session_id"), unique=True, nullable=False)
    doctor_id = Column(String(50), nullable=False)
    status = Column(String(30), nullable=False)  # "CONFIRMED" | "EDITED" | "REJECTED"
    verified_summary = Column(Text, nullable=False)
    doctor_signature = Column(String(255), nullable=False)
    verified_at = Column(DateTime, default=get_utc_now)

    # Relationships
    session = relationship("IntakeSession", back_populates="verification")

class FhirBundleRecord(Base):
    """Semi-structured ABDM FHIR R4 Document Bundle Store."""
    __tablename__ = "fhir_bundles"

    id = Column(Integer, primary_key=True, index=True)
    bundle_id = Column(String(100), unique=True, index=True, nullable=False)
    session_id = Column(String(50), ForeignKey("intake_sessions.session_id"), nullable=False)
    abha_id = Column(String(50), nullable=True)
    resource_type = Column(String(50), default="Bundle")
    fhir_json = Column(JSON, nullable=False)  # Complete FHIR R4 JSON document
    created_at = Column(DateTime, default=get_utc_now)

    # Relationships
    session = relationship("IntakeSession", back_populates="fhir_bundle")

class Appointment(Base):
    """Relational OPD & AYUSH Care Navigation Appointments."""
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(String(50), unique=True, index=True, nullable=False)
    session_id = Column(String(50), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True)
    hospital_id = Column(String(50), nullable=False)
    specialist_name = Column(String(150), nullable=False)
    department = Column(String(100), nullable=False)
    slot_time = Column(String(50), nullable=False)
    patient_consent = Column(Boolean, default=False)
    created_at = Column(DateTime, default=get_utc_now)

    # Relationships
    patient = relationship("Patient", back_populates="appointments")

class AuditLog(Base):
    """DPDP Act 2023 Compliance & Security Access Audit Trail."""
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(80), nullable=False)  # "PATIENT_INTAKE", "CONSENT_GRANTED", "DOCTOR_VERIFIED", "ADMIN_DOCTOR_ADDED"
    actor_id = Column(String(80), nullable=False)
    actor_role = Column(String(50), nullable=False)  # "PATIENT", "DOCTOR", "ADMIN", "SYSTEM"
    description = Column(Text, nullable=False)
    details = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=get_utc_now)
