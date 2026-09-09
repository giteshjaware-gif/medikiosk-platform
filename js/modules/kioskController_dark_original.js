/**
 * MediKiosk Platform - Kiosk Controller (Steps 1, 2, 3, 4)
 * Coordinates Patient Journey, Multimodal Input, Audio Consent, and Screen Flow
 */

class KioskController {
  constructor(voiceEngine, conversationEngine, documentAIEngine, summarizer) {
    this.voiceEngine = voiceEngine;
    this.conversationEngine = conversationEngine;
    this.documentAIEngine = documentAIEngine;
    this.summarizer = summarizer;

    this.currentStep = 1; // 1: Identify, 2: Converse, 3: Scan, 4: Summarize
    this.patientProfile = {
      name: "Suresh Kumar",
      age: 54,
      gender: "Male",
      abhaId: "91-4521-8890-1234",
      mobile: "+91 98765 43210",
      aadhaarLast4: "8890",
      language: "en",
      consentGranted: false,
      isEmergency: false
    };

    this.initCallbacks();
  }

  initCallbacks() {
    this.conversationEngine.onRedFlagDetected = (assessment) => {
      this.handleRedFlag(assessment);
    };

    this.conversationEngine.onQuestionChange = (question) => {
      this.renderQuestion(question);
    };

    this.conversationEngine.onInterviewComplete = (answers) => {
      this.voiceEngine.playChime('success');
      this.voiceEngine.speak("Thank you. Conversational history recorded. Let us now scan your prior medical documents.");
      this.goToStep(3);
    };
  }

  setLanguage(langCode) {
    this.patientProfile.language = langCode;
    this.voiceEngine.setLanguage(langCode);
    const audioConsentTextEl = document.getElementById('audio-consent-text');
    if (audioConsentTextEl) {
      audioConsentTextEl.textContent = this.voiceEngine.getText('audioConsentText');
    }
  }

  playAudioConsent() {
    const consentText = this.voiceEngine.getText('audioConsentText');
    const playBtn = document.getElementById('btn-play-audio-consent');
    if (playBtn) {
      playBtn.classList.add('animate-pulse', 'bg-cyan-600');
      playBtn.innerHTML = `
        <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        <span>Playing Audio Explanation (${this.patientProfile.language.toUpperCase()})...</span>
      `;
    }

    this.voiceEngine.speak(consentText, () => {
      if (playBtn) {
        playBtn.classList.remove('animate-pulse', 'bg-cyan-600');
        playBtn.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>
          </svg>
          <span>Replay Spoken Consent</span>
        `;
      }
    });
  }

  grantConsent() {
    this.patientProfile.consentGranted = true;
    this.voiceEngine.stopSpeaking();
    this.voiceEngine.playChime('success');
    this.goToStep(2);
  }

  goToStep(stepNumber) {
    this.currentStep = stepNumber;
    // Update step progress indicator
    for (let i = 1; i <= 4; i++) {
      const stepBadge = document.getElementById(`step-badge-${i}`);
      const stepCard = document.getElementById(`kiosk-step-${i}`);
      if (stepBadge) {
        if (i < stepNumber) {
          stepBadge.className = "flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-semibold";
          stepBadge.querySelector('.step-num').innerHTML = '&#10003;';
        } else if (i === stepNumber) {
          stepBadge.className = "flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 text-xs font-semibold shadow-lg shadow-cyan-500/10";
          stepBadge.querySelector('.step-num').textContent = i;
        } else {
          stepBadge.className = "flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 text-slate-400 border border-slate-700/60 text-xs font-semibold";
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

    // Step-specific initializations
    if (stepNumber === 2) {
      const initialQ = this.conversationEngine.getCurrentQuestion();
      this.renderQuestion(initialQ);
    } else if (stepNumber === 3) {
      this.renderDocumentScanner();
    } else if (stepNumber === 4) {
      this.renderSummaryAndRouting();
    }
  }

  renderQuestion(q) {
    if (!q) return;
    const container = document.getElementById('kiosk-question-container');
    if (!container) return;

    const lang = this.patientProfile.language;
    const promptText = (q.prompt && q.prompt[lang]) ? q.prompt[lang] : (q.prompt ? q.prompt.en : q.description || q.title);

    // Speak the question prompt
    this.voiceEngine.speak(promptText);

    let html = `
      <div class="mb-5">
        <div class="flex items-center justify-between gap-3 mb-2">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            ${this.conversationEngine.mode === 'ayush' ? 'AYUSH Dashavidha Pariksha' : `SOCRATES Framework Vector [${q.socratesLetter || 'Q'}]`}
          </span>
          <span class="text-xs text-slate-400">
            Step ${this.conversationEngine.currentQuestionIndex + 1} of ${this.conversationEngine.getQuestionsList().length}
          </span>
        </div>
        <h3 class="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <button onclick="window.kiosk.replayQuestionPrompt()" title="Listen to question" class="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-all">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3-9H5a1 1 0 00-1 1v4a1 1 0 001 1h4l5 5V4L9 9z"></path>
            </svg>
          </button>
          <span>${promptText}</span>
        </h3>
        <p class="text-xs text-slate-400 mt-1">${q.title}</p>
      </div>

      <!-- Dual Mode Touch Options -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
    `;

    q.options.forEach((opt, idx) => {
      const optKey = opt.key || opt.label;
      const redBadge = opt.redFlagScore >= 3
        ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">Emergency Risk</span>`
        : '';

      html += `
        <button onclick="window.kiosk.selectOption('${optKey}')"
          class="flex flex-col items-start p-4 rounded-xl bg-slate-800/80 hover:bg-cyan-950/40 border border-slate-700 hover:border-cyan-500/50 transition-all text-left group shadow-sm hover:shadow-cyan-500/10">
          <div class="flex items-center justify-between w-full mb-1">
            <span class="text-sm font-semibold text-slate-200 group-hover:text-cyan-300">${opt.label}</span>
            ${redBadge}
          </div>
          ${opt.traits || opt.symptoms || opt.score ? `<p class="text-xs text-slate-400">${opt.traits || opt.symptoms || opt.score}</p>` : ''}
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
      const promptText = (q.prompt && q.prompt[lang]) ? q.prompt[lang] : (q.prompt ? q.prompt.en : q.description || q.title);
      this.voiceEngine.speak(promptText);
    }
  }

  selectOption(optKey) {
    this.voiceEngine.playChime('beep');
    this.conversationEngine.recordAnswer(optKey);
  }

  toggleMicrophone() {
    const micBtn = document.getElementById('kiosk-mic-btn');
    const micPulse = document.getElementById('kiosk-mic-pulse');
    const voiceStatus = document.getElementById('kiosk-voice-status');

    if (this.voiceEngine.isListening) {
      this.voiceEngine.stopListening();
      if (micPulse) micPulse.classList.add('hidden');
      if (voiceStatus) voiceStatus.textContent = "Tap microphone to speak your answer";
    } else {
      if (micPulse) micPulse.classList.remove('hidden');
      if (voiceStatus) voiceStatus.textContent = this.voiceEngine.getText('micListening');

      this.voiceEngine.startListening(
        (interim) => {
          if (voiceStatus) voiceStatus.textContent = `"${interim}..."`;
        },
        (final) => {
          if (voiceStatus) voiceStatus.textContent = `Heard: "${final}"`;
          if (micPulse) micPulse.classList.add('hidden');

          // Match voice transcript to closest option or record voice free-text
          const q = this.conversationEngine.getCurrentQuestion();
          if (q && q.options.length > 0) {
            let matchedOpt = q.options[0];
            const lower = final.toLowerCase();
            for (const opt of q.options) {
              const labelLower = opt.label.toLowerCase();
              if (lower.includes('crush') || lower.includes('heavy') || lower.includes('दबाव') || lower.includes('chest') || lower.includes('बीच')) {
                matchedOpt = q.options[0];
                break;
              }
              if (lower.includes('sweat') || lower.includes('breath') || lower.includes('पसीना') || lower.includes('सांस')) {
                matchedOpt = q.options.find(o => o.key === 'sweat_and_dyspnoea') || q.options[0];
                break;
              }
              if (lower.includes(opt.key)) {
                matchedOpt = opt;
                break;
              }
            }
            this.conversationEngine.recordAnswer(matchedOpt.key || matchedOpt.label, final);
          }
        },
        (err) => {
          if (micPulse) micPulse.classList.add('hidden');
          if (voiceStatus) voiceStatus.textContent = "Voice captured or simulated.";
        }
      );
    }
  }

  handleRedFlag(assessment) {
    this.patientProfile.isEmergency = true;
    this.voiceEngine.playChime('emergency');
    this.voiceEngine.speak(this.voiceEngine.getText('emergencyAlertAudio'));

    const alertModal = document.getElementById('red-flag-modal');
    const alertBody = document.getElementById('red-flag-body');

    if (alertModal && alertBody) {
      alertBody.innerHTML = `
        <div class="text-left space-y-3">
          <div class="p-3 bg-rose-950/60 border border-rose-500/40 rounded-lg text-rose-200 text-sm">
            <p class="font-bold text-rose-400 mb-1">&#9888; CRITICAL CLINICAL TRIAGE TRIGGER:</p>
            <ul class="list-disc list-inside space-y-1 text-xs">
              ${assessment.reasons.map(r => `<li>${r}</li>`).join('')}
            </ul>
          </div>

          <div class="grid grid-cols-2 gap-3 text-xs">
            <div class="p-3 bg-slate-900/80 rounded-lg border border-slate-700">
              <span class="text-slate-400 block mb-0.5">Emergency Token Assigned:</span>
              <span class="text-lg font-black text-rose-400">#E-01 (STAT)</span>
            </div>
            <div class="p-3 bg-slate-900/80 rounded-lg border border-slate-700">
              <span class="text-slate-400 block mb-0.5">Triage Allocation:</span>
              <span class="text-sm font-bold text-amber-300">Resuscitation Bay 1</span>
            </div>
          </div>

          <div class="p-3 bg-slate-800/80 rounded-lg border border-slate-700 text-xs text-slate-300">
            <p class="font-semibold text-white mb-1">Automated Protocol Triggered:</p>
            <p>1. Priority notification broadcast to OPD Triage Nursing Station.<br>
               2. STAT 12-Lead ECG cart requested to Bay 1.<br>
               3. Routine queue bypassed — Physician workstation alerted with red flashing banner.</p>
          </div>
        </div>
      `;
      alertModal.classList.remove('hidden');
    }
  }

  dismissRedFlagModal() {
    const alertModal = document.getElementById('red-flag-modal');
    if (alertModal) alertModal.classList.add('hidden');
    // Proceed immediately to document scan or summary
    this.goToStep(3);
  }

  renderDocumentScanner() {
    const docSelect = document.getElementById('doc-preset-select');
    if (docSelect) {
      docSelect.value = this.documentAIEngine.currentDoc ? this.documentAIEngine.currentDoc.id : 'doc_rx_01';
    }
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
    if (scanStatus) scanStatus.textContent = "AI OCR Scanning in progress: Detecting layouts, tables & handwriting...";

    const currentDocId = this.documentAIEngine.currentDoc ? this.documentAIEngine.currentDoc.id : 'doc_rx_01';

    this.documentAIEngine.simulateScan(
      currentDocId,
      (progress) => {
        if (scanStatus) scanStatus.textContent = `LayoutLMv3 OCR Analyzing... ${progress}%`;
      },
      (scannedDoc) => {
        if (scanLaser) scanLaser.classList.add('hidden');
        if (scanBtn) scanBtn.disabled = false;
        if (scanStatus) scanStatus.textContent = "Scan complete! Extracted clinical entities & flagged out-of-range values.";
        this.voiceEngine.playChime('success');
        this.updateDocumentDisplay(scannedDoc);
      }
    );
  }

  updateDocumentDisplay(doc) {
    if (!doc) return;
    const previewContainer = document.getElementById('doc-preview-content');
    const entitiesContainer = document.getElementById('doc-entities-content');
    const abnormalContainer = document.getElementById('doc-abnormal-content');
    const timelineContainer = document.getElementById('doc-timeline-content');

    if (previewContainer) {
      previewContainer.innerHTML = `
        <div class="relative bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto max-h-[380px] shadow-inner">
          <div class="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 text-[11px] text-cyan-400 font-semibold">
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              ${doc.docQuality}
            </span>
            <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300">${doc.previewImageBadge}</span>
          </div>
          <pre class="whitespace-pre-wrap font-sans text-xs text-slate-300">${doc.rawText}</pre>

          <!-- OCR Bounding Box Overlays -->
          <div class="mt-4 pt-3 border-t border-slate-800">
            <p class="text-[11px] text-slate-400 mb-2 font-sans font-medium">LayoutLMv3 & TrOCR Detected Entity Bounding Boxes:</p>
            <div class="flex flex-wrap gap-2">
              ${doc.boundingBoxes.map(b => `
                <span class="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800/90 border ${b.flag ? 'border-rose-500/50 text-rose-300' : 'border-cyan-500/30 text-cyan-300'} text-[10px] font-sans">
                  <span class="w-1.5 h-1.5 rounded-full ${b.flag ? 'bg-rose-400' : 'bg-cyan-400'}"></span>
                  <b>[${b.label}]</b>: ${b.text.substring(0, 32)}... (${Math.round(b.conf * 100)}%)
                </span>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    // Extracted Entities
    if (entitiesContainer) {
      const meds = this.documentAIEngine.getAllMedications();
      const diags = this.documentAIEngine.getAllDiagnoses();
      entitiesContainer.innerHTML = `
        <div class="space-y-3 text-xs">
          <div>
            <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Active Prescribed Medications:</span>
            <div class="space-y-1.5">
              ${meds.map(m => `
                <div class="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 border border-slate-700/60">
                  <span class="font-semibold text-white">${m.name} <span class="text-cyan-300">${m.dosage}</span></span>
                  <span class="px-2 py-0.5 rounded bg-slate-700 text-slate-300 text-[10px]">${m.frequency} (${m.indication || 'Rx'})</span>
                </div>
              `).join('')}
            </div>
          </div>
          <div>
            <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Document Diagnoses (ICD-10 & SNOMED CT):</span>
            <div class="flex flex-wrap gap-1.5">
              ${diags.map(d => `
                <span class="px-2 py-1 rounded-md bg-cyan-950/60 border border-cyan-500/30 text-cyan-200 text-[11px]">
                  ${d.name} <span class="text-cyan-400 text-[10px]">[${d.icd10}]</span>
                </span>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    // Abnormal Lab Values & Drug Interactions
    if (abnormalContainer) {
      const abnormals = this.documentAIEngine.getAllAbnormalValues();
      const drugWarnings = this.documentAIEngine.checkDrugInteractions();

      let html = `<div class="space-y-2 text-xs">`;

      if (abnormals.length > 0) {
        html += `<span class="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">Out-of-Range Lab Investigations:</span>`;
        abnormals.forEach(a => {
          html += `
            <div class="flex items-center justify-between p-2 rounded-lg bg-rose-950/30 border border-rose-500/40 text-rose-200">
              <div>
                <span class="font-bold text-white">${a.test}: </span>
                <span class="text-rose-400 font-extrabold text-sm">${a.value} ${a.unit}</span>
                <span class="text-[10px] text-slate-400 ml-1">(Ref: ${a.ref})</span>
              </div>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">${a.severity}</span>
            </div>
          `;
        });
      }

      if (drugWarnings.length > 0) {
        html += `<span class="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mt-3">Clinical Decision Alerts (Drug Interactions):</span>`;
        drugWarnings.forEach(w => {
          html += `
            <div class="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/40 text-amber-200 text-[11px]">
              <div class="flex items-center justify-between mb-1">
                <span class="font-bold text-white">${w.drugA} + ${w.drugB}</span>
                <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">${w.severity}</span>
              </div>
              <p class="text-[10px] text-slate-300">${w.description}</p>
            </div>
          `;
        });
      }

      html += `</div>`;
      abnormalContainer.innerHTML = html;
    }

    // Chronological Timeline
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

  renderSummaryAndRouting() {
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
          <div class="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
            <span class="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">Chief Complaint & HPI (SOCRATES):</span>
            <p class="text-slate-200 leading-relaxed">${summary.hpiNarrative}</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
              <span class="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">Active Regimen & Allergies:</span>
              <ul class="list-disc list-inside space-y-0.5 text-slate-300">
                ${summary.activeMedications.map(m => `<li><b>${m.name}</b> ${m.dosage}</li>`).join('')}
              </ul>
              <p class="mt-2 text-rose-300 text-[11px]"><b>Allergy:</b> ${summary.allergies[0].allergen} (${summary.allergies[0].reaction})</p>
            </div>

            <div class="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
              <span class="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">Prior Chronic Diagnoses:</span>
              <ul class="list-disc list-inside space-y-0.5 text-slate-300">
                ${summary.pastDiagnoses.map(d => `<li>${d.condition} <span class="text-slate-400 text-[10px]">(${d.duration})</span></li>`).join('')}
              </ul>
            </div>
          </div>

          ${summary.ayushProfile ? `
            <div class="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/30">
              <span class="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">AYUSH Dashavidha Profile (आयुर्वेदिक मूल्यांकन):</span>
              <div class="grid grid-cols-2 gap-2 text-[11px] text-emerald-200">
                <div><b>Prakriti:</b> ${summary.ayushProfile.prakriti}</div>
                <div><b>Vikriti:</b> ${summary.ayushProfile.vikriti}</div>
                <div><b>Agni/Ahara:</b> ${summary.ayushProfile.aharaShakti}</div>
                <div><b>Sattva:</b> ${summary.ayushProfile.sattva}</div>
              </div>
            </div>
          ` : ''}

          <!-- ABDM & HIS Routing Status -->
          <div class="p-3.5 bg-emerald-950/50 rounded-xl border border-emerald-500/40">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                ABDM Personal Health Record (PHR) & HIS Linked
              </span>
              <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">FHIR R4 DocumentBundle</span>
            </div>
            <div class="grid grid-cols-3 gap-2 text-[11px] text-slate-300">
              <div><span class="text-slate-400 block text-[10px]">ABHA ID:</span> ${summary.patient.abhaId}</div>
              <div><span class="text-slate-400 block text-[10px]">HIS Push Destination:</span> OPD Clinic Room #08</div>
              <div><span class="text-slate-400 block text-[10px]">Kiosk Token:</span> <b class="text-white">${this.patientProfile.isEmergency ? 'STAT #E-01' : 'OPD-T24'}</b></div>
            </div>
          </div>
        </div>
      `;
    }

    // Play bilingual completion speech
    const completionAudio = this.patientProfile.language === 'hi'
      ? "आपका क्लिनिकल इतिहास सफलतापूर्वक संकलित कर लिया गया है और डॉक्टर के कंप्यूटर पर भेज दिया गया है। कृपया परामर्श कक्ष नंबर 8 में प्रतीक्षा करें।"
      : "Your structured clinical history has been synthesized and transmitted directly to your physician's consultation screen. Please proceed to OPD Room 8.";
    this.voiceEngine.speak(completionAudio);
  }
}

window.KioskController = KioskController;
