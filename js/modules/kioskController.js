/**
 * MediKiosk Platform - Kiosk Controller (SIH Edition)
 * Manages Split-Screen Check-In, Dr. Meera AI Assistant, Skip Identity,
 * Adaptive Interview, OCR Scanner & Printable OPD Token Receipt
 */

class KioskController {
  constructor(voiceEngine, conversationEngine, documentAIEngine, summarizer) {
    this.voiceEngine = voiceEngine;
    this.conversationEngine = conversationEngine;
    this.documentAIEngine = documentAIEngine;
    this.summarizer = summarizer;

    this.currentStep = 1; // 1: Login & Talk to MediKiosk, 2: Converse, 3: Scan, 4: Summary & Receipt
    this.patientProfile = {
      name: "Suresh Kumar",
      age: 54,
      gender: "Male",
      abhaId: "91-4521-8890-1234",
      mobile: "+91 98765 43210",
      language: "hi",
      isGuest: false,
      isEmergency: false
    };

    this.chatMessages = [
      {
        sender: 'assistant',
        time: 'Just now',
        text: "नमस्ते! मैं डॉ. मीरा हूँ, आपकी मेडीकियोस्क एआई सहायक। आप कैसा महसूस कर रहे हैं? कृपया मुझे अपनी परेशानी बताएं, या नीचे 'क्लिनिकल हिस्ट्री शुरू करें' पर क्लिक करें।"
      }
    ];

    this.initCallbacks();
  }

  initCallbacks() {
    this.conversationEngine.onRedFlagDetected = (assessment) => {
      this.handleRedFlag(assessment);
    };

    this.conversationEngine.onQuestionChange = (question) => {
      this.renderQuestion(question);
    };

    this.conversationEngine.onVoiceParsed = (spokenText, extractedEntities) => {
      this.renderSpokenEntities(spokenText, extractedEntities);
    };

    this.conversationEngine.onInterviewComplete = (answers) => {
      this.voiceEngine.playChime('success');
      const msg = this.patientProfile.language === 'hi'
        ? "बहुत-बहुत धन्यवाद! आपका क्लिनिकल इतिहास रिकॉर्ड हो गया है। अब कृपया पिछले पर्चे या टेस्ट रिपोर्ट को स्कैनर पर रखें।"
        : "Thank you very much! Your conversational clinical history is recorded. Please place your prior prescription or lab reports on the scanner.";
      this.voiceEngine.speak(msg);
      this.goToStep(3);
    };
  }

  setLanguage(langCode) {
    this.patientProfile.language = langCode;
    this.voiceEngine.setLanguage(langCode);
    const greeting = this.voiceEngine.assistantPhrases[langCode]
      ? this.voiceEngine.assistantPhrases[langCode].greeting
      : this.voiceEngine.assistantPhrases.en.greeting;

    this.chatMessages.push({
      sender: 'assistant',
      time: 'Just now',
      text: greeting
    });
    this.renderChatMessages();
    this.voiceEngine.speak(greeting);
  }

  /**
   * Save patient login details from form
   */
  submitPatientLogin() {
    const abhaInput = document.getElementById('kiosk-abha-input');
    const nameInput = document.getElementById('kiosk-name-input');
    const ageInput = document.getElementById('kiosk-age-input');
    const genderSelect = document.getElementById('kiosk-gender-select');
    const mobileInput = document.getElementById('kiosk-mobile-input');

    if (abhaInput && abhaInput.value) this.patientProfile.abhaId = abhaInput.value;
    if (nameInput && nameInput.value) this.patientProfile.name = nameInput.value;
    if (ageInput && ageInput.value) this.patientProfile.age = parseInt(ageInput.value) || 54;
    if (genderSelect) this.patientProfile.gender = genderSelect.value;
    if (mobileInput && mobileInput.value) this.patientProfile.mobile = mobileInput.value;
    this.patientProfile.isGuest = false;

    this.voiceEngine.playChime('success');
    const welcomeMsg = `नमस्ते ${this.patientProfile.name} जी! आपका आभा रिकॉर्ड सत्यापित हो चुका है। कृपया अपनी समस्या बताएं या क्लिनिकल हिस्ट्री शुरू करें।`;
    this.addAssistantMessage(welcomeMsg);
    this.voiceEngine.speak(welcomeMsg);
  }

  /**
   * Skip Identity Option (Anonymous / Emergency Guest)
   */
  skipIdentity() {
    this.patientProfile.name = "Guest Patient (अनाम मरीज़)";
    this.patientProfile.age = 45;
    this.patientProfile.gender = "Unspecified";
    this.patientProfile.abhaId = "GUEST-OPD-99";
    this.patientProfile.mobile = "Not Provided";
    this.patientProfile.isGuest = true;

    this.voiceEngine.playChime('beep');
    const skipNotice = "पहचान विवरण छोड़ दिया गया है। आपको अस्थायी गेस्ट टोकन #GUEST-99 जारी किया गया है। आइए सीधे आपकी बीमारी का इतिहास समझते हैं।";
    this.addAssistantMessage(skipNotice);
    this.voiceEngine.speak(skipNotice, () => {
      this.goToStep(2);
    });
  }

  /**
   * Send a chat message to Dr. Meera
   */
  sendChatMessage(customText = null) {
    const input = document.getElementById('chat-user-input');
    const text = customText || (input ? input.value.trim() : '');
    if (!text) return;

    if (input && !customText) input.value = '';

    // Add user message to log
    this.chatMessages.push({
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: text
    });
    this.renderChatMessages();

    // AI Dr. Meera analyzes and replies politely
    this.conversationEngine.parseSpokenVoiceInput(text);

    setTimeout(() => {
      let reply = "";
      const lower = text.toLowerCase();
      if (lower.includes('seene') || lower.includes('chest') || lower.includes('दर्द') || lower.includes('pain')) {
        reply = "मैं समझ सकती हूँ, सीने में दर्द काफी चिंताजनक हो सकता है। क्या यह दर्द बाएं हाथ या जबड़े की तरफ फैल रहा है? कृपया नीचे 'क्लिनिकल हिस्ट्री शुरू करें' पर क्लिक करें ताकि हम पूरा विवरण व्यवस्थित कर सकें।";
      } else if (lower.includes('khansi') || lower.includes('cough') || lower.includes('fever') || lower.includes('बुखार')) {
        reply = "जी, खांसी और बुखार की समस्या को दर्ज कर लिया गया है। क्या आपको सांस लेने में भी कोई तकलीफ हो रही है? आइए कुछ और सवाल पूछकर डॉक्टर साहब के लिए रिपोर्ट तैयार करते हैं।";
      } else {
        reply = "जी, मैंने आपकी बात ध्यानपूर्वक नोट कर ली है। आपकी बीमारी को गहराई से समझने के लिए नीचे दिए गए बटन से क्लिनिकल सवाल शुरू करें।";
      }

      this.addAssistantMessage(reply);
      this.voiceEngine.speak(reply);
    }, 600);
  }

  addAssistantMessage(text) {
    this.chatMessages.push({
      sender: 'assistant',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: text
    });
    this.renderChatMessages();
  }

  renderChatMessages() {
    const log = document.getElementById('chat-messages-log');
    if (!log) return;

    log.innerHTML = this.chatMessages.map(m => {
      const isAssistant = m.sender === 'assistant';
      return `
        <div class="flex items-start gap-2.5 ${isAssistant ? '' : 'flex-row-reverse'}">
          ${isAssistant ? `
            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center shadow flex-shrink-0 avatar-breathing">
              👩‍⚕️
            </div>
          ` : `
            <div class="w-8 h-8 rounded-full bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center shadow flex-shrink-0">
              👤
            </div>
          `}
          <div class="max-w-[82%] p-3 rounded-2xl text-xs leading-relaxed ${
            isAssistant
              ? 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-none shadow-sm'
              : 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-tr-none shadow-md'
          }">
            <div class="flex items-center justify-between gap-2 mb-1 text-[10px] ${isAssistant ? 'text-cyan-400 font-semibold' : 'text-cyan-200'}">
              <span>${isAssistant ? 'डॉ. मीरा (Dr. Meera - AI)' : (this.patientProfile.name || 'You')}</span>
              <span class="opacity-70">${m.time}</span>
            </div>
            <p>${m.text}</p>
          </div>
        </div>
      `;
    }).join('');

    log.scrollTop = log.scrollHeight;
  }

  /**
   * Start the full Clinical History Questioning (SOCRATES / AYUSH)
   */
  startClinicalInterview() {
    this.voiceEngine.playChime('success');
    const startMsg = this.voiceEngine.assistantPhrases[this.patientProfile.language]
      ? this.voiceEngine.assistantPhrases[this.patientProfile.language].startInterview
      : this.voiceEngine.assistantPhrases.hi.startInterview;

    this.addAssistantMessage(startMsg);
    this.voiceEngine.speak(startMsg, () => {
      this.goToStep(2);
    });
  }

  goToStep(stepNumber) {
    this.currentStep = stepNumber;

    for (let i = 1; i <= 4; i++) {
      const stepBadge = document.getElementById(`step-badge-${i}`);
      const stepCard = document.getElementById(`kiosk-step-${i}`);
      if (stepBadge) {
        if (i < stepNumber) {
          stepBadge.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold";
          stepBadge.querySelector('.step-num').innerHTML = '&#10003;';
        } else if (i === stepNumber) {
          stepBadge.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20 text-xs";
          stepBadge.querySelector('.step-num').textContent = i;
        } else {
          stepBadge.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 text-slate-400 border border-slate-700/60 text-xs font-medium";
          stepBadge.querySelector('.step-num').textContent = i;
        }
      }
      if (stepCard) {
        if (i === stepNumber) {
          stepCard.classList.remove('hidden');
        } else {
          stepCard.classList.add('hidden');
        }
      }
    }

    if (stepNumber === 1) {
      this.renderChatMessages();
    } else if (stepNumber === 2) {
      const q = this.conversationEngine.getCurrentQuestion();
      this.renderQuestion(q);
    } else if (stepNumber === 3) {
      this.renderDocumentScanner();
    } else if (stepNumber === 4) {
      this.renderSummaryAndReceipt();
    }
  }

  renderQuestion(q) {
    if (!q) return;
    const container = document.getElementById('kiosk-question-container');
    if (!container) return;

    const lang = this.patientProfile.language;
    const promptText = (q.prompt && q.prompt[lang]) ? q.prompt[lang] : (q.prompt ? q.prompt.hi || q.prompt.en : q.title);

    // Dr. Meera speaks the question prompt
    this.voiceEngine.speak(promptText);

    let html = `
      <div class="mb-4">
        <div class="flex items-center justify-between gap-3 mb-2">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            ${this.conversationEngine.mode === 'ayush' ? 'AYUSH Dashavidha Pariksha' : `SOCRATES Vector [${q.socratesLetter || 'Q'}]`}
          </span>
          <span class="text-xs text-slate-400">
            प्रश्न ${this.conversationEngine.currentQuestionIndex + 1} / ${this.conversationEngine.getQuestionsList().length}
          </span>
        </div>
        <h3 class="text-lg md:text-xl font-bold text-white flex items-center gap-2">
          <button onclick="window.kiosk.replayQuestionPrompt()" title="Listen again" class="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-all">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3-9H5a1 1 0 00-1 1v4a1 1 0 001 1h4l5 5V4L9 9z"></path>
            </svg>
          </button>
          <span>${promptText}</span>
        </h3>
      </div>

      <!-- Touch Option Chips -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
    `;

    q.options.forEach(opt => {
      const optKey = opt.key || opt.label;
      const isRed = opt.redFlagScore >= 3;

      html += `
        <button onclick="window.kiosk.selectOption('${optKey}')"
          class="flex flex-col items-start p-3.5 rounded-xl bg-slate-800/80 hover:bg-cyan-950/40 border ${
            isRed ? 'border-rose-500/40 hover:border-rose-500' : 'border-slate-700 hover:border-cyan-500/50'
          } transition-all text-left shadow-sm hover:shadow-cyan-500/10">
          <div class="flex items-center justify-between w-full mb-0.5">
            <span class="text-sm font-semibold text-slate-200">${opt.label}</span>
            ${isRed ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400">Emergency Risk</span>` : ''}
          </div>
          ${opt.traits || opt.symptoms ? `<p class="text-xs text-slate-400">${opt.traits || opt.symptoms}</p>` : ''}
        </button>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
  }

  replayQuestionPrompt() {
    const q = this.conversationEngine.getCurrentQuestion();
    if (q) {
      const lang = this.patientProfile.language;
      const promptText = (q.prompt && q.prompt[lang]) ? q.prompt[lang] : (q.prompt ? q.prompt.hi || q.prompt.en : q.title);
      this.voiceEngine.speak(promptText);
    }
  }

  selectOption(optKey) {
    this.voiceEngine.playChime('beep');
    this.conversationEngine.recordAnswer(optKey);
  }

  /**
   * Microphone Toggle with Waveform
   */
  toggleMicrophone() {
    const micPulse = document.getElementById('kiosk-mic-pulse');
    const waveContainer = document.getElementById('voice-wave-container');
    const voiceStatus = document.getElementById('kiosk-voice-status');
    const micBtn = document.getElementById('kiosk-mic-btn');

    if (this.voiceEngine.isListening) {
      this.voiceEngine.stopListening();
      if (micPulse) micPulse.classList.add('hidden');
      if (waveContainer) waveContainer.classList.add('hidden');
      if (micBtn) micBtn.classList.remove('mic-active-pulse');
      if (voiceStatus) voiceStatus.textContent = "माइक दबाकर अपनी बीमारी या दर्द के बारे में बोलें (Tap to speak)";
    } else {
      if (micPulse) micPulse.classList.remove('hidden');
      if (waveContainer) waveContainer.classList.remove('hidden');
      if (micBtn) micBtn.classList.add('mic-active-pulse');
      if (voiceStatus) voiceStatus.textContent = "डॉ. मीरा सुन रही हैं... कृपया बोलिए (Dr. Meera is listening...)";

      this.voiceEngine.startListening(
        (interim) => {
          if (voiceStatus) voiceStatus.innerHTML = `<span class="text-cyan-300 font-bold">आप बोल रहे हैं:</span> "${interim}"`;
        },
        (final) => {
          if (micPulse) micPulse.classList.add('hidden');
          if (waveContainer) waveContainer.classList.add('hidden');
          if (micBtn) micBtn.classList.remove('mic-active-pulse');

          if (voiceStatus) voiceStatus.innerHTML = `<span class="text-cyan-300 font-bold">रिकॉर्ड हुआ:</span> "${final}"`;

          // If in Step 1, send as chat message; if in Step 2, record answer
          if (this.currentStep === 1) {
            this.sendChatMessage(final);
          } else {
            this.conversationEngine.parseSpokenVoiceInput(final);
          }
        },
        (err) => {
          if (micPulse) micPulse.classList.add('hidden');
          if (waveContainer) waveContainer.classList.add('hidden');
          if (micBtn) micBtn.classList.remove('mic-active-pulse');
        }
      );
    }
  }

  renderSpokenEntities(spokenText, extracted) {
    const container = document.getElementById('voice-extracted-entities');
    if (!container) return;

    if (extracted.length === 0) return;

    container.innerHTML = `
      <div class="p-3 bg-cyan-950/50 border border-cyan-500/40 rounded-xl space-y-1.5 mb-3">
        <span class="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
          <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          आवाज़ से पहचाने गए क्लिनिकल लक्षण (Clinical Scribe Entities):
        </span>
        <div class="flex flex-wrap gap-2">
          ${extracted.map(e => `
            <span class="px-2.5 py-1 rounded-lg bg-slate-900 border border-cyan-500/30 text-xs text-slate-200">
              <span class="text-slate-400">${e.entity}:</span> <b class="text-cyan-300">${e.value}</b>
            </span>
          `).join('')}
        </div>
      </div>
    `;
  }

  handleRedFlag(assessment) {
    this.patientProfile.isEmergency = true;
    this.voiceEngine.playChime('emergency');
    this.voiceEngine.speak(this.voiceEngine.assistantPhrases[this.patientProfile.language]?.redFlagAlert || this.voiceEngine.assistantPhrases.hi.redFlagAlert);

    const alertModal = document.getElementById('red-flag-modal');
    const alertBody = document.getElementById('red-flag-body');

    if (alertModal && alertBody) {
      alertBody.innerHTML = `
        <div class="text-left space-y-3">
          <div class="p-4 bg-rose-950/60 border border-rose-500/50 rounded-2xl text-rose-200 text-xs">
            <p class="font-bold text-rose-400 text-sm mb-1">&#9888; गंभीर आपातकालीन ट्राइएज लक्षण (Emergency Red-Flag):</p>
            <ul class="list-disc list-inside space-y-1">
              ${assessment.reasons.map(r => `<li>${r}</li>`).join('')}
            </ul>
          </div>

          <div class="grid grid-cols-2 gap-3 text-xs">
            <div class="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span class="text-slate-400 block mb-0.5">इमरजेंसी टोकन:</span>
              <span class="text-xl font-black text-rose-400">#E-01 (STAT)</span>
            </div>
            <div class="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span class="text-slate-400 block mb-0.5">प्राथमिकता वार्ड:</span>
              <span class="text-sm font-bold text-amber-300">Resuscitation Bay 1</span>
            </div>
          </div>

          <div class="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-slate-300">
            <p class="font-semibold text-white mb-1">स्वचालित आपातकालीन कार्रवाई:</p>
            <p>1. ओपीडी ट्राइएज नर्सिंग डेस्क पर अलर्ट प्रसारित किया गया।<br>
               2. डॉक्टर के कंप्यूटर पर लाल चेतावनी ध्वज सक्रिय।<br>
               3. 12-लीड ईसीजी कार्डियक कार्ट तैयार करने का आदेश।</p>
          </div>
        </div>
      `;
      alertModal.classList.remove('hidden');
    }
  }

  dismissRedFlagModal() {
    const alertModal = document.getElementById('red-flag-modal');
    if (alertModal) alertModal.classList.add('hidden');
    this.goToStep(3);
  }

  renderDocumentScanner() {
    this.updateDocumentDisplay(this.documentAIEngine.currentDoc);
  }

  onSelectDocumentPreset(docId) {
    const doc = this.documentAIEngine.selectDocument(docId);
    this.updateDocumentDisplay(doc);
  }

  triggerDocScan() {
    const scanLaser = document.getElementById('scanner-laser');
    const scanStatus = document.getElementById('scanner-status-text');
    const scanBtn = document.getElementById('btn-scan-doc');

    if (scanLaser) scanLaser.classList.remove('hidden');
    if (scanBtn) scanBtn.disabled = true;
    if (scanStatus) scanStatus.textContent = "दस्तावेज़ स्कैनिंग जारी (LayoutLMv3 & TrOCR Scanning)...";

    const currentDocId = this.documentAIEngine.currentDoc ? this.documentAIEngine.currentDoc.id : 'doc_rx_01';

    this.documentAIEngine.simulateScan(
      currentDocId,
      (progress) => {
        if (scanStatus) scanStatus.textContent = `OCR विश्लेषण जारी... ${progress}%`;
      },
      (scannedDoc) => {
        if (scanLaser) scanLaser.classList.add('hidden');
        if (scanBtn) scanBtn.disabled = false;
        if (scanStatus) scanStatus.textContent = "स्कैन पूर्ण! क्लिनिकल जानकारी और असामान्य वैल्यूज सुरक्षित कर ली गई हैं।";
        this.voiceEngine.playChime('success');
        this.updateDocumentDisplay(scannedDoc);
      }
    );
  }

  updateDocumentDisplay(doc) {
    if (!doc) return;
    const previewContainer = document.getElementById('doc-preview-content');
    const abnormalContainer = document.getElementById('doc-abnormal-content');
    const timelineContainer = document.getElementById('doc-timeline-content');

    if (previewContainer) {
      previewContainer.innerHTML = `
        <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto max-h-[350px]">
          <div class="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 text-[11px] text-cyan-400 font-semibold">
            <span>&#10003; ${doc.docQuality}</span>
            <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300">${doc.previewImageBadge}</span>
          </div>
          <pre class="whitespace-pre-wrap font-sans text-xs text-slate-300">${doc.rawText}</pre>
        </div>
      `;
    }

    if (abnormalContainer) {
      const abnormals = this.documentAIEngine.getAllAbnormalValues();
      let html = `<div class="space-y-2 text-xs">`;

      if (abnormals.length > 0) {
        html += `<span class="text-xs font-bold text-rose-400 block uppercase tracking-wider">असामान्य टेस्ट परिणाम (Abnormal Lab Values):</span>`;
        abnormals.forEach(a => {
          html += `
            <div class="flex items-center justify-between p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-200">
              <div>
                <span class="font-bold text-white">${a.test}: </span>
                <span class="text-rose-400 font-extrabold text-sm">${a.value} ${a.unit}</span>
                <span class="text-[11px] text-slate-400 ml-1">(सामान्य: ${a.ref})</span>
              </div>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">${a.severity}</span>
            </div>
          `;
        });
      }

      html += `</div>`;
      abnormalContainer.innerHTML = html;
    }

    if (timelineContainer) {
      const timeline = this.documentAIEngine.getChronologicalTimeline();
      timelineContainer.innerHTML = `
        <div class="relative border-l-2 border-cyan-500/40 ml-3 space-y-3 py-1 text-xs">
          ${timeline.map(t => `
            <div class="relative pl-4">
              <span class="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-400 border-2 border-slate-900 shadow"></span>
              <span class="text-[10px] font-semibold text-cyan-400">${t.date} &bull; ${t.facility}</span>
              <p class="text-slate-200 font-medium">${t.event}</p>
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  renderSummaryAndReceipt() {
    const summary = this.summarizer.generateSummary(
      this.patientProfile,
      this.conversationEngine.patientAnswers,
      this.documentAIEngine.scannedDocs,
      this.conversationEngine.mode
    );

    const summaryContainer = document.getElementById('kiosk-summary-preview');
    if (summaryContainer) {
      summaryContainer.innerHTML = `
        <div class="space-y-4 text-xs">
          <!-- Chief Complaint & HPI -->
          <div class="p-4 bg-slate-900 rounded-2xl border border-slate-800 shadow-sm">
            <span class="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-1">मुख्य समस्या एवं विवरण (Chief Complaint & HPI):</span>
            <p class="text-slate-200 leading-relaxed text-sm">${summary.hpiNarrative}</p>
          </div>

          <!-- Medications & Past History -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="p-4 bg-slate-900 rounded-2xl border border-slate-800">
              <span class="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-1">वर्तमान दवाइयां (Active Medications):</span>
              <ul class="list-disc list-inside space-y-1 text-slate-300">
                ${summary.activeMedications.map(m => `<li><b>${m.name}</b> ${m.dosage} (${m.compliance})</li>`).join('')}
              </ul>
              <p class="mt-2 text-rose-400 font-semibold">एलर्जी: ${summary.allergies[0].allergen}</p>
            </div>

            <div class="p-4 bg-slate-900 rounded-2xl border border-slate-800">
              <span class="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-1">पुरानी बीमारियां (Past History):</span>
              <ul class="list-disc list-inside space-y-1 text-slate-300">
                ${summary.pastDiagnoses.map(d => `<li>${d.condition} (${d.duration})</li>`).join('')}
              </ul>
            </div>
          </div>

          <!-- ABDM PHR Link -->
          <div class="p-4 bg-emerald-950/40 rounded-2xl border border-emerald-500/40">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                आभा (ABHA) एवं अस्पताल EMR से सफलतापूर्वक लिंक किया गया
              </span>
              <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">FHIR R4 Bundle Ready</span>
            </div>
            <p class="text-xs text-slate-300">यह संक्षिप्त विवरण ओपीडी कक्ष 8 में डॉ. विवेक मेहरा की कंप्यूटर स्क्रीन पर पहुंच चुका है।</p>
          </div>
        </div>
      `;
    }

    const tokenReceipt = document.getElementById('kiosk-token-receipt');
    if (tokenReceipt) {
      const isEmergency = this.patientProfile.isEmergency;
      const tokenNo = isEmergency ? 'STAT #E-01' : (this.patientProfile.isGuest ? 'GUEST-OPD-99' : 'OPD-T24');

      tokenReceipt.innerHTML = `
        <div class="p-5 bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border ${isEmergency ? 'border-rose-500 shadow-rose-500/20' : 'border-cyan-500/40 shadow-cyan-500/10'} shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl ${isEmergency ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'} flex items-center justify-center font-mono text-xl font-black">
              ${tokenNo}
            </div>
            <div>
              <span class="text-sm font-bold text-white block">मेडीकियोस्क ओपीडी टोकन रसीद (MediKiosk Official OPD Receipt)</span>
              <p class="text-xs text-slate-300">${this.patientProfile.name} (${this.patientProfile.age} वर्ष / ${this.patientProfile.gender}) &bull; कक्ष: कार्डियोलॉजी ओपीडी 08 &bull; कतार स्थिति: #2</p>
              <div class="flex items-center gap-3 mt-1 text-[11px] text-emerald-400 font-mono">
                <span>&#10003; ABHA ID: ${this.patientProfile.abhaId}</span>
                <span>&#10003; DPDP 2023 Session Wiped</span>
              </div>
            </div>
          </div>

          <!-- QR Code and Action Buttons -->
          <div class="flex items-center gap-3">
            <div class="p-2 bg-white rounded-xl shadow">
              <svg class="w-12 h-12 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm-5 0h2v3h-2v-3zm2 3h3v2h-3v-2zm3 0h3v5h-2v-3h-1v-2zm-5 2h2v3h-2v-3zm2 3h3v2h-3v-2z"/>
              </svg>
            </div>

            <div class="flex flex-col gap-2">
              <button onclick="window.print()" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5 shadow-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                रसीद प्रिंट करें (Print)
              </button>
              <button onclick="switchView('doctor-view')" class="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold transition-all shadow-md">
                डॉक्टर स्क्रीन पर देखें &rarr;
              </button>
            </div>
          </div>
        </div>
      `;
    }

    const completionMsg = this.patientProfile.language === 'hi'
      ? "आपकी क्लिनिकल हिस्ट्री तैयार होकर डॉक्टर के पास पहुंच गई है। आपकी टोकन रसीद तैयार है। कृपया ओपीडी कक्ष 8 में जाएं।"
      : "Your clinical history has been summarized and pushed to your doctor's screen. Your token receipt is generated. Please proceed to OPD Room 8.";
    this.voiceEngine.speak(completionMsg);
  }
}

window.KioskController = KioskController;
