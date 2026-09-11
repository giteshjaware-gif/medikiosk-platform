/**
 * MediKiosk Platform - Main Application Controller (SIH Edition)
 * Controls Vertical Left Sidebar, Dr. Meera AI Assistant, Theme Toggle & Emergency SOS
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Core Engines
  const voiceEngine = new VoiceEngine();
  const conversationEngine = new ConversationEngine(voiceEngine);
  const documentAIEngine = new DocumentAIEngine();
  const summarizer = new ClinicalSummarizer();

  const kioskController = new KioskController(voiceEngine, conversationEngine, documentAIEngine, summarizer);
  const doctorPortal = new DoctorPortal(summarizer, documentAIEngine);
  const stackExplorer = new StackExplorer();

  // Expose to window for UI onclick bindings
  window.voiceEngine = voiceEngine;
  window.conversationEngine = conversationEngine;
  window.documentAIEngine = documentAIEngine;
  window.summarizer = summarizer;
  window.kiosk = kioskController;
  window.doctorPortal = doctorPortal;
  window.stackExplorer = stackExplorer;

  // Vertical Sidebar View Switcher
  window.switchView = function(viewName) {
    const views = ['kiosk-view', 'doctor-view', 'stack-view', 'journey-view'];
    views.forEach(v => {
      const el = document.getElementById(v);
      const navBtn = document.getElementById(`sidebar-nav-${v}`);
      if (el) {
        if (v === viewName) {
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      }
      if (navBtn) {
        if (v === viewName) {
          navBtn.className = "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm transition-all";
        } else {
          navBtn.className = "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all";
        }
      }
    });

    if (viewName === 'doctor-view') {
      doctorPortal.renderDoctorDashboard();
    } else if (viewName === 'stack-view') {
      stackExplorer.renderStackTable();
    }
  };

  // Language Switcher
  window.changeLanguage = function(langCode) {
    kioskController.setLanguage(langCode);
    const select = document.getElementById('global-lang-select');
    if (select) select.value = langCode;

    if (kioskController.currentStep === 2) {
      kioskController.renderQuestion(conversationEngine.getCurrentQuestion());
    }
  };

  // Theme Switcher (Dark 🌙 / Light ☀️)
  window.toggleTheme = function() {
    const htmlEl = document.documentElement;
    const isDark = htmlEl.classList.contains('dark');
    const themeBtn = document.getElementById('theme-toggle-btn');

    if (isDark) {
      htmlEl.classList.remove('dark');
      htmlEl.classList.add('light');
      if (themeBtn) {
        themeBtn.innerHTML = `<span>☀️ Light Mode</span>`;
        themeBtn.className = "px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm";
      }
    } else {
      htmlEl.classList.remove('light');
      htmlEl.classList.add('dark');
      if (themeBtn) {
        themeBtn.innerHTML = `<span>🌙 Dark Mode</span>`;
        themeBtn.className = "px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm";
      }
    }
  };

  // Clinical Mode Switcher (Allopathy vs AYUSH)
  window.switchClinicalMode = function(mode) {
    conversationEngine.setMode(mode);
    const btnAllopathy = document.getElementById('btn-mode-allopathy');
    const btnAyush = document.getElementById('btn-mode-ayush');

    if (mode === 'ayush') {
      if (btnAyush) btnAyush.className = "px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-md shadow-emerald-600/30";
      if (btnAllopathy) btnAllopathy.className = "px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-900";
    } else {
      if (btnAllopathy) btnAllopathy.className = "px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 text-white shadow-md shadow-cyan-600/30";
      if (btnAyush) btnAyush.className = "px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-900";
    }

    if (kioskController.currentStep === 2) {
      kioskController.renderQuestion(conversationEngine.getCurrentQuestion());
    }
  };

  // Emergency SOS Trigger
  window.triggerEmergencyAlert = function() {
    kioskController.handleRedFlag({
      isEmergency: true,
      urgency: "PRIORITY 1 - IMMEDIATE RESUSCITATION BAY",
      code: "RED-ALERT-SOS",
      reasons: [
        "Patient manually pressed Emergency SOS button on MediKiosk",
        "Acute vital distress or collapse suspected — Priority 1 triage protocol activated"
      ],
      action: "Emergency Resuscitation Bay 1 alerted. Cath Lab & STAT ECG cart dispatched immediately."
    });
  };

  // Initial render
  kioskController.goToStep(1);
  stackExplorer.renderStackTable();
});
