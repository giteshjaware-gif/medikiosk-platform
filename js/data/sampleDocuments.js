/**
 * MediKiosk Platform - Sample Medical Documents & OCR Bounding Boxes
 * Realistic test cases for Module B (Document Digitization & Intelligence)
 */

window.MEDIKIOSK_SAMPLE_DOCS = [
  {
    id: "doc_rx_01",
    type: "prescription",
    title: "Handwritten OPD Prescription — MaxCare Superspeciality",
    issuer: "Dr. Rajesh Sharma, MD (Med), DM (Card)",
    date: "14-July-2026",
    patientName: "Suresh Kumar",
    patientAgeGender: "54 / Male",
    abhaId: "91-4521-8890-1234",
    docQuality: "Handwritten + Printed Header (Confidence 94.2%)",
    previewImageBadge: "RX-SLIP-NCR-2026",
    rawText: `MAXCARE SUPERSPECIALITY HOSPITAL, NEW DELHI
Department of Internal Medicine & Cardiology
Consultant: Dr. Rajesh Sharma, MD, DM
Date: 14/07/2026 | OPD Reg: MC-892110

Patient: Suresh Kumar | 54 Yrs / Male | ABHA: 91-4521-8890-1234
Rx:
1. Tab. Telmisartan 40 mg — 1 tab OD (Morning after breakfast) x 30 days
2. Tab. Metformin 500 mg — 1 tab BD (After meals) x 30 days
3. Tab. Atorvastatin 20 mg — 1 tab HS (Night) x 30 days
4. Tab. Aspirin 75 mg — 1 tab OD (After lunch) x 30 days

Advise:
- Low salt, diabetic diet
- Repeat HbA1c, Lipid Profile, S. Creatinine after 4 weeks
- SBP was 146/92 mmHg today in clinic.`,
    boundingBoxes: [
      { box: [12, 10, 80, 25], text: "MAXCARE SUPERSPECIALITY HOSPITAL", label: "Hospital", conf: 0.99 },
      { box: [30, 10, 45, 45], text: "Dr. Rajesh Sharma MD, DM", label: "Physician", conf: 0.97 },
      { box: [48, 12, 55, 60], text: "Suresh Kumar 54M ABHA: 91-4521-8890-1234", label: "Patient", conf: 0.98 },
      { box: [65, 15, 75, 80], text: "Tab Telmisartan 40mg 1 OD", label: "Medication", conf: 0.92, type: "Antihypertensive" },
      { box: [78, 15, 88, 80], text: "Tab Metformin 500mg 1 BD", label: "Medication", conf: 0.91, type: "Antidiabetic" },
      { box: [91, 15, 102, 80], text: "Tab Atorvastatin 20mg 1 HS", label: "Medication", conf: 0.94, type: "Statin" },
      { box: [105, 15, 115, 80], text: "Tab Aspirin 75mg 1 OD", label: "Medication", conf: 0.89, type: "Antiplatelet" },
      { box: [125, 12, 140, 85], text: "SBP 146/92 mmHg, Low Salt Diabetic Diet", label: "Clinical Note", conf: 0.88 }
    ],
    extractedEntities: {
      diagnoses: [
        { name: "Essential Hypertension", icd10: "I10", snomed: "38341003", status: "Active" },
        { name: "Type 2 Diabetes Mellitus", icd10: "E11.9", snomed: "44054006", status: "Active" }
      ],
      medications: [
        { name: "Telmisartan", dosage: "40 mg", frequency: "Once Daily (OD)", route: "Oral", indication: "Hypertension" },
        { name: "Metformin", dosage: "500 mg", frequency: "Twice Daily (BD)", route: "Oral", indication: "Type 2 Diabetes" },
        { name: "Atorvastatin", dosage: "20 mg", frequency: "At Bedtime (HS)", route: "Oral", indication: "Hyperlipidemia" },
        { name: "Aspirin", dosage: "75 mg", frequency: "Once Daily (OD)", route: "Oral", indication: "Cardioprotection" }
      ],
      vitalsRecorded: {
        bp: "146/92 mmHg (Stage 1 HTN)",
        pulse: "78 bpm"
      }
    }
  },
  {
    id: "doc_lab_02",
    type: "lab_report",
    title: "Diagnostic Lab Report — Comprehensive Metabolic & Lipid Panel",
    issuer: "National Reference Laboratories (NABL Accredited)",
    date: "12-August-2026",
    patientName: "Suresh Kumar",
    patientAgeGender: "54 / Male",
    abhaId: "91-4521-8890-1234",
    docQuality: "Printed Multipage PDF / Barcoded (Confidence 99.1%)",
    previewImageBadge: "LAB-REF-NABL-098",
    rawText: `NATIONAL REFERENCE LABORATORIES (NABL ACCREDITED LAB ISO 15189)
Specimen: Venous Blood | Fasting (10 hrs) | Barcode: *NRL-9921448*
Patient: Suresh Kumar | 54 / M | Ref By: Dr. Rajesh Sharma
Test Performed: Photometry & HPLC (NGSP Certified)

TEST NAME                 OBSERVED VALUE   REFERENCE RANGE     UNITS      REMARKS
--------------------------------------------------------------------------------
HbA1c (Glycated Hb)       8.4              4.0 - 5.6           %          CRITICAL HIGH
Estimated Avg Glucose     194              90 - 120            mg/dL      HIGH
Fasting Blood Sugar       168              70 - 100            mg/dL      HIGH
Total Cholesterol         234              < 200               mg/dL      HIGH
LDL Cholesterol           152              < 100               mg/dL      HIGH
HDL Cholesterol           38               > 40                mg/dL      LOW
Triglycerides             220              < 150               mg/dL      HIGH
Serum Creatinine          1.1              0.7 - 1.3           mg/dL      NORMAL
Serum Urea                32               15 - 45             mg/dL      NORMAL
eGFR                      82               > 90                mL/min     MILD REDUCTION`,
    boundingBoxes: [
      { box: [15, 10, 85, 30], text: "NATIONAL REFERENCE LABORATORIES (NABL)", label: "Lab Header", conf: 0.99 },
      { box: [40, 10, 52, 90], text: "HbA1c: 8.4 % (Ref: 4.0 - 5.6%) CRITICAL HIGH", label: "Lab Abnormal", conf: 0.99, flag: "CRITICAL_HIGH" },
      { box: [55, 10, 68, 90], text: "Fasting Blood Sugar: 168 mg/dL (Ref: 70-100)", label: "Lab Abnormal", conf: 0.98, flag: "HIGH" },
      { box: [70, 10, 82, 90], text: "Total Cholesterol: 234 mg/dL (Ref: <200)", label: "Lab Abnormal", conf: 0.98, flag: "HIGH" },
      { box: [85, 10, 97, 90], text: "LDL Cholesterol: 152 mg/dL (Ref: <100)", label: "Lab Abnormal", conf: 0.99, flag: "HIGH" },
      { box: [100, 10, 112, 90], text: "HDL Cholesterol: 38 mg/dL (Ref: >40)", label: "Lab Abnormal", conf: 0.97, flag: "LOW" },
      { box: [115, 10, 127, 90], text: "Triglycerides: 220 mg/dL (Ref: <150)", label: "Lab Abnormal", conf: 0.98, flag: "HIGH" },
      { box: [130, 10, 142, 90], text: "Serum Creatinine: 1.1 mg/dL (Ref: 0.7-1.3)", label: "Lab Normal", conf: 0.99, flag: "NORMAL" }
    ],
    extractedEntities: {
      abnormalValues: [
        { test: "HbA1c", value: "8.4", unit: "%", ref: "4.0 - 5.6", loinc: "4548-4", severity: "CRITICAL HIGH", note: "Sub-optimal glycemic control; elevated diabetic complication risk" },
        { test: "Fasting Blood Sugar", value: "168", unit: "mg/dL", ref: "70 - 100", loinc: "1558-6", severity: "HIGH", note: "Marked fasting hyperglycemia" },
        { test: "LDL Cholesterol", value: "152", unit: "mg/dL", ref: "< 100", loinc: "13457-7", severity: "HIGH", note: "Atherogenic dyslipidemia; high cardiovascular risk" },
        { test: "HDL Cholesterol", value: "38", unit: "mg/dL", ref: "> 40", loinc: "2085-9", severity: "LOW", note: "Sub-normal protective lipoprotein" },
        { test: "Triglycerides", value: "220", unit: "mg/dL", ref: "< 150", loinc: "2571-8", severity: "HIGH", note: "Moderate hypertriglyceridemia" }
      ],
      normalValues: [
        { test: "Serum Creatinine", value: "1.1", unit: "mg/dL", ref: "0.7 - 1.3", loinc: "2160-0" },
        { test: "Serum Urea", value: "32", unit: "mg/dL", ref: "15 - 45" },
        { test: "eGFR", value: "82", unit: "mL/min", ref: "> 90" }
      ]
    }
  },
  {
    id: "doc_discharge_03",
    type: "discharge_summary",
    title: "Inpatient Discharge Summary — Apollo Heart Centre",
    issuer: "Apollo Hospitals Division of Interventional Cardiology",
    date: "18-January-2025",
    patientName: "Suresh Kumar",
    patientAgeGender: "53 / Male",
    abhaId: "91-4521-8890-1234",
    docQuality: "Printed Institutional Discharge Summary (Confidence 98.6%)",
    previewImageBadge: "DISCH-APOLLO-CARDIO",
    rawText: `APOLLO HOSPITALS ENTERPRISE LTD.
DISCHARGE SUMMARY — CORONARY CARE UNIT
IP No: AH-2025-01994 | Date of Admission: 15/01/2025 | Date of Discharge: 18/01/2025
Patient: Suresh Kumar, 53 Y / M | ABHA ID: 91-4521-8890-1234

PRIMARY DIAGNOSIS:
Acute Coronary Syndrome — Non-ST Elevation Myocardial Infarction (NSTEMI)
Coronary Artery Disease — Single Vessel Disease (SVD)

PROCEDURES PERFORMED:
Coronary Angiography via Right Radial Route (15/01/2025)
Percutaneous Coronary Intervention (PCI) with Drug-Eluting Stent (DES) to Mid-LAD (3.0 x 24 mm Resolute Onyx).
Post-procedure TIMI III flow achieved without residual stenosis or dissection.

HOSPITAL COURSE:
Patient presented with retrosternal chest discomfort radiating to left shoulder. Troponin-I was elevated at 2.4 ng/mL.
Underwent uneventful radial PCI. Post-procedure 2D Echo: LVEF 50%, mild hypokinesia of anterior septum.

DISCHARGE MEDICATIONS:
1. Tab Aspirin 75 mg OD
2. Tab Clopidogrel 75 mg OD (DAPT recommended for 12 months minimum)
3. Tab Rosuvastatin 20 mg HS
4. Tab Metoprolol Succinate 25 mg OD
5. Tab Pantoprazole 40 mg OD before breakfast`,
    boundingBoxes: [
      { box: [10, 10, 80, 25], text: "APOLLO HOSPITALS ENTERPRISE LTD", label: "Hospital", conf: 0.99 },
      { box: [35, 12, 50, 85], text: "NSTEMI - Single Vessel Disease (SVD)", label: "Diagnosis", conf: 0.97 },
      { box: [55, 12, 75, 85], text: "PCI with DES to Mid-LAD (3.0 x 24mm)", label: "Procedure", conf: 0.96 },
      { box: [80, 12, 95, 85], text: "2D Echo: LVEF 50%, Mild hypokinesia anterior septum", label: "Investigation", conf: 0.94 },
      { box: [100, 12, 135, 85], text: "Discharge Meds: Aspirin 75mg, Clopidogrel 75mg, Rosuvastatin 20mg, Metoprolol 25mg", label: "Medications", conf: 0.95 }
    ],
    extractedEntities: {
      diagnoses: [
        { name: "Non-ST Elevation Myocardial Infarction (NSTEMI)", icd10: "I21.4", snomed: "401314000" },
        { name: "Coronary Artery Disease - Single Vessel Disease", icd10: "I25.10", snomed: "53741008" }
      ],
      procedures: [
        { name: "Percutaneous Coronary Intervention (PCI) with Stenting to Mid-LAD", date: "15-Jan-2025", snomed: "415070008" }
      ],
      timelineEvents: [
        { date: "15-Jan-2025", event: "Admitted with NSTEMI; Radial PCI with DES to Mid LAD", facility: "Apollo Hospitals" },
        { date: "18-Jan-2025", event: "Discharged on DAPT (Aspirin + Clopidogrel) & Statin", facility: "Apollo Hospitals" },
        { date: "14-Jul-2026", event: "OPD Review at MaxCare: BP 146/92 mmHg, Switched to Atorvastatin 20mg & Telmisartan 40mg", facility: "MaxCare" },
        { date: "12-Aug-2026", event: "Lab Testing: HbA1c 8.4% (Uncontrolled), LDL 152 mg/dL", facility: "National Ref Labs" }
      ]
    }
  }
];
