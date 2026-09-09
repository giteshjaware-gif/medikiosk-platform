/**
 * MediKiosk Platform - Adaptive Conversational History Engine (Module A)
 * Implements SOCRATES clinical reasoning tree, AYUSH Dashavidha Pariksha, and Red-Flag Emergency Triage
 */

class ConversationEngine {
  constructor(voiceEngine) {
    this.voiceEngine = voiceEngine;
    this.mode = 'allopathy'; // 'allopathy' or 'ayush'
    this.activeComplaint = 'chest_pain';
    this.currentQuestionIndex = 0;
    this.patientAnswers = {};
    this.onRedFlagDetected = null;
    this.onQuestionChange = null;
    this.onInterviewComplete = null;

    // SOCRATES Tree for Chest Pain (Mirroring Physician Clinical Reasoning)
    this.socratesChestPain = [
      {
        id: "site",
        socratesLetter: "S",
        title: "Site (स्थान / இடம்)",
        prompt: {
          en: "Where exactly is the discomfort or pain located?",
          hi: "दर्द या बेचैनी मुख्य रूप से छाती में किस जगह पर महसूस हो रही है?",
          ta: "வலி சரியாக எந்த இடத்தில் உள்ளது?"
        },
        options: [
          { key: "retrosternal", label: "Central Retrosternal (छाती के ठीक बीच में)", tag: "Central substernal", redFlagScore: 2 },
          { key: "left_precordium", label: "Left Chest (बाईं ओर)", tag: "Left precordial", redFlagScore: 2 },
          { key: "right_chest", label: "Right Chest (दाईं ओर)", tag: "Right hemithorax", redFlagScore: 0 },
          { key: "epigastric", label: "Upper Stomach / Epigastric (पेट के ऊपरी हिस्से में)", tag: "Epigastric region", redFlagScore: 1 }
        ]
      },
      {
        id: "onset",
        socratesLetter: "O",
        title: "Onset (आरंभ / ஆரம்பம்)",
        prompt: {
          en: "Did the pain start suddenly, or did it develop gradually?",
          hi: "क्या यह दर्द अचानक शुरू हुआ था, या धीरे-धीरे बढ़ रहा है?",
          ta: "வலி திடீரெனத் தொடங்கியதா அல்லது படிப்படியாக அதிகரித்ததா?"
        },
        options: [
          { key: "sudden_severe", label: "Sudden & Abrupt (< 5 mins) (अचानक तीव्र गति से)", tag: "Acute sudden onset", redFlagScore: 2 },
          { key: "on_exertion", label: "Triggered by walking / stairs (चलने या सीढ़ियाँ चढ़ने पर)", tag: "Exertional onset", redFlagScore: 2 },
          { key: "gradual_hours", label: "Gradual over several hours / days (धीरे-धीरे कई घंटों में)", tag: "Subacute onset", redFlagScore: 0 },
          { key: "post_meal", label: "After heavy / spicy meal (खाना खाने के बाद)", tag: "Post-prandial onset", redFlagScore: 0 }
        ]
      },
      {
        id: "character",
        socratesLetter: "C",
        title: "Character (प्रकृति / தன்மை)",
        prompt: {
          en: "How would you describe the feeling of the pain?",
          hi: "आप दर्द का अहसास कैसे व्यक्त करेंगे?",
          ta: "வலியை எவ்வாறு விவரிக்கிறீர்கள்?"
        },
        options: [
          { key: "crushing_pressure", label: "Heavy crushing pressure like a weight (भारी दबाव या जकड़न)", tag: "Crushing/heaviness", redFlagScore: 3 },
          { key: "sharp_stabbing", label: "Sharp stabbing like needle (सुई चुभने जैसा तेज़ दर्द)", tag: "Sharp pleuritic", redFlagScore: 0 },
          { key: "burning_heartburn", label: "Burning / Acid heartburn (जलन जैसा अहसास)", tag: "Retrosternal burning", redFlagScore: 0 },
          { key: "dull_ache", label: "Dull ache (हल्का लगातार मीठा दर्द)", tag: "Dull aching discomfort", redFlagScore: 1 }
        ]
      },
      {
        id: "radiation",
        socratesLetter: "R",
        title: "Radiation (फैलाव / பரவல்)",
        prompt: {
          en: "Does the pain radiate or travel anywhere else?",
          hi: "क्या यह दर्द शरीर में कहीं और, जैसे बाएं हाथ या जबड़े में फैल रहा है?",
          ta: "வலி இடது கை அல்லது தாடை வரை பரவுகிறதா?"
        },
        options: [
          { key: "left_arm_jaw", label: "Yes, to Left Arm, Neck or Jaw (हाँ, बाएं हाथ, गर्दन या जबड़े तक)", tag: "Radiation to left arm & jaw", redFlagScore: 3 },
          { key: "back_scapula", label: "Yes, to Back / between shoulder blades (पीठ में पीछे की ओर)", tag: "Radiation to interscapular region", redFlagScore: 2 },
          { key: "no_radiation", label: "No, stays localized in one spot (नहीं, केवल छाती में ही रहता है)", tag: "Localized non-radiating", redFlagScore: 0 }
        ]
      },
      {
        id: "associations",
        socratesLetter: "A",
        title: "Associated Symptoms (संबद्ध लक्षण / பிற அறிகுறிகள்)",
        prompt: {
          en: "Are you having cold sweating, breathlessness, or nausea?",
          hi: "क्या आपको ठंडा पसीना, सांस फूलना या चक्कर जैसा लग रहा है?",
          ta: "குளிர்ந்த வியர்வை அல்லது மூச்சுத்திணறல் உள்ளதா?"
        },
        options: [
          { key: "sweat_and_dyspnoea", label: "Cold sweating & Shortness of breath (ठंडा पसीना + सांस फूलना)", tag: "Diaphoresis & Dyspnoea", redFlagScore: 4 },
          { key: "dyspnoea_only", label: "Shortness of breath only (केवल सांस फूल रही है)", tag: "Exertional dyspnoea", redFlagScore: 2 },
          { key: "nausea_dizziness", label: "Nausea & Lightheadedness (जी मिचलाना और चक्कर)", tag: "Nausea & presyncope", redFlagScore: 1 },
          { key: "no_associations", label: "None of these (इनमें से कोई नहीं)", tag: "No vegetative symptoms", redFlagScore: 0 }
        ]
      },
      {
        id: "time_course",
        socratesLetter: "T",
        title: "Timing & Course (समय अवधि / கால அளவு)",
        prompt: {
          en: "How long has this current episode lasted?",
          hi: "यह दर्द कितनी देर से लगातार बना हुआ है?",
          ta: "இந்த வலி எவ்வளவு நேரமாக நீடிக்கிறது?"
        },
        options: [
          { key: "continuous_gt_30m", label: "Continuous for > 30 minutes (लगातार 30 मिनट से अधिक समय से)", tag: "Continuous > 30 min duration", redFlagScore: 3 },
          { key: "brief_transient", label: "Brief spells of 2 to 10 minutes (2 से 10 मिनट के दौरे)", tag: "Transient intermittent episodes", redFlagScore: 1 },
          { key: "intermittent_days", label: "Comes and goes for several days (कई दिनों से रुक-रुक कर आ रहा है)", tag: "Chronic intermittent duration", redFlagScore: 0 }
        ]
      },
      {
        id: "exacerbating",
        socratesLetter: "E",
        title: "Exacerbating & Relieving Factors (घटाने-बढ़ाने वाले कारक)",
        prompt: {
          en: "Does anything make the pain better or worse?",
          hi: "क्या आराम करने से दर्द घटता है, या सांस लेने से बढ़ता है?",
          ta: "ஓய்வெடுப்பது வலியை குறைக்கிறதா?"
        },
        options: [
          { key: "worse_exertion_relieved_rest", label: "Worse on exertion, relieved by rest (चलने पर बढ़ता है, बैठने पर आराम)", tag: "Typical anginal pattern", redFlagScore: 2 },
          { key: "no_relief_rest", label: "Persistent even at absolute rest (आराम करने पर भी लगातार बना है)", tag: "Pain at rest", redFlagScore: 3 },
          { key: "worse_deep_breath", label: "Worse with deep breath or cough (गहरी सांस या खांसने पर बढ़ता है)", tag: "Pleuritic exacerbation", redFlagScore: 0 },
          { key: "relieved_antacid", label: "Relieved by antacids or water (एंटासिड दवा या पानी से आराम)", tag: "Acid-related relief", redFlagScore: 0 }
        ]
      },
      {
        id: "severity",
        socratesLetter: "S",
        title: "Severity (तीव्रता / తీవ్రత 1-10)",
        prompt: {
          en: "On a scale of 1 to 10, how severe is the pain right now?",
          hi: "1 से 10 के पैमाने पर आप इस दर्द को कितना तीव्र आंकेंगे?",
          ta: "1 முதல் 10 என்ற அளவில் வலி எவ்வளவு அதிகமாக உள்ளது?"
        },
        options: [
          { key: "sev_extreme", label: "9 - 10: Excruciating / Unbearable (असहनीय तीव्र दर्द)", tag: "Pain 9-10/10", redFlagScore: 3 },
          { key: "sev_severe", label: "7 - 8: Severe (काफी गंभीर दर्द)", tag: "Pain 7-8/10", redFlagScore: 2 },
          { key: "sev_moderate", label: "4 - 6: Moderate (मध्यम दर्द)", tag: "Pain 4-6/10", redFlagScore: 1 },
          { key: "sev_mild", label: "1 - 3: Mild Discomfort (हल्की बेचैनी)", tag: "Pain 1-3/10", redFlagScore: 0 }
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
          en: "How long have you had this cough and fever?",
          hi: "आपको यह खांसी और बुखार कितने दिनों से है?",
          ta: "இருமல் எத்தனை நாட்களாக உள்ளது?"
        },
        options: [
          { key: "dur_acute", label: "< 3 Days (3 दिन से कम)", tag: "Acute duration < 3 days", redFlagScore: 0 },
          { key: "dur_subacute", label: "1 to 2 Weeks (1 से 2 सप्ताह)", tag: "Subacute 1-2 weeks", redFlagScore: 0 },
          { key: "dur_chronic_tb", label: "> 3 Weeks (3 सप्ताह से अधिक - TB स्क्रीनिंग आवश्यक)", tag: "Chronic > 3 weeks", redFlagScore: 1 }
        ]
      },
      {
        id: "sputum",
        socratesLetter: "C",
        title: "Character of Sputum (बलगम का प्रकार)",
        prompt: {
          en: "Is the cough dry, or is there phlegm/blood?",
          hi: "क्या सूखी खांसी है, या बलगम/खून आ रहा है?",
          ta: "சளியில் இரத்தம் வருகிறதா?"
        },
        options: [
          { key: "hemoptysis", label: "Blood in Sputum (बलगम में खून - हेमोप्टाइसिस)", tag: "Hemoptysis present", redFlagScore: 3 },
          { key: "purulent", label: "Thick yellowish-green phlegm (पीला/हरा गाढ़ा बलगम)", tag: "Purulent productive cough", redFlagScore: 1 },
          { key: "dry", label: "Dry irritating cough (सूखी खांसी)", tag: "Non-productive dry cough", redFlagScore: 0 }
        ]
      },
      {
        id: "breathing_difficulty",
        socratesLetter: "A",
        title: "Breathing Difficulty (सांस लेने में परेशानी)",
        prompt: {
          en: "Are you struggling to breathe or feeling chest congestion?",
          hi: "क्या आपको सांस लेने में कठिनाई या घरघराहट महसूस हो रही है?",
          ta: "மூச்சுத் திணறல் உள்ளதா?"
        },
        options: [
          { key: "severe_stridor", label: "Severe difficulty at rest / blue lips (आराम में भी सांस फूलना)", tag: "Resting respiratory distress", redFlagScore: 4 },
          { key: "mild_wheeze", label: "Mild breathlessness on walking (चलने पर हल्की सांस फूलना)", tag: "Exertional dyspnoea", redFlagScore: 1 },
          { key: "none", label: "Breathing normally (सांस सामान्य है)", tag: "No respiratory distress", redFlagScore: 0 }
        ]
      }
    ];

    // Load AYUSH Dashavidha Pariksha questions from ontologies
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
    if (this.mode === 'ayush') {
      return this.ayushQuestions;
    }
    if (this.activeComplaint === 'cough_fever') {
      return this.socratesCoughFever;
    }
    return this.socratesChestPain;
  }

  getCurrentQuestion() {
    const list = this.getQuestionsList();
    if (this.currentQuestionIndex >= list.length) {
      return null;
    }
    return list[this.currentQuestionIndex];
  }

  recordAnswer(optionKey, freeTextVoice = null) {
    const q = this.getCurrentQuestion();
    if (!q) return;

    let selectedOption = null;
    if (this.mode === 'allopathy') {
      selectedOption = q.options.find(o => o.key === optionKey) || q.options[0];
    } else {
      selectedOption = q.options.find(o => o.label.includes(optionKey)) || q.options[0];
    }

    this.patientAnswers[q.id] = {
      questionId: q.id,
      title: q.title,
      selectedKey: optionKey,
      selectedLabel: selectedOption.label,
      clinicalTag: selectedOption.tag || selectedOption.traits || selectedOption.label,
      redFlagScore: selectedOption.redFlagScore || 0,
      freeTextVoice: freeTextVoice || null
    };

    // Check for Red Flag Emergency Condition in Allopathy
    if (this.mode === 'allopathy') {
      const redFlagAssessment = this.evaluateRedFlag();
      if (redFlagAssessment.isEmergency) {
        if (this.onRedFlagDetected) {
          this.onRedFlagDetected(redFlagAssessment);
          return;
        }
      }
    }

    // Advance to next question
    this.currentQuestionIndex++;
    const nextQ = this.getCurrentQuestion();
    if (nextQ) {
      if (this.onQuestionChange) {
        this.onQuestionChange(nextQ);
      }
    } else {
      if (this.onInterviewComplete) {
        this.onInterviewComplete(this.patientAnswers);
      }
    }
  }

  evaluateRedFlag() {
    let totalScore = 0;
    let reasons = [];

    const ans = this.patientAnswers;

    // Direct clinical rules for MI / ACS:
    const isCrushing = ans['character'] && (ans['character'].selectedKey === 'crushing_pressure');
    const isRadiating = ans['radiation'] && (ans['radiation'].selectedKey === 'left_arm_jaw');
    const hasSweatDyspnoea = ans['associations'] && (ans['associations'].selectedKey === 'sweat_and_dyspnoea');
    const hasSevereStridor = ans['breathing_difficulty'] && (ans['breathing_difficulty'].selectedKey === 'severe_stridor');
    const hasHemoptysis = ans['sputum'] && (ans['sputum'].selectedKey === 'hemoptysis');

    Object.values(ans).forEach(a => {
      totalScore += (a.redFlagScore || 0);
    });

    if (isCrushing && (isRadiating || hasSweatDyspnoea)) {
      reasons.push("Crushing chest pain radiating to left arm/jaw with autonomic sweating (High probability Acute STEMI/ACS)");
      return {
        isEmergency: true,
        urgency: "PRIORITY 1 - IMMEDIATE RESUSCITATION BAY",
        code: "RED-ALERT-ACS",
        reasons: reasons,
        action: "Bypass routine queue. Immediate transfer to Emergency Room. Activate 12-lead ECG & Cath Lab standby."
      };
    }

    if (hasSevereStridor) {
      reasons.push("Acute respiratory distress with impending respiratory failure");
      return {
        isEmergency: true,
        urgency: "PRIORITY 1 - CRITICAL AIRWAY",
        code: "RED-ALERT-RESP",
        reasons: reasons,
        action: "Immediate oxygenation, nebulization standby, emergency physician bedside triage."
      };
    }

    if (totalScore >= 8) {
      reasons.push("Cumulative high clinical severity score across multiple SOCRATES vectors (" + totalScore + " points)");
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
