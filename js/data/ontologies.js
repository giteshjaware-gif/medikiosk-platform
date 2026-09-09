/**
 * MediKiosk Platform - Medical Ontologies, Coding Systems & Clinical Rules
 * Supports Allopathy (SNOMED-CT, ICD-10, LOINC) & AYUSH (Dashavidha Pariksha, NAMASTE)
 */

window.MEDIKIOSK_ONTOLOGIES = {
  // Common Chief Complaints with SNOMED CT & ICD-10
  complaints: {
    chest_pain: {
      id: "chest_pain",
      name: "Chest Pain / छाती में दर्द / மார்பு வலி",
      snomed: "29857009",
      snomedDisplay: "Chest pain (finding)",
      icd10: "R07.9",
      category: "Cardiovascular / Respiratory",
      isEmergencyCandidate: true,
      defaultQuestions: ["site", "onset", "character", "radiation", "associations", "time_course", "exacerbating", "severity"]
    },
    cough_fever: {
      id: "cough_fever",
      name: "Persistent Cough & Fever / खांसी और बुखार / இருமல் மற்றும் காய்ச்சல்",
      snomed: "49727002",
      snomedDisplay: "Cough (finding) / Fever (finding)",
      icd10: "R05, R50.9",
      category: "Respiratory / Infectious",
      isEmergencyCandidate: false,
      defaultQuestions: ["duration", "character_cough", "fever_grade", "sputum", "breathing_difficulty", "exposures"]
    },
    abdominal_pain: {
      id: "abdominal_pain",
      name: "Severe Abdominal Pain / पेट में तेज़ दर्द / வயிற்று வலி",
      snomed: "21522000",
      snomedDisplay: "Abdominal pain (finding)",
      icd10: "R10.9",
      category: "Gastroenterology",
      isEmergencyCandidate: true,
      defaultQuestions: ["quadrant", "onset", "relation_food", "bowel_movements", "vomiting", "severity"]
    },
    joint_pain: {
      id: "joint_pain",
      name: "Joint Pain & Stiffness / जोड़ों में दर्द और अकड़न / மூட்டு வலி",
      snomed: "57676002",
      snomedDisplay: "Joint pain (finding)",
      icd10: "M25.50",
      category: "Rheumatology / Musculoskeletal",
      isEmergencyCandidate: false,
      defaultQuestions: ["joints_involved", "morning_stiffness", "swelling", "mobility", "duration"]
    }
  },

  // LOINC codes for laboratory investigations
  loinc: {
    "HbA1c": { code: "4548-4", unit: "%", refMin: 4.0, refMax: 5.6, criticalHigh: 8.0 },
    "Fasting Blood Sugar": { code: "1558-6", unit: "mg/dL", refMin: 70, refMax: 99, criticalHigh: 180 },
    "Serum Creatinine": { code: "2160-0", unit: "mg/dL", refMin: 0.7, refMax: 1.3, criticalHigh: 2.0 },
    "Total Cholesterol": { code: "2093-3", unit: "mg/dL", refMin: 120, refMax: 199, criticalHigh: 240 },
    "LDL Cholesterol": { code: "13457-7", unit: "mg/dL", refMin: 50, refMax: 99, criticalHigh: 160 },
    "HDL Cholesterol": { code: "2085-9", unit: "mg/dL", refMin: 40, refMax: 60, criticalLow: 35 },
    "Triglycerides": { code: "2571-8", unit: "mg/dL", refMin: 50, refMax: 149, criticalHigh: 300 },
    "Hemoglobin": { code: "718-7", unit: "g/dL", refMin: 12.0, refMax: 16.0, criticalLow: 8.0 },
    "WBC Count": { code: "6690-2", unit: "cells/mcL", refMin: 4000, refMax: 11000, criticalHigh: 16000 }
  },

  // AYUSH Dashavidha Pariksha (10-fold clinical Ayurvedic examination framework)
  ayushDashavidha: [
    {
      id: "prakriti",
      title: "1. Prakriti (प्रकृति - Constitutional Bio-type)",
      description: "Baseline physical and mental constitution determined by dominant Tridoshas (Vata, Pitta, Kapha).",
      options: [
        { label: "Vata Dominant (वात प्रधान)", traits: "Thin frame, dry skin, hyperactive, variable appetite, prefers warmth", dosha: "Vata" },
        { label: "Pitta Dominant (पित्त प्रधान)", traits: "Medium build, warm body, sharp intellect, strong appetite, sensitive to heat", dosha: "Pitta" },
        { label: "Kapha Dominant (कफ प्रधान)", traits: "Broad robust frame, oily smooth skin, calm demeanor, slow steady digestion", dosha: "Kapha" },
        { label: "Vata-Pitta Dwandwaja (वात-पित्त द्वन्द्वज)", traits: "Mixed characteristics of fast metabolism and heat sensitivity", dosha: "Vata-Pitta" }
      ]
    },
    {
      id: "vikriti",
      title: "2. Vikriti (विकृति - Current Morbidity / Imbalance)",
      description: "Current pathological aberration from the baseline constitutional state.",
      options: [
        { label: "Vata Dushti (वात प्रकोप)", symptoms: "Tremor, body ache, dry skin, restlessness, constipation" },
        { label: "Pitta Dushti (पित्त प्रकोप)", symptoms: "Acid reflux, burning sensation, excessive thirst, irritability" },
        { label: "Kapha Dushti (कफ प्रकोप)", symptoms: "Lethargy, heaviness in chest, sluggish metabolism, mucoid discharge" },
        { label: "Sama Dosha (साम दोष)", symptoms: "Accumulated Ama (toxins) with coated tongue and loss of taste" }
      ]
    },
    {
      id: "sara",
      title: "3. Sara (सार - Tissue Essence & Constitutional Strength)",
      description: "Qualitative excellence of the 7 Dhatus (Rasa, Rakta, Mamsa, Meda, Asthi, Majja, Shukra).",
      options: [
        { label: "Pravara Sara (उत्कृष्ट सार - High Tissue Integrity)", score: "High vitality and robust immune resilience" },
        { label: "Madhyama Sara (मध्यम सार - Moderate Tissue Quality)", score: "Average disease resistance and stability" },
        { label: "Avara Sara (हीन सार - Low Tissue Integrity)", score: "Prone to rapid tissue depletion and fatigue" }
      ]
    },
    {
      id: "samhanana",
      title: "4. Samhanana (संहनन - Body Compactness & Symmetry)",
      description: "Musculoskeletal density, joint cohesion, and skeletal firmness.",
      options: [
        { label: "Susamhata (सुसंहत - Well-compacted, symmetrical bones & joints)" },
        { label: "Madhyama Samhana (मध्यम संहनन - Moderately compact body frame)" },
        { label: "Hina Samhana (हीन संहनन - Loose joints, frail skeletal build)" }
      ]
    },
    {
      id: "pramana",
      title: "5. Pramana (प्रमाण - Anthropometric Proportions)",
      description: "Assessment of anatomical proportionality (Anguli Pramana / BMI & height-span balance).",
      options: [
        { label: "Yathavat Pramana (यथावत् प्रमाण - Ideal balanced body proportions)" },
        { label: "Ati-Sthula (अति स्थूल - Obese / Excessive medas tissue)" },
        { label: "Ati-Krisha (अति कृश - Emaciated / Underweight frame)" }
      ]
    },
    {
      id: "satmya",
      title: "6. Satmya (सात्म्य - Adaptability & Homologation)",
      description: "Wholesomeness and tolerance to diet, climates, and environmental stressors.",
      options: [
        { label: "Sarva-Rasa Satmya (सर्व रस सात्म्य - Can digest and thrive on all six tastes)" },
        { label: "Vyavashiti Satmya (मध्यम सात्म्य - Tolerates seasonal local foods only)" },
        { label: "Eka-Rasa Satmya (अवर सात्म्य - Food intolerances, sensitive digestion)" }
      ]
    },
    {
      id: "sattva",
      title: "7. Sattva (सत्त्व - Mental Stamina & Psychological Strength)",
      description: "Capacity of mind to endure pain, stress, diagnosis, and disciplined therapies.",
      options: [
        { label: "Pravara Sattva (प्रवर सत्त्व - High emotional resilience, resolute mental fortitude)" },
        { label: "Madhyama Sattva (मध्यम सत्त्व - Moderate tolerance, requires emotional reassurance)" },
        { label: "Avara Sattva (अवर सत्त्व - Low pain tolerance, high anxiety and dread)" }
      ]
    },
    {
      id: "ahara_shakti",
      title: "8. Ahara Shakti (आहार शक्ति - Digestive & Assimilation Capacity)",
      description: "Evaluation of Abhyavaharana Shakti (appetite capacity) and Jarana Shakti (digestive fire / Agni power).",
      options: [
        { label: "Tikshnagni (तीक्ष्णाग्नि - Intense hyper-metabolic digestion, frequent hunger)" },
        { label: "Mandagni (मन्दाग्नि - Sluggish metabolism, post-meal bloating, low appetite)" },
        { label: "Vishamagni (विषमाग्नि - Irregular digestion, erratic bowel movements)" },
        { label: "Samagni (समाग्नि - Balanced optimal digestion and timely evacuation)" }
      ]
    },
    {
      id: "vyayama_shakti",
      title: "9. Vyayama Shakti (व्यायाम शक्ति - Physical Endurance & Work Capacity)",
      description: "Capacity to engage in physical exertion, functional tasks, and sustained labor.",
      options: [
        { label: "Pravara Vyayama (उत्तम व्यायाम शक्ति - Can perform strenuous physical work without dyspnoea)" },
        { label: "Madhyama Vyayama (मध्यम व्यायाम शक्ति - Easily manages daily walking and moderate chores)" },
        { label: "Avara Vyayama (अल्प व्यायाम शक्ति - Early breathlessness and muscle weakness with minimal stairs)" }
      ]
    },
    {
      id: "vaya",
      title: "10. Vaya (वयस् - Biological Age & Developmental Stage)",
      description: "Chronological age mapped to Dhatus evolution (Balyavastha, Madhyamavastha, Vardhakyavastha).",
      options: [
        { label: "Bala (बाल - Growth & Kapha predominant stage, < 16 yrs)" },
        { label: "Madhyama (मध्यम - Prime vigor & Pitta predominant stage, 16 - 60 yrs)" },
        { label: "Vriddha (वृद्ध - Tissue depletion & Vata predominant stage, > 60 yrs)" }
      ]
    }
  ],

  // Drug-drug interactions detector
  drugInteractions: [
    {
      drugA: "Metformin",
      drugB: "Iodinated Contrast",
      severity: "CRITICAL",
      description: "Risk of lactic acidosis and acute renal failure. Must withhold Metformin 48h prior to contrast scan."
    },
    {
      drugA: "Aspirin",
      drugB: "Clopidogrel",
      severity: "MODERATE",
      description: "Dual Antiplatelet Therapy (DAPT) increases gastrointestinal and systemic bleeding risks. Requires gastroprotection (PPI)."
    },
    {
      drugA: "Telmisartan",
      drugB: "Spironolactone",
      severity: "HIGH",
      description: "Combined ARB and potassium-sparing diuretic significantly elevates risk of severe hyperkalemia."
    },
    {
      drugA: "Atorvastatin",
      drugB: "Clarithromycin",
      severity: "HIGH",
      description: "Strong CYP3A4 inhibitor increases Atorvastatin plasma concentrations, raising risk of rhabdomyolysis and myopathy."
    }
  ],

  // Red flag emergency rules
  redFlagRules: [
    {
      id: "rf_cardiac",
      triggerConditions: {
        complaint: "chest_pain",
        symptoms: ["crushing", "left_arm_radiation", "dyspnoea", "cold_sweating"]
      },
      title: "SUSPECTED ACUTE CORONARY SYNDROME / MI",
      description: "Central crushing chest pain radiating to left arm/jaw accompanied by diaphoresis and shortness of breath.",
      immediateAction: "Immediate Priority 1 Triage Transfer to Emergency Resuscitation Bay. Activate Cath Lab standby. Perform STAT 12-lead ECG.",
      triageLevel: "RED - PRIORITY 1"
    },
    {
      id: "rf_stroke",
      triggerConditions: {
        complaint: "neurological",
        symptoms: ["facial_droop", "arm_weakness", "slurred_speech"]
      },
      title: "SUSPECTED ACUTE ISCHEMIC STROKE",
      description: "Sudden onset focal neurological deficit matching FAST criteria.",
      immediateAction: "Emergency Stroke Code Activation. STAT Non-Contrast CT Brain. Check Blood Glucose.",
      triageLevel: "RED - PRIORITY 1"
    }
  ]
};
