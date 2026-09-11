/**
 * MediKiosk Platform - Adaptive Conversational History Engine (Module A - SIH Edition)
 * Implements SOCRATES Framework, AYUSH Dashavidha Pariksha, and Red-Flag Emergency Triage
 */

class ConversationEngine {
  constructor(voiceEngine) {
    this.voiceEngine = voiceEngine;
    this.mode = 'allopathy'; // 'allopathy' or 'ayush'
    this.activeComplaint = 'chest_pain';
    this.currentQuestionIndex = 0;
    this.patientAnswers = {};
    this.spokenTranscripts = [];
    this.extractedEntitiesList = [];
    this.onRedFlagDetected = null;
    this.onQuestionChange = null;
    this.onInterviewComplete = null;
    this.onVoiceParsed = null;

    // SOCRATES Tree for Chest Pain
    this.socratesChestPain = [
      {
        id: "site",
        socratesLetter: "S",
        title: "Site (स्थान / दर्द का केंद्र)",
        prompt: {
          hi: "कृपया मुझे बताएं, दर्द छाती में मुख्य रूप से किस जगह पर महसूस हो रहा है?",
          en: "Could you please tell me where exactly in the chest the discomfort is centered?"
        },
        options: [
          { key: "retrosternal", label: "छाती के ठीक बीच में / Central Retrosternal", tag: "Central substernal", redFlagScore: 2 },
          { key: "left_precordium", label: "बाईं तरफ / Left Precordial Chest", tag: "Left precordial", redFlagScore: 2 },
          { key: "right_chest", label: "दाईं तरफ / Right Chest", tag: "Right hemithorax", redFlagScore: 0 },
          { key: "epigastric", label: "पेट के ऊपरी हिस्से में / Upper Epigastric", tag: "Epigastric region", redFlagScore: 1 }
        ]
      },
      {
        id: "onset",
        socratesLetter: "O",
        title: "Onset (आरंभ / दर्द कैसे शुरू हुआ)",
        prompt: {
          hi: "क्या यह दर्द अचानक तीव्र गति से शुरू हुआ था, या धीरे-धीरे बढ़ रहा है?",
          en: "Did the discomfort start all of a sudden, or has it been building up gradually?"
        },
        options: [
          { key: "sudden_severe", label: "अचानक बहुत तीव्र (< 5 मिनट) / Sudden & Abrupt", tag: "Acute sudden onset", redFlagScore: 2 },
          { key: "on_exertion", label: "चलने या सीढ़ियां चढ़ने पर / Triggered by exertion", tag: "Exertional onset", redFlagScore: 2 },
          { key: "gradual_hours", label: "कई घंटों या दिनों में धीरे-धीरे / Gradual onset", tag: "Subacute onset", redFlagScore: 0 },
          { key: "post_meal", label: "खाना खाने के बाद / After heavy meal", tag: "Post-prandial onset", redFlagScore: 0 }
        ]
      },
      {
        id: "character",
        socratesLetter: "C",
        title: "Character (दर्द का प्रकार / अहसास)",
        prompt: {
          hi: "दर्द का अहसास कैसा लग रहा है? क्या कोई भारी दबाव, जलन या चुभन जैसा है?",
          en: "How does the pain feel? Is it a heavy squeezing pressure, sharp, or burning?"
        },
        options: [
          { key: "crushing_pressure", label: "छाती पर बहुत भारी दबाव या जकड़न / Heavy Crushing Weight", tag: "Crushing/heaviness", redFlagScore: 3 },
          { key: "sharp_stabbing", label: "सुई चुभने जैसा तेज़ दर्द / Sharp Pleuritic", tag: "Sharp pleuritic", redFlagScore: 0 },
          { key: "burning_heartburn", label: "तेज़ जलन या एसिडिटी / Burning Heartburn", tag: "Retrosternal burning", redFlagScore: 0 },
          { key: "dull_ache", label: "लगातार मीठा दर्द / Dull Persistent Ache", tag: "Dull aching discomfort", redFlagScore: 1 }
        ]
      },
      {
        id: "radiation",
        socratesLetter: "R",
        title: "Radiation (फैलाव / कहीं और दर्द जाना)",
        prompt: {
          hi: "क्या यह दर्द आपके बाएं हाथ, कंधे, गर्दन या जबड़े की तरफ फैल रहा है?",
          en: "Does the pain radiate or travel anywhere else, such as your left arm or jaw?"
        },
        options: [
          { key: "left_arm_jaw", label: "हाँ, बाएं हाथ, कंधे या जबड़े में / Yes, to Left Arm & Jaw", tag: "Radiation to left arm & jaw", redFlagScore: 3 },
          { key: "back_scapula", label: "पीठ में पीछे की ओर / Radiates to Back", tag: "Radiation to interscapular region", redFlagScore: 2 },
          { key: "no_radiation", label: "नहीं, केवल एक ही जगह रहता है / No, Stays Localized", tag: "Localized non-radiating", redFlagScore: 0 }
        ]
      },
      {
        id: "associations",
        socratesLetter: "A",
        title: "Associated Symptoms (संबद्ध लक्षण)",
        prompt: {
          hi: "क्या आपको ठंडा पसीना, सांस फूलना, चक्कर या घबराहट भी महसूस हो रही है?",
          en: "Are you having cold sweating, breathlessness, dizziness, or nausea?"
        },
        options: [
          { key: "sweat_and_dyspnoea", label: "ठंडा पसीना + सांस फूलना / Cold Sweat & Shortness of Breath", tag: "Diaphoresis & Dyspnoea", redFlagScore: 4 },
          { key: "dyspnoea_only", label: "केवल सांस फूल रही है / Shortness of Breath only", tag: "Exertional dyspnoea", redFlagScore: 2 },
          { key: "nausea_dizziness", label: "जी मिचलाना और चक्कर / Nausea & Lightheadedness", tag: "Nausea & presyncope", redFlagScore: 1 },
          { key: "no_associations", label: "इनमें से कोई नहीं / None of these", tag: "No vegetative symptoms", redFlagScore: 0 }
        ]
      },
      {
        id: "severity",
        socratesLetter: "S",
        title: "Severity (तीव्रता / 1 से 10 के पैमाने पर)",
        prompt: {
          hi: "1 से 10 के पैमाने पर आप इस दर्द को कितना तीव्र कहेंगे?",
          en: "On a scale of 1 to 10, how severe would you rate your discomfort right now?"
        },
        options: [
          { key: "sev_extreme", label: "9 - 10: बहुत असहनीय / Excruciating & Unbearable", tag: "Pain 9-10/10", redFlagScore: 3 },
          { key: "sev_severe", label: "7 - 8: गंभीर तीव्र दर्द / Severe Pain", tag: "Pain 7-8/10", redFlagScore: 2 },
          { key: "sev_moderate", label: "4 - 6: मध्यम दर्द / Moderate Discomfort", tag: "Pain 4-6/10", redFlagScore: 1 },
          { key: "sev_mild", label: "1 - 3: हल्का दर्द / Mild", tag: "Pain 1-3/10", redFlagScore: 0 }
        ]
      }
    ];

    // SOCRATES Tree for Persistent Cough & Fever
    this.socratesCoughFever = [
      {
        id: "cough_duration",
        socratesLetter: "T",
        title: "Duration (अवधि)",
        prompt: {
          hi: "आपको यह खांसी और बुखार कितने दिनों से है?",
          en: "How long have you had this cough and fever?"
        },
        options: [
          { key: "dur_acute", label: "3 दिन से कम / < 3 Days", tag: "Acute duration < 3 days", redFlagScore: 0 },
          { key: "dur_subacute", label: "1 से 2 सप्ताह / 1 to 2 Weeks", tag: "Subacute 1-2 weeks", redFlagScore: 0 },
          { key: "dur_chronic_tb", label: "3 सप्ताह से अधिक / > 3 Weeks (TB Screen)", tag: "Chronic > 3 weeks", redFlagScore: 1 }
        ]
      },
      {
        id: "sputum",
        socratesLetter: "C",
        title: "Sputum Character (बलगम का प्रकार)",
        prompt: {
          hi: "क्या सूखी खांसी है, या बलगम/खून आ रहा है?",
          en: "Is the cough dry, or is there phlegm/blood?"
        },
        options: [
          { key: "hemoptysis", label: "बलगम में खून (हेमोप्टाइसिस) / Blood in Sputum", tag: "Hemoptysis present", redFlagScore: 3 },
          { key: "purulent", label: "पीला या हरा गाढ़ा बलगम / Thick Purulent Phlegm", tag: "Purulent productive cough", redFlagScore: 1 },
          { key: "dry", label: "सूखी खांसी / Dry Cough", tag: "Non-productive dry cough", redFlagScore: 0 }
        ]
      },
      {
        id: "breathing_difficulty",
        socratesLetter: "A",
        title: "Breathing (सांस की स्थिति)",
        prompt: {
          hi: "क्या आपको सांस लेने में रुकावट या सीने में भारी घड़घड़ाहट लग रही है?",
          en: "Are you struggling to breathe or feeling severe chest congestion?"
        },
        options: [
          { key: "severe_stridor", label: "आराम करने पर भी सांस फूलना / Severe Resting Dyspnoea", tag: "Resting respiratory distress", redFlagScore: 4 },
          { key: "mild_wheeze", label: "हल्की घरघराहट / Mild Wheezing on walking", tag: "Exertional dyspnoea", redFlagScore: 1 },
          { key: "none", label: "सांस सामान्य है / Breathing Normally", tag: "No respiratory distress", redFlagScore: 0 }
        ]
      }
    ];

    this.ayushQuestions = window.MEDIKIOSK_ONTOLOGIES ? window.MEDIKIOSK_ONTOLOGIES.ayushDashavidha : [];
  }

  setMode(mode) {
    this.mode = mode;
    this.currentQuestionIndex = 0;
    this.patientAnswers = {};
    if (this.onQuestionChange) {
      this.onQuestionChange(this.getCurrentQuestion());
    }
  }

  setComplaint(complaintId) {
    this.activeComplaint = complaintId;
    this.currentQuestionIndex = 0;
    this.patientAnswers = {};
    if (this.onQuestionChange) {
      this.onQuestionChange(this.getCurrentQuestion());
    }
  }

  getQuestionsList() {
    if (this.mode === 'ayush') return this.ayushQuestions;
    if (this.activeComplaint === 'cough_fever') return this.socratesCoughFever;
    return this.socratesChestPain;
  }

  getCurrentQuestion() {
    const list = this.getQuestionsList();
    if (this.currentQuestionIndex >= list.length) return null;
    return list[this.currentQuestionIndex];
  }

  /**
   * Natural Language Symptom Extractor from Voice / Chat
   */
  parseSpokenVoiceInput(spokenText) {
    if (!spokenText) return;
    this.spokenTranscripts.push(spokenText);
    const lower = spokenText.toLowerCase();
    const extracted = [];

    // Check Chest Pain / Cardiac
    if (lower.includes('chest') || lower.includes('सीने') || lower.includes('छाती') || lower.includes('dard') || lower.includes('दर्द')) {
      extracted.push({ entity: 'Chief Complaint', value: 'Chest Pain / छाती में दर्द', snomed: '29857009' });
      this.patientAnswers['site'] = { questionId: 'site', selectedKey: 'retrosternal', clinicalTag: 'Central substernal chest', redFlagScore: 2 };
    }

    // Check Crushing / Heavy
    if (lower.includes('crush') || lower.includes('heavy') || lower.includes('दबाव') || lower.includes('भारी') || lower.includes('जकड़न')) {
      extracted.push({ entity: 'Character', value: 'Heavy Crushing Pressure / भारी दबाव', snomed: '279024001' });
      this.patientAnswers['character'] = { questionId: 'character', selectedKey: 'crushing_pressure', clinicalTag: 'Crushing/heaviness', redFlagScore: 3 };
    }

    // Check Left Arm / Jaw Radiation
    if (lower.includes('arm') || lower.includes('jaw') || lower.includes('बाएं हाथ') || lower.includes('हाथ') || lower.includes('जबड़े')) {
      extracted.push({ entity: 'Radiation', value: 'Left Arm & Jaw / बाएं हाथ में फैलाव', snomed: '417380004' });
      this.patientAnswers['radiation'] = { questionId: 'radiation', selectedKey: 'left_arm_jaw', clinicalTag: 'Radiation to left arm & jaw', redFlagScore: 3 };
    }

    // Check Cold Sweating / Dyspnoea
    if (lower.includes('sweat') || lower.includes('breath') || lower.includes('पसीना') || lower.includes('सांस') || lower.includes('सांस फूल')) {
      extracted.push({ entity: 'Associated Symptoms', value: 'Cold Sweating & Dyspnoea / ठंडा पसीना व सांस फूलना', snomed: '41569001' });
      this.patientAnswers['associations'] = { questionId: 'associations', selectedKey: 'sweat_and_dyspnoea', clinicalTag: 'Diaphoresis & Dyspnoea', redFlagScore: 4 };
    }

    // Check Cough & Fever
    if (lower.includes('cough') || lower.includes('fever') || lower.includes('खांसी') || lower.includes('बुखार')) {
      extracted.push({ entity: 'Chief Complaint', value: 'Persistent Productive Cough & Fever', snomed: '49727002' });
    }

    // Assign high severity if strong words
    if (lower.includes('बहुत तेज') || lower.includes('severe') || lower.includes('असहनीय') || lower.includes('terrible')) {
      extracted.push({ entity: 'Pain Severity', value: 'Severe 8-9/10 (High Intensity)' });
      this.patientAnswers['severity'] = { questionId: 'severity', selectedKey: 'sev_extreme', clinicalTag: 'Pain 9/10', redFlagScore: 3 };
    }

    this.extractedEntitiesList = extracted;

    if (this.onVoiceParsed) {
      this.onVoiceParsed(spokenText, extracted);
    }

    const redFlagAssessment = this.evaluateRedFlag();
    if (redFlagAssessment.isEmergency) {
      if (this.onRedFlagDetected) {
        this.onRedFlagDetected(redFlagAssessment);
      }
    }
  }

  recordAnswer(optionKey, freeTextVoice = null) {
    const q = this.getCurrentQuestion();
    if (!q) return;

    let selectedOption = q.options.find(o => o.key === optionKey) || q.options[0];

    this.patientAnswers[q.id] = {
      questionId: q.id,
      title: q.title,
      selectedKey: optionKey,
      selectedLabel: selectedOption.label,
      clinicalTag: selectedOption.tag || selectedOption.label,
      redFlagScore: selectedOption.redFlagScore || 0,
      freeTextVoice: freeTextVoice || null
    };

    if (this.mode === 'allopathy') {
      const redFlagAssessment = this.evaluateRedFlag();
      if (redFlagAssessment.isEmergency) {
        if (this.onRedFlagDetected) {
          this.onRedFlagDetected(redFlagAssessment);
          return;
        }
      }
    }

    this.currentQuestionIndex++;
    const nextQ = this.getCurrentQuestion();
    if (nextQ) {
      if (this.onQuestionChange) this.onQuestionChange(nextQ);
    } else {
      if (this.onInterviewComplete) this.onInterviewComplete(this.patientAnswers);
    }
  }

  evaluateRedFlag() {
    let totalScore = 0;
    let reasons = [];
    const ans = this.patientAnswers;

    const isCrushing = ans['character'] && ans['character'].selectedKey === 'crushing_pressure';
    const isRadiating = ans['radiation'] && ans['radiation'].selectedKey === 'left_arm_jaw';
    const hasSweatDyspnoea = ans['associations'] && ans['associations'].selectedKey === 'sweat_and_dyspnoea';

    Object.values(ans).forEach(a => {
      totalScore += (a.redFlagScore || 0);
    });

    if (isCrushing && (isRadiating || hasSweatDyspnoea)) {
      reasons.push("सीने में तीव्र भारी दबाव, बाएं हाथ में फैलाव और ठंडा पसीना (Acute STEMI/ACS Suspicion)");
      return {
        isEmergency: true,
        urgency: "PRIORITY 1 - IMMEDIATE RESUSCITATION BAY",
        code: "RED-ALERT-ACS",
        reasons: reasons,
        action: "Bypass routine queue. Immediate transfer to Emergency Room. Activate 12-lead ECG & Cath Lab standby."
      };
    }

    if (totalScore >= 7) {
      reasons.push("Cumulative high clinical severity score across multiple SOCRATES vectors");
      return {
        isEmergency: true,
        urgency: "PRIORITY 1 - HIGH SEVERITY",
        code: "RED-ALERT-SEVERITY",
        reasons: reasons,
        action: "Immediate priority nursing assessment and rapid ECG acquisition."
      };
    }

    return { isEmergency: false, totalScore };
  }
}

window.ConversationEngine = ConversationEngine;
