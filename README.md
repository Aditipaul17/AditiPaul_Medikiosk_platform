#  MediKiosk — AI Clinical Intake & Care Navigation Platform

> **Repository:** [AditiPaul_Medikiosk_platform](https://github.com/Aditipaul17/AditiPaul_Medikiosk_platform)

---

## 📌 Overview

**MediKiosk** transforms crowded outpatient department (OPD) intake into a zero-barrier, doctor-ready workflow. By leveraging AI-powered multi-lingual voice intake, adaptive clinical questioning, vision OCR for handwritten prescriptions, and emergency red-flag triage, MediKiosk converts rushed OPD interactions into structured, **ABDM-compliant FHIR R4** clinical summaries.

---

##  Key Features

- ** Multilingual Voice & Touch Intake:** Spoken voice intake across 15+ Indian languages with touch body mapping and accessibility support.
- ** Emergency Red-Flag Triage:** Real-time detection of high-risk conditions (Acute Coronary Syndrome, FAST stroke protocol, acute respiratory distress).
- ** SOCRATES Clinical Questioning:** Structured elicitation engine evaluating Site, Onset, Character, Radiation, Associations, Time course, Exacerbating/relieving factors, and Severity.
- ** AYUSH Dashavidha Pariksha:** Clinical assessment aligning with traditional AYUSH diagnostic parameters (Prakriti, Sara, Samhanana, etc.).
- ** Dual OCR & Prescription Extraction:** Extracts entity details from uploaded prescriptions and lab reports.
- ** Doctor OPD Verification Dashboard:** Streamlined verification queue enabling clinicians to edit, annotate, sign, and validate pre-generated clinical summaries.
- ** Care Navigation & Appointment Booking:** Geolocation-based discovery of nearby healthcare facilities and specialists.
- ** DPDP Act 2023 & FHIR R4 Compliance:** Explicit patient consent management and interoperable FHIR R4 Patient Summary bundles ready for ABDM integration.

---

##  Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        MediKiosk Architecture                          │
└───────┬────────────────────────────────────────────────┬───────────────┘
        │                                                │
┌───────▼──────────────────────────┐     ┌───────────────▼──────────────┐
│       Frontend (Next.js)         │     │       Backend (FastAPI)      │
│  • Patient Intake Flow           │ ──> │  • RESTful API Endpoints     │
│  • Interactive Body Map          │ <── │  • SOCRATES Clinical Engine  │
│  • Doctor OPD Dashboard          │     │  • Red-Flag Triage Analyzer  │
│  • Hospital Care Navigation      │     │  • FHIR R4 Serializer        │
│  • Consent & Document Upload     │     │  • OCR & Entity Extraction   │
└──────────────────────────────────┘     └──────────────────────────────┘
```

---

##  Tech Stack

### Frontend
- **Framework:** [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Library:** [React](https://react.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Language:** TypeScript

### Backend
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/)
- **ASGI Server:** [Uvicorn](https://www.uvicorn.org/)
- **Validation:** [Pydantic](https://docs.pydantic.dev/)
- **Standards:** HL7 FHIR R4, ABDM (Ayushman Bharat Digital Mission)
- **Language:** Python 3.9+

---

##  Repository Structure

```text
Medikiosk/
├── backend/
│   ├── clinical_engine.py    # SOCRATES framework, red-flag detection, AYUSH logic
│   ├── fhir_formatter.py     # FHIR R4 bundle generation
│   ├── main.py               # FastAPI application server and REST endpoints
│   ├── ocr_parser.py         # OCR extraction pipeline
│   ├── requirements.txt      # Python dependencies
│   └── README.md             # Backend documentation
├── frontend/
│   ├── app/                  # Next.js App Router (Patient, Doctor, Admin flows)
│   ├── index.html            # Standalone interactive prototype demo
│   ├── package.json          # Node dependencies and scripts
│   └── tsconfig.json         # TypeScript configuration
├── .gitignore                # Git ignore configuration
└── README.md                 # Project root documentation
```

---

##  Getting Started

### Prerequisites
- **Node.js:** v18 or later (v20+ recommended)
- **Python:** 3.9 or later
- **npm** or **yarn** / **pnpm**

---

### 1. Run the Backend API Server

Open a terminal and navigate to `backend/`:

```bash
cd backend

# Install Python dependencies
python -m pip install -r requirements.txt

# Start the FastAPI server
python -m uvicorn main:app --reload --port 8000
```

- Server URL: **`http://localhost:8000`**
- Interactive Swagger API Documentation: **`http://localhost:8000/docs`**
- ReDoc Documentation: **`http://localhost:8000/redoc`**

---

### 2. Run the Frontend Application

Open a second terminal and navigate to `frontend/`:

```bash
cd frontend

# Install Node dependencies
npm install

# Start the development server
npm run dev
```

- Frontend App: **`http://localhost:3000`**

---

##  API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check & system status |
| `POST` | `/api/intake/voice-parse` | Parses intake text, triggers red-flag checks & returns adaptive SOCRATES questions |
| `POST` | `/api/ocr/scan-prescription` | Processes uploaded prescription/lab images and extracts entities |
| `GET` | `/api/doctor/queue` | Fetches doctor verification OPD queue |
| `POST` | `/api/doctor/verify-summary` | Signs and finalizes summary into ABDM FHIR R4 bundle |
| `GET` | `/api/navigation/nearby-hospitals` | Returns nearby hospitals and specialists |
| `POST` | `/api/navigation/book-appointment` | Books slot under DPDP Act 2023 patient consent gate |

---

##  Security & Compliance

- **DPDP Act 2023:** Mandatory, granular consent gates before records are stored or transmitted.
- **ABDM / ABHA Integration:** Ready for Ayushman Bharat Digital Mission interoperability.
- **Human-in-the-Loop:** Clinical AI acts purely as an assistive intake tool; doctors retain 100% diagnostic and prescription authority.
