# ⚡ MediKiosk Backend API & Clinical DBMS Engine

> **Ministry of AYUSH, Government of India** • Digital Clinical Initiative  
> **Team:** Medinexus  

---

## 📌 Executive Summary

MediKiosk Backend is a high-throughput **FastAPI (Python)** clinical engine and database management system designed to transform crowded OPD intake. It powers speech-to-text intake in 15+ Indian languages (via Bhashini), extracts medical entities from handwritten prescriptions using Transformer Vision OCR, detects emergency red-flags, and serializes clinical summaries into **ABDM-compliant FHIR R4 JSON standards**.

---

## 💾 DBMS Architecture

MediKiosk employs a hybrid database architecture balancing relational integrity, semi-structured document flexibility, and national health mission standards:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        FastAPI REST Server (main.py)                   │
└───────┬────────────────────────┬───────────────────────┬───────────────┘
        │                        │                       │
┌───────▼──────────────┐  ┌──────▼──────────────┐  ┌─────▼──────────────┐
│  Relational DBMS     │  │  Document Store     │  │  ABDM Gateway /    │
│  (SQLAlchemy ORM)    │  │  (MongoDB / JSON)   │  │  FHIR Repository   │
│  • Patient Master    │  │  • Semi-Structured  │  │  • FHIR R4 Bundles │
│  • Doctor Directory  │  │    Clinical Bundles │  │  • DocumentBundle  │
│  • Appointments      │  │  • OCR Payloads     │  │  • NRCES NDHM      │
│  • DPDP Audit Trails │  │  • Adaptive History │  │    Interoperability│
│  (SQLite/PostgreSQL) │  │  (Flexible Schema)  │  │                    │
└──────────────────────┘  └─────────────────────┘  └────────────────────┘
```

### 1. Relational Layer (PostgreSQL / MySQL / SQLite + SQLAlchemy)
- **`patients`**: Relational patient demographics and unique ABHA (Ayushman Bharat Health Account) IDs.
- **`doctors`**: Doctor credentials, license registration numbers, departments, hospitals, and access PINs.
- **`intake_sessions`**: Kiosk intake records, chief complaints, body location mapping, red-flag triage statuses, and AI clinical summaries.
- **`doctor_verifications`**: OPD verification logs with clinician digital signatures and timestamped edits.
- **`appointments`**: Bookings, hospital references, assigned specialists, time slots, and DPDP patient consent flags.
- **`audit_logs`**: Immutable security and privacy audit trail fulfilling DPDP Act 2023 compliance requirements.

### 2. Document Store Layer (MongoDB / Semi-Structured JSON)
- **`fhir_bundles`**: Full ABDM-compliant FHIR R4 JSON clinical bundles containing `Patient`, `Condition`, and `Observation` resources.
- Supports MongoDB via `MONGODB_URL` with automatic fallback to relational JSON/JSONB storage.

### 3. FHIR Repository & ABDM Interoperability
- Endpoints to inspect, export, and interface FHIR R4 bundles for Ayushman Bharat Digital Mission (ABDM) and National Health Authority (NHA) integrations.

---

## 🛠️ Repository Modules

- `main.py`: REST API endpoints for Intake, OCR Scan, Doctor Verification Queue, Admin Directory, and Care Navigation.
- `database.py`: SQLAlchemy sessionmaker, database engine setup, and optional MongoDB client connection.
- `models.py`: SQLAlchemy ORM entity models for all relational tables and document stores.
- `db_init.py`: Database migration and auto-seeding script (seeds initial doctors and baseline records).
- `clinical_engine.py`: SOCRATES clinical questioning framework, emergency cardiac/stroke red-flag detector, and AYUSH Dashavidha Pariksha parameters.
- `ocr_parser.py`: Dual-engine OCR and MedSpaCy NER pipeline with confidence thresholding.
- `fhir_formatter.py`: Converts clinical intake summaries into official FHIR R4 JSON resources.

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | System health check, server status, and DBMS connection state |
| `POST` | `/api/intake/voice-parse` | Parses spoken intake text, checks red flags, returns SOCRATES questions & saves session to DBMS |
| `POST` | `/api/ocr/scan-prescription` | Processes uploaded prescriptions and updates clinical summary in DBMS |
| `GET` | `/api/doctor/queue` | Retrieves Doctor OPD Verification Queue from relational database |
| `POST` | `/api/doctor/verify-summary` | Doctor verifies summary, generates FHIR R4 bundle & commits to DBMS |
| `GET` | `/api/navigation/nearby-hospitals` | Discovers nearby hospitals & specialists via geolocation |
| `POST` | `/api/navigation/book-appointment` | Books slot and records explicit DPDP Act 2023 consent into DBMS |
| `GET` | `/api/admin/doctors` | Lists registered doctors from DBMS |
| `POST` | `/api/admin/doctors` | Registers new doctor credential in DBMS |
| `PATCH` | `/api/admin/doctors/{license_number}/status` | Toggles doctor Active/Pending status in DBMS |
| `DELETE` | `/api/admin/doctors/{license_number}` | Deletes doctor credential from DBMS |
| `GET` | `/api/admin/stats` | Aggregated real-time metrics across doctors, patients, bundles, and audit logs |
| `GET` | `/api/admin/audit-logs` | Fetches immutable DPDP Act 2023 compliance audit trail |
| `GET` | `/api/fhir/bundles` | Lists all saved ABDM FHIR R4 clinical bundles |
| `GET` | `/api/fhir/bundles/{bundle_id}` | Retrieves full ABDM FHIR R4 JSON document bundle |

---

## 🚀 Configuration & Execution

### Environment Variables
Configure your database connection via standard environment variables:

```bash
# Optional: PostgreSQL / MySQL Relational DBMS (defaults to local sqlite:///./medikiosk.db)
export DATABASE_URL="postgresql://user:password@localhost:5432/medikiosk"

# Optional: MongoDB Semi-Structured Document Store (defaults to Relational JSON store)
export MONGODB_URL="mongodb://localhost:27017"
```

### Installation & Execution

```bash
cd backend

# Install dependencies
python -m pip install -r requirements.txt

# Initialize database schema and seed initial records
python db_init.py

# Start FastAPI server
python -m uvicorn main:app --reload --port 8000
```

- Interactive Swagger API Docs: **`http://localhost:8000/docs`**
- ReDoc Documentation: **`http://localhost:8000/redoc`**

---

## 🔒 Security & Regulatory Compliance

- **DPDP Act 2023:** Mandatory consent flags and immutable database audit logs (`audit_logs` table) for all clinical and administrative events.
- **ABDM / ABHA Standards:** NRCES NDHM DocumentBundle profile compliance for national interoperability.
- **Human-in-the-Loop:** Clinical AI serves as an intake assistant; final medical confirmation and digital sign-off is logged by registered doctors.
