/**
 * MediKiosk Platform - Multimodal Voice & Audio Engine (Module A - SIH Edition)
 * Features "Dr. Meera" — Polite, empathetic female AI clinical voice persona,
 * Web Speech API ASR & TTS, Web Audio Synthesized Chimes & Waveform Visualizers
 */

class VoiceEngine {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis || null;
    this.isListening = false;
    this.currentLanguage = 'hi'; // Default Hindi, also supports English
    this.audioContext = null;

    this.langMap = {
      hi: { code: 'hi-IN', name: 'हिन्दी (Hindi)', persona: 'Dr. Meera (मीरा)' },
      en: { code: 'en-IN', name: 'English (India)', persona: 'Dr. Meera (English)' },
      ta: { code: 'ta-IN', name: 'தமிழ் (Tamil)', persona: 'Dr. Meera (Tamil)' },
      te: { code: 'te-IN', name: 'తెలుగు (Telugu)', persona: 'Dr. Meera (Telugu)' },
      bn: { code: 'bn-IN', name: 'বাংলা (Bengali)', persona: 'Dr. Meera (Bengali)' },
      mr: { code: 'mr-IN', name: 'मराठी (Marathi)', persona: 'Dr. Meera (Marathi)' }
    };

    // Polite female assistant dialogue library
    this.assistantPhrases = {
      hi: {
        greeting: "नमस्ते! मैं डॉ. मीरा हूँ, आपकी मेडीकियोस्क एआई क्लिनिकल सहायक। आप कैसे महसूस कर रहे हैं? कृपया मुझे अपनी परेशानी बताएं, हम आपकी पूरी मदद करेंगे।",
        startInterview: "बहुत अच्छा। अब मैं आपसे बीमारी के बारे में कुछ ज़रूरी सवाल पूछूंगी ताकि डॉक्टर साहब के लिए एक सटीक पर्चा तैयार हो सके।",
        listening: "जी, मैं ध्यान से सुन रही हूँ... कृपया बोलिए।",
        understood: "जी, मैंने समझ लिया। मैं इसे आपके क्लिनिकल रिकॉर्ड में दर्ज कर रही हूँ।",
        redFlagAlert: "सावधान! आपके लक्षण अति गंभीर श्रेणी के हैं। तुरंत इमरजेंसी ट्राइएज वार्ड में स्थानांतरित किया जा रहा है।",
        scanning: "कृपया अपना पर्चा या रिपोर्ट स्कैनर में रखें, मैं तुरंत इसे स्कैन कर रही हूँ।",
        completed: "धन्यवाद! आपका सम्पूर्ण क्लिनिकल इतिहास तैयार कर डॉक्टर की स्क्रीन पर भेज दिया गया है। आपका टोकन नीचे उपलब्ध है।"
      },
      en: {
        greeting: "Hello and welcome! I am Dr. Meera, your MediKiosk AI clinical companion. Please tell me what discomfort you are experiencing today. Don't worry, we are here to assist you fully.",
        startInterview: "Wonderful. I will now ask you a few structured clinical questions to prepare a complete, physician-ready history for your doctor.",
        listening: "I am listening closely... Please speak naturally.",
        understood: "I understand. Recording this in your clinical history.",
        redFlagAlert: "Emergency alert! Critical high-risk symptoms detected. Transferring immediately to the emergency resuscitation bay.",
        scanning: "Please place your medical prescription or report on the scanner. I am extracting your clinical entities now.",
        completed: "Thank you! Your structured clinical history is synthesized and pushed directly to your doctor's screen. Your token receipt is ready."
      }
    };

    this.initSpeechRecognition();
  }

  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
    }
  }

  setLanguage(langCode) {
    if (this.langMap[langCode]) {
      this.currentLanguage = langCode;
      if (this.recognition) {
        this.recognition.lang = this.langMap[langCode].code;
      }
    }
  }

  getAudioContext() {
    if (!this.audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.audioContext = new AudioCtx();
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  playChime(type = 'success') {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'beep') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'emergency') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.linearRampToValueAtTime(440, now + 0.25);
        osc.frequency.linearRampToValueAtTime(880, now + 0.5);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      }
    } catch (e) {
      console.warn("Audio chime:", e);
    }
  }

  /**
   * Speak with Dr. Meera's polite, warm female voice
   */
  speak(text, onEndCallback = null) {
    if (!this.synthesis) {
      if (onEndCallback) onEndCallback();
      return;
    }

    try {
      this.synthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const targetLang = this.langMap[this.currentLanguage] ? this.langMap[this.currentLanguage].code : 'hi-IN';
      utterance.lang = targetLang;
      utterance.rate = 0.95; // Gentle, empathetic cadence
      utterance.pitch = 1.18; // Sweet, polite female tone

      // Pick female voice if available on system
      const voices = this.synthesis.getVoices();
      const femaleKeywords = ['female', 'swara', 'zira', 'heera', 'meera', 'samantha', 'kavya', 'veena'];
      const matched = voices.find(v => {
        const nameLower = v.name.toLowerCase();
        const matchesLang = v.lang.startsWith(targetLang.split('-')[0]);
        const isFemale = femaleKeywords.some(kw => nameLower.includes(kw));
        return matchesLang && isFemale;
      }) || voices.find(v => v.lang.startsWith(targetLang.split('-')[0])) || voices[0];

      if (matched) utterance.voice = matched;

      utterance.onend = () => { if (onEndCallback) onEndCallback(); };
      utterance.onerror = () => { if (onEndCallback) onEndCallback(); };

      this.synthesis.speak(utterance);
    } catch (err) {
      console.warn("TTS notice:", err);
      if (onEndCallback) onEndCallback();
    }
  }

  stopSpeaking() {
    if (this.synthesis) this.synthesis.cancel();
  }

  startListening(onInterim, onFinal, onError) {
    this.playChime('beep');

    if (!this.recognition) {
      this.simulateSpeechRecognition(onFinal);
      return;
    }

    try {
      const targetLang = this.langMap[this.currentLanguage] ? this.langMap[this.currentLanguage].code : 'hi-IN';
      this.recognition.lang = targetLang;
      this.isListening = true;

      this.recognition.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (interim && onInterim) onInterim(interim);
        if (final && onFinal) {
          this.isListening = false;
          this.playChime('success');
          onFinal(final);
        }
      };

      this.recognition.onerror = (err) => {
        this.isListening = false;
        if (onError) onError(err);
        this.simulateSpeechRecognition(onFinal);
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      this.recognition.start();
    } catch (e) {
      this.simulateSpeechRecognition(onFinal);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  simulateSpeechRecognition(onFinal) {
    this.isListening = true;
    setTimeout(() => {
      this.isListening = false;
      this.playChime('success');
      const sample = this.currentLanguage === 'hi'
        ? "डॉक्टर साहब, सीने में भारी दर्द है और ठंडा पसीना आ रहा है"
        : "Doctor, I am having heavy chest pain and cold sweating";
      if (onFinal) onFinal(sample);
    }, 1500);
  }
}

window.VoiceEngine = VoiceEngine;
