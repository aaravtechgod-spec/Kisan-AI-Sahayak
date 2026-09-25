import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  ArrowLeft,
  Volume2,
  VolumeX,
  PhoneCall,
  Sparkles,
  RefreshCw,
  Droplets,
  Bug,
  Leaf,
  DollarSign,
  ChevronDown,
  ChevronUp,
  WifiOff,
} from 'lucide-react';
import { speechManager } from '../utils/speech';
import { runOfflineAgronomyTriage, OfflineAdvisoryResult } from '../utils/offlineAgronomyEngine';

interface VoiceAssistantViewProps {
  lang: 'hi' | 'en';
  onBack: () => void;
  isSunMode?: boolean;
}

const QUICK_VOICE_PROMPTS = [
  {
    icon: '🌾',
    textHi: 'गेहूं की पत्ती पीली पड़ रही है',
    textEn: 'Wheat leaves turning yellow',
    domain: 'Agriculture & Climate',
  },
  {
    icon: '🐛',
    textHi: 'फसल में कीड़ा लग गया है',
    textEn: 'Pests attacking the crop',
    domain: 'Agriculture & Climate',
  },
  {
    icon: '💧',
    textHi: 'सिंचाई कब और कितनी करें',
    textEn: 'When to irrigate field',
    domain: 'Agriculture & Climate',
  },
  {
    icon: '💰',
    textHi: 'खाद का सही खर्च व बचत',
    textEn: 'Save fertilizer cost',
    domain: 'Agriculture & Climate',
  },
];

export const VoiceAssistantView: React.FC<VoiceAssistantViewProps> = ({
  lang,
  onBack,
  isSunMode = false,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [spokenAnswer, setSpokenAnswer] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offlineResult, setOfflineResult] = useState<OfflineAdvisoryResult | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Start listening automatically when opening Voice Assistant for illiterate farmers!
    startListening();
    return () => {
      stopListening();
      speechManager.stop();
    };
  }, []);

  const startListening = () => {
    speechManager.stop();
    setIsSpeaking(false);
    setError(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        lang === 'hi'
          ? 'आपके ब्राउज़र में माइक समर्थित नहीं है। नीचे दिए बटनों पर टैप करें।'
          : 'Speech recognition not supported. Tap quick prompt buttons below.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          setTranscript(text);
          sendVoiceQuery(text);
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error('Speech recognition failed to start:', e);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  const toggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const sendVoiceQuery = async (queryText: string) => {
    setLoading(true);
    setResponse(null);
    setSpokenAnswer(null);
    setError(null);
    setOfflineResult(null);

    // Audio cue that query is being processed
    speechManager.speak(
      lang === 'hi' ? 'सलाह खोजी जा रही है...' : 'Finding agricultural answer...',
      lang
    );

    // If completely offline, immediately run on-device agronomy engine
    if (!navigator.onLine) {
      const offlineAdvice = runOfflineAgronomyTriage(queryText);
      setOfflineResult(offlineAdvice);
      const spokenText = lang === 'hi' ? offlineAdvice.spokenSentenceHindi : offlineAdvice.spokenSentence;
      setSpokenAnswer(spokenText);
      speechManager.speak(
        spokenText,
        lang,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        () => setIsSpeaking(false)
      );
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: queryText,
          mode: 'AUTO',
          contextOptions: {
            preferredLanguage: lang,
            farmerMode: true,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Advisory service unavailable');
      }

      setResponse(data.text);

      // Clean spoken sentence generated by backend
      const singleSpokenSentence = data.spokenSentence || (
        lang === 'hi'
          ? 'आपकी समस्या का समाधान तैयार है। तुरंत बताए अनुसार उपाय करें।'
          : 'Your farming advisory is ready. Follow the spoken steps.'
      );
      setSpokenAnswer(singleSpokenSentence);

      // TTS automatically speaks the answer out loud
      speechManager.speak(
        singleSpokenSentence,
        lang,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        () => setIsSpeaking(false)
      );
    } catch (err: any) {
      console.warn('Online advisory failed or timeout, falling back to on-device offline AI:', err);
      // Seamless failover to deterministic on-device agronomy engine!
      const offlineAdvice = runOfflineAgronomyTriage(queryText);
      setOfflineResult(offlineAdvice);
      const spokenText = lang === 'hi' ? offlineAdvice.spokenSentenceHindi : offlineAdvice.spokenSentence;
      setSpokenAnswer(spokenText);
      speechManager.speak(
        spokenText,
        lang,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        () => setIsSpeaking(false)
      );
    } finally {
      setLoading(false);
    }
  };

  const speakAnswerAgain = () => {
    if (!spokenAnswer) return;
    if (isSpeaking) {
      speechManager.stop();
      setIsSpeaking(false);
      return;
    }
    speechManager.speak(
      spokenAnswer,
      lang,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
  };

  return (
    <div className="min-h-screen bg-slate-900/5 sm:bg-slate-200 flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-slate-100 text-slate-900 pb-16 shadow-2xl relative sm:border-x border-slate-300/80 flex flex-col">
      {/* Top High-Contrast Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white border-b-3 border-black px-4 py-3 flex items-center justify-between shadow-sm">
        <button
          type="button"
          onClick={() => {
            stopListening();
            speechManager.stop();
            onBack();
          }}
          className="h-12 px-4 rounded-xl border-2 border-black bg-slate-100 active:bg-slate-200 font-black text-sm flex items-center gap-2 shadow-[0_3px_0_0_#000]"
        >
          <ArrowLeft className="w-5 h-5 text-black" />
          <span>{lang === 'hi' ? 'पीछे जाएं' : 'Back'}</span>
        </button>

        <div className="flex items-center gap-2 font-black text-base sm:text-lg">
          <span className="text-2xl">🎙️</span>
          <span>{lang === 'hi' ? 'बोलकर पूछें' : 'Voice Q&A'}</span>
        </div>

        <a
          href="tel:18001801551"
          className="h-12 w-12 rounded-xl border-2 border-black bg-emerald-400 active:bg-emerald-500 flex items-center justify-center shadow-[0_3px_0_0_#000]"
          title="Call Kisan Helpline"
        >
          <PhoneCall className="w-6 h-6 text-black" />
        </a>
      </header>

      <main className="w-full p-4 space-y-4 flex-1">
        {/* THE GIANT PRIMARY MIC ACTION BUTTON (>= 25% screen height) */}
        <div className="bg-white rounded-3xl border-3 border-black p-5 text-center shadow-[0_6px_0_0_#000] space-y-4">
          <span className="text-xs sm:text-sm font-black text-slate-600 uppercase tracking-wider block">
            {isListening
              ? lang === 'hi' ? '🔴 हम सुन रहे हैं, बोलिए...' : '🔴 Listening, please speak...'
              : loading
              ? lang === 'hi' ? '⏳ उत्तर तैयार हो रहा है...' : '⏳ Generating answer...'
              : lang === 'hi' ? 'माइक दबाकर सवाल पूछें' : 'Tap mic to ask question'}
          </span>

          {/* GIANT MIC BUTTON (>= 25% screen footprint) */}
          <button
            type="button"
            id="giant-voice-mic-button"
            onClick={toggleMic}
            disabled={loading}
            className={`w-full min-h-[170px] sm:min-h-[200px] rounded-3xl border-4 border-black flex flex-col items-center justify-center gap-3 shadow-[0_6px_0_0_#000] transition active:scale-98 cursor-pointer ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : loading
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white'
            }`}
          >
            <div className={`w-20 h-20 rounded-full border-3 border-black flex items-center justify-center shadow-inner ${
              isListening ? 'bg-white text-red-600 animate-bounce' : 'bg-white text-blue-700'
            }`}>
              {isListening ? (
                <MicOff className="w-11 h-11 text-red-600" />
              ) : (
                <Mic className="w-11 h-11 text-blue-700" />
              )}
            </div>

            <span className="text-xl sm:text-2xl font-black tracking-wide text-white">
              {isListening
                ? (lang === 'hi' ? 'रोकने के लिए दबाएं' : 'Tap to Stop')
                : (lang === 'hi' ? '🎙️ बोलिए (Tap to Speak)' : '🎙️ Tap to Speak')}
            </span>

            <span className="text-xs font-bold text-blue-100 bg-black/30 px-3 py-1 rounded-full">
              {isListening
                ? (lang === 'hi' ? 'अपनी भाषा में बोलें' : 'Speak now')
                : (lang === 'hi' ? 'हिंदी या English में पूछें' : 'Ask in any language')}
            </span>
          </button>

          {/* Transcript Caption (if user spoke) */}
          {transcript && (
            <div className="p-3 rounded-2xl bg-slate-50 border-2 border-slate-300 text-xs sm:text-sm font-bold text-slate-800">
              🗣️ "{transcript}"
            </div>
          )}
        </div>

        {/* SPOKEN RESULT SECTION (GEMINI RESPONDS IN SPEECH) */}
        {spokenAnswer && (
          <div className="bg-[#E8F8EE] rounded-3xl border-4 border-[#16A34A] p-5 shadow-[0_6px_0_0_#000] space-y-4 text-center">
            {/* Offline Engine Badge */}
            {offlineResult && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-black font-black text-xs border-2 border-black shadow-sm">
                <WifiOff className="w-4 h-4 text-black" />
                <span>{lang === 'hi' ? 'ऑफलाइन एआई इंजन सक्रिय (0 Data)' : 'Offline On-Device AI Active (0 Data)'}</span>
              </div>
            )}

            {/* 1. Large Talking Speaker Avatar */}
            <div className="relative mx-auto w-20 h-20 rounded-full bg-white border-3 border-black flex items-center justify-center shadow-[0_4px_0_0_#000]">
              <span className="text-4xl">{isSpeaking ? '🗣️' : '🌾'}</span>
              {isSpeaking && (
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 animate-ping" />
              )}
            </div>

            {/* 2. Audio Replay Button */}
            <button
              type="button"
              onClick={speakAnswerAgain}
              className={`w-full h-14 rounded-2xl border-3 border-black font-black text-base flex items-center justify-center gap-2 shadow-[0_4px_0_0_#000] active:scale-95 transition ${
                isSpeaking
                  ? 'bg-amber-400 text-black animate-pulse'
                  : 'bg-emerald-500 text-black hover:bg-emerald-400'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-6 h-6 text-black" /> : <Volume2 className="w-6 h-6 text-black" />}
              <span>{isSpeaking ? (lang === 'hi' ? 'आवाज़ रोकें' : 'Stop Audio') : (lang === 'hi' ? '🔊 फिर से सुनें' : '🔊 Listen Again')}</span>
            </button>

            {/* 3. ONE Spoken Sentence as a Secondary Caption */}
            <div className="bg-white/95 rounded-2xl border-2 border-black p-3.5 text-left space-y-1">
              <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider block">
                {lang === 'hi' ? '📢 कृषि वैज्ञानिक का उत्तर (Caption):' : '📢 Agronomist Spoken Answer (Caption):'}
              </span>
              <p className="text-base font-black text-slate-950 leading-snug">
                "{spokenAnswer}"
              </p>
            </div>

            {/* Primary Action Button: 1-Tap Helpline */}
            <a
              href="tel:18001801551"
              className="w-full h-14 rounded-2xl bg-[#16A34A] text-white border-3 border-black font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0_4px_0_0_#000]"
            >
              <PhoneCall className="w-5 h-5 text-white" />
              <span>{lang === 'hi' ? '📞 विशेषज्ञ से बात करें: 1800-180-1551' : '📞 Call Expert: 1800-180-1551'}</span>
            </a>

            {/* Collapsible Full Advice Report (optional for literate relatives) */}
            {response && (
              <div className="bg-white rounded-2xl border-2 border-black p-3 text-left">
                <button
                  type="button"
                  onClick={() => setShowFullDetails(!showFullDetails)}
                  className="w-full text-xs font-black text-slate-800 flex items-center justify-between py-1"
                >
                  <span>{lang === 'hi' ? '📋 पूरा विवरण (दवा व खुराक)' : '📋 Full Treatment Details'}</span>
                  {showFullDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showFullDetails && (
                  <div className="pt-3 border-t border-slate-200 mt-2 text-xs text-slate-800 whitespace-pre-line max-h-60 overflow-y-auto font-medium leading-relaxed">
                    {response}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* QUICK 1-TAP VISUAL PROMPT CHIPS (For illiterate farmers who prefer tapping) */}
        {!spokenAnswer && (
          <div className="bg-white rounded-3xl border-3 border-black p-4 shadow-[0_6px_0_0_#000] space-y-3">
            <span className="text-xs sm:text-sm font-black text-slate-800 block">
              {lang === 'hi' ? 'या इन मुख्य सवालों पर 1-टैप करें:' : 'Or tap common question:'}
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              {QUICK_VOICE_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    const txt = lang === 'hi' ? item.textHi : item.textEn;
                    setTranscript(txt);
                    sendVoiceQuery(txt);
                  }}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 active:bg-blue-100 border-2 border-black text-left flex flex-col gap-1.5 shadow-[0_2px_0_0_#000] transition"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-xs font-black text-slate-900 leading-snug">
                    {lang === 'hi' ? item.textHi : item.textEn}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-100 border-2 border-red-600 text-red-950 text-xs font-bold">
            {error}
          </div>
        )}
      </main>
      </div>
    </div>
  );
};
