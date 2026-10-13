"""
MediKiosk Database Initialization & Seeder
Initializes database schema and populates initial doctor credentials,
sample patient records, and DPDP Act audit trails.
"""

import datetime
from database import engine, SessionLocal, Base
from models import Doctor, Patient, IntakeSession, AuditLog

INITIAL_DOCTORS = [
    {
        "license_number": "MMC-2026-1001",
        "name": "Dr. Rahul Sharma",
        "specialization": "General Medicine",
        "department": "Medicine",
        "hospital": "City Care Hospital",
        "status": "Active",
        "pin": "1234",
        "email": "dr.rahul@citycare.org",
        "phone": "+91 98201 12345"
    },
    {
        "license_number": "MMC-2026-1002",
        "name": "Dr. Priya Patil",
        "specialization": "Cardiology",
        "department": "Cardiology",
        "hospital": "City Care Hospital",
        "status": "Active",
        "pin": "1234",
        "email": "dr.priya@citycare.org",
        "phone": "+91 98201 67890"
    },
    {
        "license_number": "MMC-2026-1003",
        "name": "Dr. Amit Verma",
        "specialization": "Orthopedics",
        "department": "Orthopedics",
        "hospital": "City Care Hospital",
        "status": "Pending",
        "pin": "1234",
        "email": "dr.amit@citycare.org",
        "phone": "+91 98201 54321"
    },
    {
        "license_number": "MMC-2026-1004",
        "name": "Dr. Neha Joshi",
        "specialization": "Pediatrics",
        "department": "Pediatrics",
        "hospital": "City Care Hospital",
        "status": "Active",
        "pin": "1234",
        "email": "dr.neha@citycare.org",
        "phone": "+91 98201 98765"
    }
]

def init_db():
    """Creates tables if not exists and seeds initial baseline data."""
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Seed Doctors if table is empty
        if db.query(Doctor).count() == 0:
            for doc_data in INITIAL_DOCTORS:
                doc = Doctor(**doc_data)
                db.add(doc)
            
            # Log initialization audit entry
            init_audit = AuditLog(
                event_type="SYSTEM_INITIALIZATION",
                actor_id="SYS-INIT",
                actor_role="SYSTEM",
                description="Database initialized and default doctor directory seeded.",
                details={"seeded_doctors_count": len(INITIAL_DOCTORS)},
                timestamp=datetime.datetime.now(datetime.timezone.utc)
            )
            db.add(init_audit)
            db.commit()

        # Seed initial demo patient intake session if empty
        if db.query(IntakeSession).count() == 0:
            sample_session = IntakeSession(
                session_id="SES-DEMO-101",
                patient_name="Rajesh Kumar",
                age=52,
                gender="Male",
                abha_id="91-8840-2910-4491",
                language="Hindi",
                body_location="Left Chest",
                chief_complaint="Chest pain radiating to left arm with heaviness for 2 hours",
                red_flag={"is_emergency": True, "category": "CARDIAC_RED_FLAG", "reason": "Acute chest pain radiating to left arm"},
                adaptive_questions=[
                    {"question": "How long has the chest tightness persisted?", "category": "Time course"},
                    {"question": "Does taking deep breaths make it worse?", "category": "Exacerbating factors"}
                ],
                ai_summary="CHIEF COMPLAINT: Chest pain radiating to left arm\nPAST MEDICAL HISTORY: Hypertension, Type 2 DM\nPRIORITY: High Priority Emergency Queue",
                status="PENDING_VERIFICATION",
                created_at=datetime.datetime.now(datetime.timezone.utc)
            )
            db.add(sample_session)
            db.commit()

    finally:
        db.close()

if __name__ == "__main__":
    init_db()
    print("Database initialization and schema migration completed successfully.")
