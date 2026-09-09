/**
 * MediKiosk Platform - Table 3.2 & 3.3 Software & AI Stack (Integrated)
 * Detailed technical specifications, models, frameworks, standards, and SLAs
 */

window.MEDIKIOSK_STACK_DATA = {
  tableMeta: {
    title: "Table 3.2 & 3.3: MediKiosk Integrated Software & AI Stack Specification",
    version: "2.4.0-Enterprise",
    compliance: ["ABDM Milestone 1, 2, 3", "DPDP Act 2023", "ISO 27001", "HIPAA Aligned", "EHR Standards India 2016"]
  },
  modules: [
    {
      id: "module_a",
      code: "Module A",
      name: "Conversational Multimodal History Engine",
      tagline: "Natural Indian-language voice & touch clinical interview with adaptive physician reasoning",
      components: [
        {
          subsystem: "Speech-to-Text (ASR)",
          techStack: "AI4Bharat IndicWav2Vec / Whisper-Large-v3-Turbo fine-tuned on Indian accented medical lexicon + Bhashini API integration",
          specifications: "Real-time streaming ASR across 12 scheduled Indian languages (Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Odia, Punjabi, Assamese, Indian English). Sub-350ms first-packet latency. Word Error Rate (WER) < 7.2% on medical terminology.",
          clinicalFunction: "Transcribes low-literacy patient speech, phonetic variants of drug names and regional symptom descriptors into canonical clinical terms.",
          standard: "ISO/IEC 2382-37, Bhashini ULCA Schema"
        },
        {
          subsystem: "Dialogue Manager & Adaptive Questioning",
          techStack: "Clinical State Machine (Hierarchical Finite State Automaton + Graph RAG) constrained by Medical Ontology Engine",
          specifications: "Executes SOCRATES clinical reasoning tree (Site, Onset, Character, Radiation, Associations, Timing, Exacerbating/relieving, Severity) for allopathy; branches dynamically based on prior responses and chief complaint probability.",
          clinicalFunction: "Prevents conversational hallucinations; systematically gathers complete History of Present Illness (HPI) without redundant questioning.",
          standard: "SNOMED-CT Clinical Finding Hierarchy, ICD-10-CM"
        },
        {
          subsystem: "Dual-Mode Touch Interface",
          techStack: "Touch-first Responsive UI Web Framework with high-contrast, large tap-targets (minimum 64x64px)",
          specifications: "Every voice question displays synchronised pictorial & multi-choice option chips with bilingual text. Zero forced typing required.",
          clinicalFunction: "Permits patients in noisy OPD waiting halls or with speech/hearing impairment to navigate the entire consultation history seamlessly.",
          standard: "WCAG 2.1 AAA Accessibility, Ayushman Bharat Kiosk Usability Guidelines"
        },
        {
          subsystem: "AYUSH Dashavidha Pariksha Engine",
          techStack: "Ayurvedic Diagnostic Ontology Engine mapped to Central Council for Research in Ayurvedic Sciences (CCRAS) protocols",
          specifications: "Evaluates 10 clinical parameters: Prakriti, Vikriti, Sara, Samhanana, Pramana, Satmya, Sattva, Ahara Shakti, Vyayama Shakti, and Vaya, combined with Ahara-Vihara (dietary/lifestyle) assessment.",
          clinicalFunction: "Enables specialized Ayurvedic and Integrative OPDs to record deep constitutional profiling before doctor consultation.",
          standard: "NAMASTE Portal (National AYUSH Morbidity & Standardized Terminologies Electronic portal)"
        },
        {
          subsystem: "Red-Flag Emergency Detector",
          techStack: "Deterministic Rule Engine + Real-time Semantic Inference Classifier (BERT-Med-Triage)",
          specifications: "Zero-latency evaluation (< 50ms) scanning for acute MI, ischemic stroke, acute respiratory distress, severe septic shock, or anaphylaxis.",
          clinicalFunction: "Immediately halts routine questionnaire queueing; triggers siren audio, screen flash, prints Priority-1 Red Token, and routes instant notification to emergency triage desk.",
          standard: "Emergency Severity Index (ESI Level 1 & 2), Manchester Triage System"
        },
        {
          subsystem: "Text-to-Speech (TTS)",
          techStack: "IndicTTS / Coqui XTTS-v2 with warm, empathetic Indian healthcare voice personas",
          specifications: "Natural conversational inflection in regional dialects, 22kHz sampling, offline fallback cached audio prompts for critical questions.",
          clinicalFunction: "Guides illiterate or visually impaired patients through every screen with clear verbal instructions.",
          standard: "W3C SSML (Speech Synthesis Markup Language)"
        }
      ]
    },
    {
      id: "module_b",
      code: "Module B",
      name: "Medical Document Digitization & Intelligence",
      tagline: "Multilingual OCR, clinical entity extraction, chronological timeline & abnormal alert system",
      components: [
        {
          subsystem: "Document Ingestion & Image Preprocessing",
          techStack: "Computer Vision Pipeline: OpenCV + Document Perspective Correction, Adaptive Binarization, Shadow Removal, DPI Normalization",
          specifications: "Processes flatbed scanner inputs, phone camera uploads, and multipage PDFs. Corrects skewed doctor slips up to 45 degrees.",
          clinicalFunction: "Ensures crinkled, faded, or low-light physical documents are cleaned prior to neural OCR recognition.",
          standard: "DICOM-compatible rasterization, PDF/A-1b archiving"
        },
        {
          subsystem: "Multilingual Hybrid OCR (Handwritten & Printed)",
          techStack: "LayoutLMv3 Multimodal Document AI + Microsoft TrOCR (Transformer OCR) fine-tuned on handwritten Indian prescription datasets",
          specifications: "Dual-pass recognition: Form/Table layout parsing + character-level sequence recognition for cursive medical handwriting. Character accuracy > 92% on doctor handwriting; > 99.4% on printed lab reports.",
          clinicalFunction: "Digitizes prior prescriptions, lab reports, discharge summaries, and surgical notes written in English, Hindi, and regional scripts.",
          standard: "HAPI FHIR DocumentReference, LOINC Attachment Specs"
        },
        {
          subsystem: "Clinical Entity Extraction & Normalization",
          techStack: "BioClinicalBERT / Med-NER fine-tuned with Spacy-Clinical entity models",
          specifications: "Extracts Diagnoses, Medication Names, Dosages, Frequencies, Routes, Lab Investigation Names, Observed Numerical Values, Reference Ranges, and Surgical Procedures.",
          clinicalFunction: "Maps vernacular and shorthand medical terms (e.g. 'Tab Telma 40 OD' -> Telmisartan 40mg Oral Once Daily; 'Sugar Fasting' -> LOINC 1558-6).",
          standard: "SNOMED CT, RxNorm / Indian Pharmacopoeia, LOINC"
        },
        {
          subsystem: "Chronological Medical Timeline Engine",
          techStack: "Temporal Event Parser & Knowledge Graph Builder (NetworkX / Neo4j schema)",
          specifications: "Extracts historical timestamps from multiple disparate documents and arranges past admissions, surgeries, and prescriptions into a linear interactive timeline.",
          clinicalFunction: "Provides the physician with an instant 30-second retrospective of the patient's multi-year medical journey.",
          standard: "FHIR R4 EpisodeOfCare, CarePlan"
        },
        {
          subsystem: "Abnormal Value & Drug Interaction Flagging",
          techStack: "Automated Reference Range Evaluator + Clinical Decision Support System (CDSS) Rule Engine",
          specifications: "Compares lab values against biological reference ranges and flags CRITICAL HIGH / LOW in amber/red. Cross-references active medications against drug-drug interaction matrix.",
          clinicalFunction: "Prevents medical errors, warns of hyperkalemia, acute kidney injury, or dangerous drug combinations (e.g. Metformin + contrast, DAPT bleeding risks).",
          standard: "FHIR DetectedIssue, LOINC Interpretation Codes"
        }
      ]
    },
    {
      id: "module_c",
      code: "Module C",
      name: "Structured History Summary Generator",
      tagline: "Physician-ready standard clinical summary delivered in seconds to consultation screen",
      components: [
        {
          subsystem: "Multi-Source Clinical History Synthesizer",
          techStack: "Fine-tuned Clinical LLM (Llama-3-Med / Med-PaLM 2) with Constrained Output Decoding & Guardrails",
          specifications: "Synthesizes conversational responses from Module A + extracted document timeline from Module B into a cohesive, structured clinical narrative.",
          clinicalFunction: "Transforms colloquial patient complaints into formal medical terminology without losing subtle nuance or subjective patient context.",
          standard: "HL7 CDA (Clinical Document Architecture), FHIR Composition"
        },
        {
          subsystem: "Standard Clinical Summary Formatter",
          techStack: "Structured Schema Renderer (JSON-LD to Responsive Clinical Card UI)",
          specifications: "Enforces strict physician hierarchy: 1. Chief Complaint; 2. History of Present Illness (HPI - SOCRATES); 3. Past Medical & Surgical History; 4. Medication & Allergy History; 5. Family History; 6. Personal & Social History; 7. Review of Systems (ROS); 8. Prior Investigations Summary.",
          clinicalFunction: "Standardizes clinical documentation across entire hospital network; enables doctor to grasp complete clinical picture in under 15 seconds.",
          standard: "EHR Standards for India (MoHFW), SNOMED CT Core Set"
        },
        {
          subsystem: "Physician Review & Interactive Editor",
          techStack: "Real-time Collaborative State Sync (WebSockets / SSE) with inline WYSIWYG clinical annotation",
          specifications: "The AI summary is presented as an editable DRAFT. The physician retains full clinical authority to accept, modify, amend, or reject any finding with one click.",
          clinicalFunction: "Guarantees medico-legal compliance: AI acts as an assistive scribe, never as an autonomous diagnostic authority.",
          standard: "MCI/NMC Code of Medical Ethics, DPDP Act 2023 Auditing"
        },
        {
          subsystem: "Bilingual Presentation Engine",
          techStack: "Neural Machine Translation (NMT - IndicTrans2) + Multilingual Rendering Engine",
          specifications: "Patient receives audio-visual confirmation of recorded symptoms in their chosen native language; physician simultaneously sees standardized English/Hindi summary.",
          clinicalFunction: "Bridges language divide between regional-speaking patients and doctors in national or tertiary healthcare institutions.",
          standard: "ISO 639-3 Language Codes, Bhashini ULCA"
        }
      ]
    },
    {
      id: "module_d",
      code: "Module D",
      name: "Consent, Privacy & ABDM Integration",
      tagline: "DPDP Act 2023 compliance, ABHA authentication, FHIR R4 push and zero-retention privacy",
      components: [
        {
          subsystem: "ABHA Authentication & Registration",
          techStack: "National Health Authority (NHA) ABDM M1 Gateway API Integration (REST / OAuth 2.0)",
          specifications: "Supports ABHA Number (14-digit), ABHA Address (xyz@abdm), Aadhaar Demo-Auth OTP, and ABHA QR Scan via Ayushman Bharat Health App.",
          clinicalFunction: "Provides verified, tamper-proof patient identification and links consultation data to citizen's lifelong electronic health record.",
          standard: "ABDM Milestone 1 (M1) Specification, UIDAI Aadhaar Auth 2.5"
        },
        {
          subsystem: "DPDP 2023 Audio-Guided Consent Manager",
          techStack: "Granular Consent Engine (FHIR Consent Resource) with Multilingual Audio Explanation",
          specifications: "Explains data collection purpose, storage duration, and sharing scope through clear spoken audio for low-literacy patients. Grants revocable, purpose-limited consent.",
          clinicalFunction: "Full compliance with Digital Personal Data Protection Act (DPDP) 2023, protecting patients' fundamental privacy rights.",
          standard: "DPDP Act 2023, MeitY Data Protection Guidelines, ISO 27701"
        },
        {
          subsystem: "HIS / EMR Push & FHIR R4 Bundle Generator",
          techStack: "HAPI FHIR R4 Engine + HL7 v2 / REST Bridge for Hospital Information Systems",
          specifications: "Serializes structured summary into standard FHIR R4 Bundle containing Encounter, Condition, Observation, AllergyIntolerance, and MedicationStatement resources.",
          clinicalFunction: "Directly populates hospital EMR (Cerner, Epic, Akhil, Amrita HIS, e-Hospital) before patient steps into consultation chamber.",
          standard: "HL7 FHIR R4, ABDM Milestone 2 (M2) HIP/HIU Data Exchange"
        },
        {
          subsystem: "Zero-Retention Ephemeral Session Lifecycle",
          techStack: "Cryptographic Memory Purge + Local Storage Wiper with SHA-256 Audit Signing",
          specifications: "Temporary voice recordings, camera buffers, and intermediate OCR files are purged immediately upon handshake confirmation from HIS.",
          clinicalFunction: "Guarantees no residual identifiable personal or health data remains on the public-facing kiosk terminal.",
          standard: "DPDP Section 8 (Storage Limitation), CERT-In Security Guidelines"
        }
      ]
    }
  ]
};
