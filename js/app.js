/**
 * MediKiosk Platform - Main Application Controller
 * Boots up all modules, binds view navigators, and coordinates patient-doctor synchronization
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Engines
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

  // View Navigation
  window.switchView = function(viewName) {
    const views = ['kiosk-view', 'doctor-view', 'stack-view', 'journey-view'];
    views.forEach(v => {
      const el = document.getElementById(v);
      const navBtn = document.getElementById(`nav-btn-${v}`);
      if (el) {
        if (v === viewName) {
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      }
      if (navBtn) {
        if (v === viewName) {
          navBtn.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm transition-all";
        } else {
          navBtn.className = "px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all";
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

    // Refresh active question if currently in conversation step
    if (kioskController.currentStep === 2) {
      kioskController.renderQuestion(conversationEngine.getCurrentQuestion());
    }
  };

  // Clinical Mode Switcher (Allopathy vs AYUSH)
  window.switchClinicalMode = function(mode) {
    conversationEngine.setMode(mode);
    const btnAllopathy = document.getElementById('btn-mode-allopathy');
    const btnAyush = document.getElementById('btn-mode-ayush');

    if (mode === 'ayush') {
      if (btnAyush) btnAyush.className = "px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-md shadow-emerald-600/30";
      if (btnAllopathy) btnAllopathy.className = "px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-800";
    } else {
      if (btnAllopathy) btnAllopathy.className = "px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 text-white shadow-md shadow-cyan-600/30";
      if (btnAyush) btnAyush.className = "px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-800";
    }
  };

  // Initial render
  kioskController.goToStep(1);
  stackExplorer.renderStackTable();
});
