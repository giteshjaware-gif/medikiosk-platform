/**
 * MediKiosk Platform - Multimodal Voice & Audio Engine (Module A)
 * Supports Indian Languages, Web Speech API (ASR & TTS), Web Audio Cues & Fallback Voice Simulator
 */

class VoiceEngine {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis || null;
    this.isListening = false;
    this.currentLanguage = 'en'; // 'en', 'hi', 'ta', 'te', 'bn', 'mr'
    this.audioContext = null;

    this.langMap = {
      en: { code: 'en-IN', name: 'English (India)', voiceName: 'India English' },
      hi: { code: 'hi-IN', name: 'हिन्दी (Hindi)', voiceName: 'Hindi' },
      ta: { code: 'ta-IN', name: 'தமிழ் (Tamil)', voiceName: 'Tamil' },
      te: { code: 'te-IN', name: 'తెలుగు (Telugu)', voiceName: 'Telugu' },
      bn: { code: 'bn-IN', name: 'বাংলা (Bengali)', voiceName: 'Bengali' },
      mr: { code: 'mr-IN', name: 'मराठी (Marathi)', voiceName: 'Marathi' }
    };

    this.translations = {
      en: {
        welcomeAudio: "Welcome to MediKiosk. Please verify your ABHA ID and tap to give consent to begin your clinical history recording.",
        micListening: "Listening... Speak naturally in your preferred language.",
        micStopped: "Voice captured. Processing clinical entities...",
        emergencyAlertAudio: "Emergency Alert! Priority triage symptoms detected. Diverting to emergency bay immediately.",
        speakButtonPrompt: "Hold or Tap to Speak",
        audioConsentText: "Audio Explanation: Under DPDP Act 2023, your voice and medical records are collected solely for this consultation and linked to your ABHA account. Data will be transmitted to the hospital HIS securely and purged from this kiosk immediately after submission. Do you consent?"
      },
      hi: {
        welcomeAudio: "मेडीकियोस्क में आपका स्वागत है। कृपया अपनी आभा आईडी सत्यापित करें और अपनी क्लिनिकल हिस्ट्री शुरू करने के लिए सहमति दें।",
        micListening: "सुन रहे हैं... कृपया अपनी भाषा में सहजता से बोलें।",
        micStopped: "आवाज़ दर्ज हो गई। क्लिनिकल विश्लेषण जारी है...",
        emergencyAlertAudio: "आपातकालीन चेतावनी! तत्काल लक्षणों की पहचान हुई है। तुरंत इमरजेंसी वार्ड में भेजा जा रहा है।",
        speakButtonPrompt: "बोलने के लिए दबाएं",
        audioConsentText: "ऑडियो व्याख्या: DPDP अधिनियम 2023 के तहत, आपकी आवाज़ और मेडिकल रिकॉर्ड केवल इस परामर्श के लिए एकत्र किए जा रहे हैं और आपकी आभा आईडी से जोड़े जाएंगे। सबमिशन के तुरंत बाद यह डेटा कियोस्क से मिटा दिया जाएगा। क्या आप सहमत हैं?"
      },
      ta: {
        welcomeAudio: "மெடிகியோஸ்க்கிற்கு உங்களை வரவேற்கிறோம். தயவுசெய்து உங்கள் ஆபா ஐடியைச் சரிபார்த்து சம்மதம் தெரிவிக்கவும்.",
        micListening: "கேட்கிறது... தயங்காமல் பேசுங்கள்.",
        micStopped: "குரல் பதிவு செய்யப்பட்டது...",
        emergencyAlertAudio: "அவசர எச்சரிக்கை! அவசரப் பிரிவுக்கு உடனடியாகத் தெரிவிக்கப்பட்டது.",
        speakButtonPrompt: "பேச அழுத்தவும்",
        audioConsentText: "DPDP சட்டம் 2023-ன் கீழ், உங்கள் மருத்துவத் தகவல்கள் இந்த ஆலோசனைகாக மட்டுமே பயன்படும். ஆலோசனையின் முடிவில் இந்த கியோஸ்க்கிலிருந்து அழிக்கப்படும்."
      },
      te: {
        welcomeAudio: "మెడికియోస్క్‌కు స్వాగతం. దయచేసి మీ ఆభా ఐడి ధృవీకరించి అనుమతి ఇవ్వండి.",
        micListening: "వింటోంది... సహజంగా మాట్లాడండి.",
        micStopped: "వాయిస్ నమోదు చేయబడింది...",
        emergencyAlertAudio: "అత్యవసర హెచ్చరిక! వెంటనే అత్యవసర విభాగానికి బదిలీ చేయబడుతున్నారు.",
        speakButtonPrompt: "మాట్లాడటానికి నొక్కండి",
        audioConsentText: "DPDP చట్టం 2023 ప్రకారం మీ డేటా కేవలం ఈ కన్సల్టేషన్ కోసం మాత్రమే ఉపయోగించబడుతుంది."
      },
      bn: {
        welcomeAudio: "মেডিকিয়স্কে আপনাকে স্বাগতম। অনুগ্রহ করে আপনার আভা আইডি যাচাই করুন এবং সম্মতি দিন।",
        micListening: "শুনছি... স্বাভাবিকভাবে বলুন।",
        micStopped: "ভয়েস রেকর্ড সম্পন্ন হয়েছে...",
        emergencyAlertAudio: "জরুরী সতর্কতা! অবিলম্বে জরুরি বিভাগে স্থানান্তরিত করা হচ্ছে।",
        speakButtonPrompt: "বলার জন্য চাপুন",
        audioConsentText: "DPDP আইন ২০২৩ অনুযায়ী আপনার তথ্য শুধুমাত্র এই পরামর্শের জন্য ব্যবহৃত হবে।"
      },
      mr: {
        welcomeAudio: "मेडीकिऑस्क मध्ये आपले स्वागत आहे. कृपया आपला आभा आयडी तपासा आणि संमती द्या.",
        micListening: "ऐकत आहे... कृपया मोकळेपणाने बोला.",
        micStopped: "आवाज नोंदवला गेला आहे...",
        emergencyAlertAudio: "तातडीचा इशारा! त्वरित आपत्कालीन कक्षात पाठवले जात आहे.",
        speakButtonPrompt: "बोलण्यासाठी दाबा",
        audioConsentText: "DPDP कायदा 2023 नुसार आपला डेटा केवळ या तपासणीसाठी वापरला जाईल."
      }
    };

    this.initSpeechRecognition();
  }

  getAudioContext() {
    if (!this.audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
      }
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
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'alert' || type === 'emergency') {
        // High-low emergency siren tone
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.linearRampToValueAtTime(440, now + 0.2);
        osc.frequency.linearRampToValueAtTime(880, now + 0.4);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      }
    } catch (e) {
      console.warn("Audio chime error:", e);
    }
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

  getText(key) {
    const langDict = this.translations[this.currentLanguage] || this.translations['en'];
    return langDict[key] || this.translations['en'][key] || '';
  }

  speak(text, onEndCallback = null) {
    if (!this.synthesis) {
      if (onEndCallback) onEndCallback();
      return;
    }

    try {
      this.synthesis.cancel(); // Stop any pending speech
      const utterance = new SpeechSynthesisUtterance(text);
      const targetLang = this.langMap[this.currentLanguage] ? this.langMap[this.currentLanguage].code : 'en-IN';
      utterance.lang = targetLang;
      utterance.rate = 0.95; // Clear conversational cadence
      utterance.pitch = 1.0;

      // Select natural voice if available
      const voices = this.synthesis.getVoices();
      const matchedVoice = voices.find(v => v.lang.startsWith(targetLang.split('-')[0]) || v.lang === targetLang);
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onend = () => {
        if (onEndCallback) onEndCallback();
      };
      utterance.onerror = (e) => {
        console.warn("Speech synthesis notice:", e);
        if (onEndCallback) onEndCallback();
      };

      this.synthesis.speak(utterance);
    } catch (err) {
      console.warn("Speech error:", err);
      if (onEndCallback) onEndCallback();
    }
  }

  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  startListening(onInterim, onFinal, onError) {
    this.playChime('beep');
    if (!this.recognition) {
      console.warn("Browser SpeechRecognition not supported; using simulated voice input.");
      this.simulateSpeechRecognition(onFinal);
      return;
    }

    try {
      this.recognition.lang = this.langMap[this.currentLanguage].code;
      this.isListening = true;

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (interimTranscript && onInterim) {
          onInterim(interimTranscript);
        }
        if (finalTranscript && onFinal) {
          this.isListening = false;
          this.playChime('success');
          onFinal(finalTranscript);
        }
      };

      this.recognition.onerror = (err) => {
        console.warn("Recognition error, falling back to simulated input:", err);
        this.isListening = false;
        if (onError) onError(err);
        this.simulateSpeechRecognition(onFinal);
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      this.recognition.start();
    } catch (e) {
      console.warn("Error starting speech recognition:", e);
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
      if (onFinal) {
        onFinal("Simulated natural voice input captured.");
      }
    }, 1800);
  }
}

window.VoiceEngine = VoiceEngine;
