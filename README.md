# MediKiosk — AI Clinical History Software Platform

A full-stack interactive web application built for the **MediKiosk** AI-powered clinical history software platform problem statement.

MediKiosk enables patients to record a comprehensive medical history through natural voice conversation and guided touchscreen interaction, scan and digitize their existing physical medical documents, and generate a structured, physician-ready clinical history summary pushed directly to the hospital information system (HIS) and linked to their ABHA record — before the consultation, with minimal staff assistance.

---

## 🌟 Key Capabilities & Modules

### 1. Module A — Conversational Multimodal History Engine
- **Dual-Mode Input**: Every question is answerable by **speaking naturally** in Indian languages (Web Speech API ASR with Indian English and Hindi support, or simulated input) OR by **tapping large high-contrast touch cards**.
- **Adaptive SOCRATES Clinical Questioning**: Dynamically branches across the SOCRATES vectors (*Site, Onset, Character, Radiation, Associated symptoms, Timing, Exacerbating/relieving factors, Severity*) mirroring a physician's clinical reasoning.
- **AYUSH History Mode**: Dedicated Ayurvedic OPD mode capturing **Dashavidha Pariksha** (10-fold examination: *Prakriti, Vikriti, Sara, Samhanana, Pramana, Satmya, Sattva, Ahara Shakti, Vyayama Shakti, Vaya*) and *Ahara-Vihara* circadian lifestyle assessment.
- **Red-Flag Emergency Detection**: Real-time evaluation (< 50ms) for acute coronary syndrome, stroke, or severe respiratory distress. Bypasses routine OPD queues, triggers audible sirens and flashing red UI, and issues **Emergency Priority 1 Token #E-01** with direct transfer to the resuscitation bay.

### 2. Module B — Medical Document Digitization & Intelligence
- **High-Accuracy OCR Pipeline**: Ingests physical prescriptions (handwritten and printed), NABL lab reports, and inpatient discharge summaries.
- **Visual OCR Bounding Boxes**: Overlays bounding boxes on scanned documents with confidence scores and entity labels.
- **Intelligent Entity Extraction**: Normalizes diagnoses (ICD-10, SNOMED CT), medications with dosages, lab tests (LOINC), and surgical procedures.
- **Chronological Timeline**: Synthesizes past hospital admissions, stent procedures, and outpatient reviews into a clear chronological timeline.
- **Abnormal Lab Flagging & Drug Interaction Checks**: Flags out-of-range lab values (e.g. HbA1c 8.4% Critical High, LDL 152 mg/dL) and alerts on drug-drug conflicts (e.g. Metformin + contrast risks, DAPT bleeding risks).

### 3. Module C — Structured History Summary Generator
- **Standard Clinical Format**: Synthesizes interview + OCR documents into:
  `Chief Complaint` ➔ `HPI (SOCRATES)` ➔ `Past Medical & Surgical History` ➔ `Drug & Allergy History` ➔ `Family History` ➔ `Personal History` ➔ `Review of Systems` ➔ `Prior Investigations Summary`.
- **15-Second Physician Digest**: Clean, condensed format allowing the doctor to absorb the full patient history in seconds before the consultation starts.
- **Physician Editable & Verifiable**: Summary is presented as a draft that doctors can amend, annotate, and approve with one click.
- **Bilingual Output**: Spoken local language confirmation for the patient; standardized clinical English/Hindi summary for the physician.

### 4. Module D — Consent, Privacy & ABDM Integration
- **DPDP Act 2023 Compliant**: Granular consent manager with spoken audio explanation for low-literacy patients.
- **ABDM Integration**: Authenticates via ABHA ID (14-digit) or Aadhaar demo-auth; links summaries to the citizen's Personal Health Record (PHR).
- **FHIR R4 Bundle Generation**: Serializes clinical history into compliant FHIR R4 document bundles (`Encounter`, `Condition`, `Observation`, `AllergyIntolerance`, `MedicationStatement`) with an interactive JSON inspector.
- **Zero-Retention Ephemeral Privacy**: Automatically wipes temporary voice recordings and local document cache immediately upon consultation handover.

---

## 🚀 How to Run the Website

### Option 1: Built-in Python Server (Recommended)
From the project folder, run:
```bash
py -m http.server 8080 --directory C:\Users\gites\.gemini\antigravity\scratch\medikiosk-platform
```
Then open your browser and navigate to:
```
http://localhost:8080
```

### Option 2: Open Directly in Browser
You can also open `index.html` directly in Microsoft Edge or Google Chrome:
```bash
start "C:\Users\gites\.gemini\antigravity\scratch\medikiosk-platform\index.html"
```

---

## 📁 Project Structure

```
medikiosk-platform/
├── index.html                  # Main responsive single-page application shell
├── README.md                   # System documentation and user guide
├── css/
│   └── style.css               # Clinical styling, scanning laser, pulse rings, emergency siren effects
├── js/
│   ├── app.js                  # Application entry point, global view router, language & mode switcher
│   ├── data/
│   │   ├── ontologies.js       # SNOMED CT, LOINC, ICD-10, AYUSH Dashavidha Pariksha, and drug interactions
│   │   ├── sampleDocuments.js  # Realistic Indian prescriptions, NABL lab panels, and discharge summaries
│   │   └── stackData.js        # Table 3.2 & 3.3 Integrated Software & AI Stack specifications
│   └── modules/
│       ├── voiceEngine.js      # Multilingual Web Speech API (ASR & TTS), audio chimes & voice simulator
│       ├── conversationEngine.js # Adaptive SOCRATES questioning & AYUSH Dashavidha Pariksha questionnaire
│       ├── documentAI.js       # OCR scanning animation, bounding boxes, entity extraction & abnormal alerts
│       ├── summarizer.js       # Module C clinical history synthesis & FHIR R4 Bundle builder
│       ├── doctorPortal.js     # Step 5 Doctor EMR dashboard, live triage queue, 15-second summary & sign-off
│       ├── stackExplorer.js    # Interactive Table 3.2 & 3.3 Stack explorer with filterable architecture view
│       └── kioskController.js  # Kiosk state manager for Steps 1-4, language selector & DPDP audio consent
```

---

## 🧪 Interactive Walkthrough & Testing Guide

1. **Step 1 — Identify & Consent**:
   - Verify ABHA ID `91-4521-8890-1234` (Suresh Kumar, 54M).
   - Click **"Play Spoken Audio Consent"** to listen to the DPDP Act 2023 audio explanation.
   - Switch language to **हिन्दी (Hindi)** or **தமிழ் (Tamil)** to test multilingual audio prompts.
   - Click **"Grant Explicit Consent & Begin History Interview"**.

2. **Step 2 — Multimodal Converse**:
   - Tap touch cards or click the **Pulsing Microphone Button** to speak.
   - Experience adaptive clinical branching across the **SOCRATES framework** (*Site ➔ Onset ➔ Character ➔ Radiation ➔ Associations ➔ Timing ➔ Exacerbating ➔ Severity*).
   - Click **"Test Red-Flag Emergency Triage"** to simulate an acute heart attack symptom (crushing chest pain + sweating + left arm radiation) ➔ witness the priority alert, audible siren tone, and Emergency Token #E-01.
   - Toggle to **"AYUSH (दशविध परीक्षा)"** in the top navigation bar to test the 10-fold constitutional evaluation.

3. **Step 3 — Scan & Digitize**:
   - Choose between the **Prescription**, **NABL Lab Report**, or **Discharge Summary**.
   - Click **"Run High-Accuracy OCR & Entity Extraction"** to trigger the laser scan animation.
   - Inspect the detected OCR bounding boxes, out-of-range lab highlights (HbA1c 8.4% Critical, LDL 152 mg/dL), and drug interaction warnings.
   - Review the chronological medical timeline.

4. **Step 4 — Summarize & Route**:
   - View the synthesized physician-ready clinical summary.
   - Verify real-time ABDM PHR and Hospital HIS push statuses.
   - Review the generated Kiosk Token Slip #T-24.

5. **Step 5 — Doctor Consultation Screen**:
   - Switch to the **"Doctor OPD Portal"** tab.
   - Select patient tokens from the live queue (see routine vs. emergency triage flags).
   - Review the **15-second structured clinical digest**.
   - Edit the draft HPI or clinical notes in the inline editor.
   - Click **"Inspect FHIR R4 Bundle"** to inspect and copy the compliant FHIR JSON payload.
   - Click **"Verify, Sign & Commit to HIS"** to finalize the consultation record.

6. **Table 3.2 & 3.3 Software & AI Stack**:
   - Switch to the **"AI Stack"** tab to view the interactive matrix of subsystems, AI models (Bhashini, IndicWav2Vec, LayoutLMv3, TrOCR, Llama-3-Med, HAPI FHIR), performance SLAs, and regulatory compliance standards.
