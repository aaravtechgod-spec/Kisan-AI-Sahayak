import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Wind,
  CloudRain,
  Sun,
  Sparkles,
} from 'lucide-react';
import { WeatherSprayAdvisory } from '../types';
import { speechManager } from '../utils/speech';

interface SpraySafetyTrafficCardProps {
  lang: 'hi' | 'en';
  isSunMode?: boolean;
}

export const SpraySafetyTrafficCard: React.FC<SpraySafetyTrafficCardProps> = ({
  lang,
  isSunMode = false,
}) => {
  const [advisory, setAdvisory] = useState<WeatherSprayAdvisory | null>(() => {
    const saved = localStorage.getItem('kisan_cached_weather');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });

  const [loading, setLoading] = useState(!advisory);
  const [showDetails, setShowDetails] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const hasAutoPlayedRef = useRef(false);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/weather-advisory');
      const data = await res.json();
      if (res.ok && data.success && data.weather) {
        setAdvisory(data.weather);
        localStorage.setItem('kisan_cached_weather', JSON.stringify(data.weather));
      }
    } catch (e) {
      console.warn('Weather fetch failed, utilizing cached/offline advisory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  // Determine current spray state
  const status = advisory?.spraySafetyStatus || 'SAFE';
  const isSafe = status === 'SAFE';
  const isCaution = status === 'CAUTION';
  const isUnsafe = status === 'UNSAFE';

  // Primary spoken sentence: strictly spray safety window (wind, rain, sunlight)
  const spokenSentence = isSafe
    ? lang === 'hi'
      ? 'हवा शांत है। अभी सुबह 10 बजे तक छिड़काव सुरक्षित है।'
      : 'Wind is calm. Safe to spray now until 10 AM.'
    : isCaution
    ? lang === 'hi'
      ? 'दोपहर की तेज धूप में दवा न छिड़कें। शाम 4 बजे के बाद छिड़कें।'
      : 'Midday heat causes chemical evaporation. Wait until 4 PM.'
    : lang === 'hi'
    ? 'तेज हवा और बारिश का खतरा है। अभी दवा का छिड़काव बिल्कुल न करें।'
    : 'High wind or rain forecast. Delay chemical spray immediately.';

  const handleSpeak = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (isSpeaking) {
      speechManager.stop();
      setIsSpeaking(false);
      return;
    }

    speechManager.speak(
      spokenSentence,
      lang,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
  };

  // FIX 1: Auto-play audio on render if allowed by browser policy, or pulse if gesture needed
  useEffect(() => {
    if (!hasAutoPlayedRef.current && advisory) {
      hasAutoPlayedRef.current = true;
      try {
        speechManager.speak(
          spokenSentence,
          lang,
          () => setIsSpeaking(true),
          () => setIsSpeaking(false),
          () => setIsSpeaking(false)
        );
      } catch (err) {
        console.warn('Browser blocked autoplay sound without user gesture:', err);
      }
    }
  }, [advisory, lang]);

  // Traffic-light color styling for extreme outdoor sun-glare legibility
  const cardBg = isSafe
    ? 'bg-[#ECFDF5] border-[#16A34A]'
    : isCaution
    ? 'bg-[#FEFCE8] border-[#CA8A04]'
    : 'bg-[#FEF2F2] border-[#DC2626]';

  const badgeBg = isSafe
    ? 'bg-[#16A34A] text-white'
    : isCaution
    ? 'bg-[#CA8A04] text-white'
    : 'bg-[#DC2626] text-white';

  return (
    <div
      onClick={() => handleSpeak()}
      className={`w-full rounded-3xl border-4 p-4 sm:p-5 shadow-[0_6px_0_0_#000] cursor-pointer transition-transform active:scale-[0.99] active:translate-y-0.5 select-none relative overflow-hidden ${cardBg}`}
    >
      {/* Top Row: Visual Hazard Symbol + Status Badge + Pulsing Audio Invite Button */}
      <div className="flex items-start justify-between gap-2.5 pb-3 border-b-2 border-black/15">
        <div className="flex items-center gap-3">
          {/* FIX 2: Universal recognizable hazard icon (No text required) */}
          <div
            className={`w-18 h-18 sm:w-20 sm:h-20 rounded-2xl border-3 border-black flex items-center justify-center shrink-0 shadow-[0_3px_0_0_#000] ${
              isSafe ? 'bg-emerald-100' : isCaution ? 'bg-amber-100' : 'bg-red-100'
            }`}
          >
            {isSafe ? (
              // Safe: Active green spray bottle with water drops
              <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="20" y="24" width="24" height="34" rx="5" fill="#16A34A" stroke="#000" strokeWidth="2.5" />
                <rect x="27" y="16" width="10" height="8" fill="#FFFFFF" stroke="#000" strokeWidth="2" />
                <path d="M32 16V10M32 10H42M42 10V14" stroke="#000" strokeWidth="3" strokeLinecap="round" />
                {/* Spray mist droplets */}
                <circle cx="48" cy="8" r="2.5" fill="#0284C7" />
                <circle cx="56" cy="12" r="2" fill="#0284C7" />
                <circle cx="52" cy="18" r="2" fill="#0284C7" />
                <circle cx="58" cy="22" r="2.5" fill="#0284C7" />
                {/* Checkmark badge */}
                <circle cx="32" cy="41" r="7" fill="#FFFFFF" />
                <path d="M28 41L31 44L36 38" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : isCaution ? (
              // Caution: Scorching midday sun with heat waves
              <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="14" fill="#EAB308" stroke="#000" strokeWidth="2.5" />
                <line x1="32" y1="8" x2="32" y2="14" stroke="#D97706" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="32" y1="50" x2="32" y2="56" stroke="#D97706" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="8" y1="32" x2="14" y2="32" stroke="#D97706" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="50" y1="32" x2="56" y2="32" stroke="#D97706" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="15" y1="15" x2="19" y2="19" stroke="#D97706" strokeWidth="3" strokeLinecap="round" />
                <line x1="45" y1="45" x2="49" y2="49" stroke="#D97706" strokeWidth="3" strokeLinecap="round" />
                {/* Hourglass in center */}
                <path d="M28 26H36L32 32L28 38H36" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            ) : (
              // FIX 2: UNSAFE: Big Red Prohibition Sign over Spray Canister with Stop Hand
              <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Spray bottle background */}
                <rect x="22" y="24" width="20" height="28" rx="4" fill="#94A3B8" stroke="#000" strokeWidth="2" opacity="0.6" />
                {/* Outer Bold Red Prohibition Circle */}
                <circle cx="32" cy="32" r="23" stroke="#DC2626" strokeWidth="5" fill="#FEF2F2" />
                {/* Heavy Red Diagonal Slash */}
                <line x1="16" y1="16" x2="48" y2="48" stroke="#DC2626" strokeWidth="5" strokeLinecap="round" />
                {/* Stop Hand Glyph */}
                <path
                  d="M26 35V24C26 23 27 22 28 22C29 22 30 23 30 24V32M30 24C30 23 31 22 32 22C33 22 34 23 34 24V32M34 25C34 24 35 23 36 23C37 23 38 24 38 25V33M38 28C38 27 39 26 40 26C41 26 42 27 42 28V36C42 41 38 44 34 44H32C28 44 26 40 26 36"
                  stroke="#991B1B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>

          <div>
            <span className={`inline-block px-3 py-1 rounded-xl text-sm sm:text-base font-black tracking-wide border-2 border-black shadow-[0_2px_0_0_#000] uppercase ${badgeBg}`}>
              {isSafe
                ? lang === 'hi'
                  ? '✅ छिड़काव सुरक्षित'
                  : '✅ SAFE TO SPRAY'
                : isCaution
                ? lang === 'hi'
                  ? '⏳ दोपहर में रोकें'
                  : '⏳ CAUTION: MIDDAY'
                : lang === 'hi'
                ? '🛑 छिड़काव रोकें'
                : '🛑 UNSAFE TO SPRAY'}
            </span>
          </div>
        </div>

        {/* FIX 1: Pulsing Audio Icon Invite Button (Prominent, Impossible to miss) */}
        <button
          type="button"
          onClick={handleSpeak}
          className={`shrink-0 flex items-center justify-center gap-1.5 h-14 px-3.5 sm:px-4 rounded-2xl border-3 border-black font-black text-sm transition-all shadow-[0_4px_0_0_#000] active:scale-95 ${
            isSpeaking
              ? 'bg-amber-400 text-black ring-4 ring-amber-300'
              : 'bg-white hover:bg-slate-50 text-slate-900 animate-pulse ring-3 ring-black/20'
          }`}
          title={lang === 'hi' ? 'सुनने के लिए दबाएं' : 'Tap to Listen'}
        >
          {isSpeaking ? (
            <>
              <VolumeX className="w-6 h-6 text-black shrink-0" />
              <span className="text-xs font-black">{lang === 'hi' ? 'बंद करें' : 'Stop'}</span>
            </>
          ) : (
            <>
              <Volume2 className="w-7 h-7 text-emerald-700 shrink-0" />
              <div className="text-left leading-none">
                <span className="block text-xs font-black text-emerald-800 uppercase">
                  {lang === 'hi' ? 'सुनिए' : 'Listen'}
                </span>
                <span className="block text-[9px] font-bold text-slate-500 mt-0.5">
                  {lang === 'hi' ? 'बोलकर' : 'Audio'}
                </span>
              </div>
            </>
          )}
        </button>
      </div>

      {/* FIX 1: Visual Sun-Arc / Day Timeline (No reading required) */}
      <div className="mt-3.5 bg-white/95 rounded-2xl border-2 border-black p-3 shadow-inner">
        <div className="flex items-center justify-between text-[11px] font-black text-slate-700 mb-1.5 px-0.5">
          <span className="flex items-center gap-1">
            <span>🌅</span>
            <span>{lang === 'hi' ? 'सुबह' : 'Morning'}</span>
          </span>
          <span className="flex items-center gap-1">
            <span>☀️</span>
            <span>{lang === 'hi' ? 'दोपहर (धूप)' : 'Midday (Sun)'}</span>
          </span>
          <span className="flex items-center gap-1">
            <span>🌇</span>
            <span>{lang === 'hi' ? 'शाम' : 'Evening'}</span>
          </span>
        </div>

        {/* Visual Sun-Arc Timeline Bar: Pure Color + Visual Symbol, Zero Text */}
        <div className="relative h-10 rounded-xl border-2 border-black overflow-hidden flex items-center shadow-sm">
          {/* Morning Window (Safe) - GREEN with checkmark & soft morning glow */}
          <div className="h-full flex-1 bg-[#22C55E] flex items-center justify-center border-r-2 border-black text-white text-base">
            <span className="drop-shadow">✅</span>
          </div>

          {/* Midday Window (Unsafe/Heat) - RED with prohibition/stop sign */}
          <div className="h-full flex-[1.4] bg-[#EF4444] flex items-center justify-center border-r-2 border-black text-white text-base">
            <span className="drop-shadow">🚫</span>
          </div>

          {/* Evening Window (Safe) - GREEN with checkmark */}
          <div className="h-full flex-1 bg-[#22C55E] flex items-center justify-center text-white text-base">
            <span className="drop-shadow">✅</span>
          </div>
        </div>
      </div>

      {/* FIX 1: Icon Pairing + Audio Matching Caption */}
      <div className="mt-3 bg-black/5 rounded-2xl p-2.5 flex items-center gap-3">
        {/* Icon pairing (Weather risk icon + Spray prohibition/allow icon) */}
        <div className="flex items-center gap-1 shrink-0 bg-white px-2 py-1.5 rounded-xl border-2 border-black shadow-sm">
          {isUnsafe ? (
            <>
              <Wind className="w-5 h-5 text-blue-600 animate-bounce" />
              <span className="text-sm font-black">+</span>
              <CloudRain className="w-5 h-5 text-indigo-600" />
            </>
          ) : isCaution ? (
            <>
              <Sun className="w-5 h-5 text-amber-500 animate-spin" />
              <span className="text-sm font-black">+</span>
              <span className="text-base">⏳</span>
            </>
          ) : (
            <>
              <Wind className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-black">+</span>
              <span className="text-base">🚿</span>
            </>
          )}
        </div>

        {/* Secondary caption that matches spoken audio word-for-word */}
        <p className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
          📢 {spokenSentence}
        </p>
      </div>

      {/* Collapsible Secondary Numeric Stats (Optional, collapsed by default) */}
      <div className="pt-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowDetails(!showDetails);
          }}
          className="text-xs font-bold text-slate-700 hover:text-black flex items-center gap-1 py-1"
        >
          <span>{lang === 'hi' ? 'तापमान, हवा व मौसम विवरण' : 'Temperature & Wind Details'}</span>
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showDetails && advisory && (
          <div className="space-y-2 pt-2 mt-1 border-t border-black/10">
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded-xl bg-white border border-slate-300 text-center">
                <span className="text-[10px] font-bold text-slate-500 block">{lang === 'hi' ? 'तापमान' : 'Temp'}</span>
                <span className="text-sm font-black text-slate-900">{advisory.temperature}°C</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-slate-300 text-center">
                <span className="text-[10px] font-bold text-slate-500 block">{lang === 'hi' ? 'हवा' : 'Wind'}</span>
                <span className="text-sm font-black text-slate-900">{advisory.windSpeedKmH} km/h</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-slate-300 text-center">
                <span className="text-[10px] font-bold text-slate-500 block">{lang === 'hi' ? 'बारिश' : 'Rain'}</span>
                <span className="text-sm font-black text-slate-900">{advisory.rainProbability}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
