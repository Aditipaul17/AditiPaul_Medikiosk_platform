# ⚡ MediKiosk Backend API Engine

> **Smart India Hackathon 2026** • Problem Statement ID: `SIH26047`  
> **Nodal Ministry:** Ministry of AYUSH, Government of India  
> **Team:** Medinexus  

---

## 📌 Executive Summary

MediKiosk Backend is a high-throughput **FastAPI (Python)** clinical engine designed to transform crowded OPD intake. It powers speech-to-text intake in 15+ Indian languages (via Bhashini), extracts medical entities from handwritten prescriptions using Transformer Vision OCR, detects emergency red-flags, and serializes clinical summaries into **ABDM-compliant FHIR R4 JSON standards**.

---

## 🛠️ Architecture & Core Modules

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        FastAPI REST Server (main.py)                   │
└───────┬────────────────────────┬───────────────────────┬───────────────┘
        │                        │                       │
┌───────▼──────────────┐  ┌──────▼──────────────┐  ┌─────▼──────────────┐
│  Clinical Engine     │  │  OCR & NER Pipeline │  │  FHIR R4 Serializer│
│  (clinical_engine.py)│  │  (ocr_parser.py)    │  │  (fhir_formatter)  │
│  • SOCRATES Q&A      │  │  • PaddleOCR        │  │  • Patient Bundle  │
│  • Red-Flag Triage   │  │  • TrOCR Handwriting│  │  • ABDM / ABHA ID  │
│  • AYUSH Pariksha    │  │  • Confidence Check │  │  • EMR Integration │
└──────────────────────┘  └─────────────────────┘  └────────────────────┘
```

### Key Modules:
- `main.py`: REST API endpoints for Intake, OCR Scan, Doctor Verification Queue, and Care Navigation Booking.
- `clinical_engine.py`: SOCRATES clinical questioning framework, emergency cardiac/stroke red-flag detector, and AYUSH Dashavidha Pariksha parameters.
- `ocr_parser.py`: Dual-engine OCR and MedSpaCy NER pipeline with >85% confidence thresholding.
- `fhir_formatter.py`: Converts clinical intake summaries into official FHIR R4 JSON resources.

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | System Health Check & Server Status |
| `POST` | `/api/intake/voice-parse` | Parses spoken intake text, checks red flags & returns SOCRATES questions |
| `POST` | `/api/ocr/scan-prescription` | Processes uploaded prescriptions/lab reports and extracts medical entities |
| `GET` | `/api/doctor/queue` | Retrieves Doctor OPD Verification Queue with pre-verified summaries |
| `POST` | `/api/doctor/verify-summary` | Doctor edits/approves summary with Digital Signature & creates FHIR bundle |
| `GET` | `/api/navigation/nearby-hospitals` | Discovers nearby hospitals & specialists via geolocation |
| `POST` | `/api/navigation/book-appointment` | Books slot and handles explicit DPDP Act 2023 consent gate |

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.9+
- `pip` package manager

### Installation & Execution

```bash
# 1. Clone the repository
git clone https://github.com/your-org/medikiosk-backend.git
cd medikiosk-backend

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start the FastAPI Uvicorn Server
uvicorn main:app --reload --port 8000
```

Once running, access the interactive Swagger API documentation at:  
👉 **`http://localhost:8000/docs`**

---

## 🔒 Security & Regulatory Compliance

- **DPDP Act 2023:** Explicit patient consent required before transmitting clinical records.
- **Data Security:** AES-256 bit encryption at rest, TLS 1.3 in transit.
- **Non-Autonomous AI:** Human-in-the-loop architecture (AI only generates editable drafts; final diagnostic authority remains 100% with doctors).
