"""
MediKiosk FHIR R4 Standard Formatter Module
Serializes clinical intake and doctor summaries into ABDM-compliant FHIR R4 JSON resources.
"""

from typing import Dict, Any
import datetime
import json

def build_fhir_bundle(patient_data: Dict[str, Any], clinical_summary: str) -> Dict[str, Any]:
    """Generates an official FHIR R4 Bundle containing Patient, Condition, and Observation resources."""
    now_iso = datetime.datetime.utcnow().isoformat() + "Z"
    patient_id = patient_data.get("session_id", "PAT-101")
    
    return {
        "resourceType": "Bundle",
        "id": f"bundle-{patient_id}",
        "meta": {
            "versionId": "1",
            "lastUpdated": now_iso,
            "profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle"]
        },
        "identifier": {
            "system": "https://healthid.ndhm.gov.in",
            "value": patient_data.get("abha_id", "91-8840-2910-4491")
        },
        "type": "document",
        "timestamp": now_iso,
        "entry": [
            {
                "fullUrl": f"urn:uuid:Patient/{patient_id}",
                "resource": {
                    "resourceType": "Patient",
                    "id": patient_id,
                    "identifier": [
                        {
                            "type": {"coding": [{"system": "http://terminology.hl7.org/CodeSystem/v2-0203", "code": "MR"}]},
                            "system": "https://healthid.ndhm.gov.in",
                            "value": patient_data.get("abha_id", "91-8840-2910-4491")
                        }
                    ],
                    "name": [{"text": patient_data.get("patient_name", "Rajesh Kumar")}],
                    "gender": "male",
                    "birthDate": "1959-04-12"
                }
            },
            {
                "fullUrl": f"urn:uuid:Condition/cond-01",
                "resource": {
                    "resourceType": "Condition",
                    "id": "cond-01",
                    "clinicalStatus": {"coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-clinical", "code": "active"}]},
                    "verificationStatus": {"coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-ver-status", "code": "confirmed"}]},
                    "category": [{"coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-category", "code": "encounter-diagnosis"}]}],
                    "code": {"text": patient_data.get("chief_complaint", "Chest Pain & Jalan")},
                    "subject": {"reference": f"Patient/{patient_id}"}
                }
            },
            {
                "fullUrl": f"urn:uuid:Observation/obs-bp",
                "resource": {
                    "resourceType": "Observation",
                    "id": "obs-bp",
                    "status": "final",
                    "category": [{"coding": [{"system": "http://terminology.hl7.org/CodeSystem/observation-category", "code": "vital-signs"}]}],
                    "code": {"text": "Blood Pressure"},
                    "subject": {"reference": f"Patient/{patient_id}"},
                    "valueString": "150/90 mmHg",
                    "interpretation": [{"coding": [{"system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation", "code": "H"}]}]
                }
            }
        ]
    }
