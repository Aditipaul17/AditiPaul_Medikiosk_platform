"""
MediKiosk OCR & Clinical Entity Extraction Pipeline
Parses handwritten prescriptions & printed lab reports with confidence scoring.
"""

from typing import Dict, Any, List

def parse_medical_document(image_filename: str) -> Dict[str, Any]:
    """
    Simulates OCR processing (PaddleOCR for printed, TrOCR/Vision for handwritten)
    followed by MedSpaCy Named Entity Recognition (NER).
    """
    return {
        "status": "SUCCESS",
        "processed_image": image_filename,
        "ocr_engine": "PaddleOCR v2.6 + TrOCR Handwriting Transformer",
        "extracted_entities": {
            "diagnoses": [
                {"term": "Essential Hypertension", "icd10_code": "I10", "confidence": 0.98},
                {"term": "Type 2 Diabetes Mellitus", "icd10_code": "E11", "confidence": 0.95}
            ],
            "medications": [
                {"name": "Amlodipine", "dosage": "5mg", "frequency": "OD (Once Daily)", "timing": "Morning", "confidence": 0.96},
                {"name": "Metformin", "dosage": "500mg", "frequency": "BD (Twice Daily)", "timing": "After meals", "confidence": 0.94},
                {"name": "Ecosprin", "dosage": "75mg", "frequency": "OD", "timing": "Night", "confidence": 0.78}
            ],
            "lab_observations": [
                {"test_name": "Blood Pressure", "value": "150/90", "unit": "mmHg", "interpretation": "HIGH ⬆️", "confidence": 0.99},
                {"test_name": "HbA1c", "value": "8.2", "unit": "%", "interpretation": "ELEVATED ⬆️", "confidence": 0.97},
                {"test_name": "Serum Creatinine", "value": "1.1", "unit": "mg/dL", "interpretation": "NORMAL", "confidence": 0.96}
            ]
        },
        "confidence_threshold_flags": [
            {
                "entity": "Ecosprin 75mg OD",
                "confidence_score": 0.78,
                "flag_type": "LOW_CONFIDENCE_HANDWRITING",
                "action_required": "Doctor physical verification on original scan needed."
            }
        ]
    }
