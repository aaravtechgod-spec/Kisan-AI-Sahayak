import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Verdict } from '../types';
import {
  Copy,
  Check,
  Share2,
  Volume2,
  VolumeX,
  PhoneCall,
  Sparkles,
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/translations';

interface MentorOutputCardProps {
  content: string;
  verdict?: Verdict | null;
  feasibilityScore?: number | null;
  modelUsed?: string;
  onApplyCut?: (cutText: string) => void;
  farmerMode?: boolean;
  lang?: Language;
}

export const MentorOutputCard: React.FC<MentorOutputCardProps> = ({
  content,
  verdict,
  feasibilityScore,
  lang = 'hi',
}) => {
  const [copiedAll, setCopiedAll] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const t = TRANSLATIONS[lang];

  // Extract Kisan summary if present
  const kisanSummaryMatch = content.match(/🌾 KISAN SUMMARY[^\n]*\n([\s\S]*?)(?=(?:\[|$|\n\n\n|FEASIBILITY|💊))/i);
  const kisanSummaryText = kisanSummaryMatch ? kisanSummaryMatch[1].trim() : null;

  // Extract Medicine / Dosage if present
  const remedyMatch = content.match(/💊[^\n]*\n([\s\S]*?)(?=(?:💰|⚠️|FEASIBILITY|\[|$))/i);
  const remedyText = remedyMatch ? remedyMatch[1].trim() : null;

  const handleSpeakAloud = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    // Clean text for speech
    let textToRead = kisanSummaryText || content.slice(0, 600);
    textToRead = textToRead.replace(/[#*`_\[\]]/g, '').trim();

    const utterance = new SpeechSynthesisUtterance(textToRead);
    const hasHindi = /[\u0900-\u097F]/.test(textToRead);
    utterance.lang = lang === 'en' ? 'en-IN' : (hasHindi ? 'hi-IN' : 'en-US');
    utterance.rate = 0.9;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  const handleShareWhatsApp = () => {
    const title = lang === 'en'
      ? '*🌾 Kisan AI Assistant - Crop Doctor Prescription*\n\n'
      : '*🌾 किसान एआई सहायक - फसल सलाह व उपचार पर्ची*\n\n';
    const helpline = lang === 'en'
      ? '_Kisan Helpline Toll-Free: 1800-180-1551_'
      : '_किसान हेल्पलाइन टोल-फ्री: 1800-180-1551_';
    const shareText = `${title}${content.slice(0, 700)}\n\n${helpline}`;
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(content);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const getVerdictBadge = (v: Verdict) => {
    switch (v) {
      case 'SHIP IT':
        return (
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-emerald-500/20 border-2 border-emerald-500/60 text-emerald-300 font-sans font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/40">
            <span className="text-xl sm:text-2xl">🟢</span>
            <div>
              <div className="leading-tight text-white font-bold">{t.verdictShipTitle}</div>
              <div className="text-[11px] text-emerald-300 font-normal">{t.verdictShipSubtitle}</div>
            </div>
          </div>
        );
      case 'FAKE IT':
        return (
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-amber-500/20 border-2 border-amber-500/60 text-amber-300 font-sans font-bold text-xs sm:text-sm shadow-lg shadow-amber-950/40">
            <span className="text-xl sm:text-2xl">🟡</span>
            <div>
              <div className="leading-tight text-white font-bold">{t.verdictFakeTitle}</div>
              <div className="text-[11px] text-amber-300 font-normal">{t.verdictFakeSubtitle}</div>
            </div>
          </div>
        );
      case 'CUT IT':
        return (
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-rose-500/20 border-2 border-rose-500/60 text-rose-300 font-sans font-bold text-xs sm:text-sm shadow-lg shadow-rose-950/40">
            <span className="text-xl sm:text-2xl">🔴</span>
            <div>
              <div className="leading-tight text-white font-bold">{t.verdictCutTitle}</div>
              <div className="text-[11px] text-rose-300 font-normal">{t.verdictCutSubtitle}</div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#111722] border border-emerald-500/40 rounded-xl overflow-hidden shadow-2xl">
      {/* Top Banner with Verdict & Audio */}
      <div className="bg-gradient-to-r from-emerald-950/90 via-[#101926] to-[#111722] px-4 sm:px-5 py-3.5 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {verdict ? getVerdictBadge(verdict) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-sans text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'en' ? 'Crop Doctor Advisory Slip' : 'कृषि विशेषज्ञ सलाह व पर्ची'}</span>
            </div>
          )}

          {feasibilityScore !== null && feasibilityScore !== undefined && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono">
              <span className="text-neutral-400">{lang === 'en' ? 'Success Rate:' : 'सफलता दर:'}</span>
              <span className="font-bold text-emerald-400">
                {Math.round(feasibilityScore * 10)}%
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Read Aloud Button */}
          <button
            type="button"
            id="speak-aloud-mentor-button"
            onClick={handleSpeakAloud}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-sans text-xs font-bold transition-all shadow-md min-h-[40px] ${
              isPlayingAudio
                ? 'bg-amber-500 text-black border border-amber-400 animate-pulse'
                : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
            }`}
            title={lang === 'en' ? 'Listen Aloud' : 'बोलकर सुनाओ'}
          >
            {isPlayingAudio ? <VolumeX className="w-4 h-4 text-black" /> : <Volume2 className="w-4 h-4 text-black" />}
            <span>{isPlayingAudio ? t.stopAudio : (lang === 'en' ? '🔊 Listen Aloud' : '🔊 बोलकर सुनें')}</span>
          </button>

          {/* Share on WhatsApp */}
          <button
            type="button"
            id="share-whatsapp-button"
            onClick={handleShareWhatsApp}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-green-600/90 hover:bg-green-600 text-white text-xs font-bold font-sans transition min-h-[40px] shadow"
            title="Share via WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          <button
            type="button"
            id="copy-all-mentor-button"
            onClick={handleCopyAll}
            className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white text-xs font-mono transition min-h-[40px]"
            title={t.copyPrescription}
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedAll ? t.copied : (lang === 'en' ? 'Copy' : 'कॉपी')}</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 sm:p-6 space-y-4">
        {/* Simple Audio Banner for Farmers */}
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📢</span>
            <div className="text-xs">
              <div className="font-bold text-white text-sm">
                {lang === 'en' ? 'Voice Readout Feature' : 'किसान भाइयों के लिए आवाज सुविधा (Voice Readout)'}
              </div>
              <div className="text-neutral-300 text-xs mt-0.5">
                {lang === 'en'
                  ? 'Tap the green "🔊 Listen Aloud" button to hear this advice read aloud.'
                  : 'पढ़ने में परेशानी हो तो हरा बटन "🔊 बोलकर सुनें" दबाएं।'}
              </div>
            </div>
          </div>
          <button
            type="button"
            id="quick-listen-farmer-button"
            onClick={handleSpeakAloud}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shrink-0 transition"
          >
            {isPlayingAudio ? (lang === 'en' ? 'Stop' : 'रोकें') : (lang === 'en' ? 'Listen' : 'सुनें')}
          </button>
        </div>

        {/* Quick Prescription Highlight if remedy is found */}
        {remedyText && (
          <div className="p-3.5 rounded-xl bg-[#0e1622] border border-emerald-500/40 shadow-sm space-y-1.5">
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-2">
              <span>💊</span>
              <span>{t.treatmentHeader}:</span>
            </div>
            <div className="text-xs text-neutral-200 leading-relaxed pl-5 whitespace-pre-line font-sans">
              {remedyText}
            </div>
          </div>
        )}

        {/* Markdown Output */}
        <div className="prose prose-invert max-w-none text-neutral-200 text-sm leading-relaxed font-sans space-y-3.5">
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className="text-base sm:text-lg font-bold text-emerald-400 border-b border-neutral-800 pb-1.5 mt-3">{children}</h1>,
              h2: ({ children }) => <h2 className="text-sm sm:text-base font-bold text-white mt-3">{children}</h2>,
              h3: ({ children }) => <h3 className="text-xs sm:text-sm font-semibold text-emerald-300 mt-2">{children}</h3>,
              p: ({ children }) => <p className="text-neutral-200 text-sm leading-relaxed my-2 font-sans">{children}</p>,
              ul: ({ children }) => <ul className="list-disc list-outside pl-5 space-y-1.5 text-neutral-200 text-sm my-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-outside pl-5 space-y-1.5 text-neutral-200 text-sm my-2">{children}</ol>,
              li: ({ children }) => <li className="text-neutral-200">{children}</li>,
              strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
              code: ({ children }) => (
                <code className="bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 rounded font-mono text-xs text-amber-300">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="bg-[#090b10] border border-neutral-800 p-3 rounded-lg overflow-x-auto text-xs font-mono text-emerald-400">
                  {children}
                </pre>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>

        {/* Kisan Helpline Footer Card */}
        <div className="mt-4 p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-neutral-300">
            <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {lang === 'en' ? 'Free Govt Agri Helpline: ' : 'मुफ्त सरकारी कृषि विशेषज्ञ सलाह: '}
              <strong className="text-white">1800-180-1551</strong> ({lang === 'en' ? 'Toll-Free' : 'टोल-फ्री'})
            </span>
          </div>
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="text-emerald-400 hover:text-emerald-300 font-bold underline shrink-0"
          >
            {lang === 'en' ? 'Send to Shop →' : 'दवा दुकान को भेजें →'}
          </button>
        </div>
      </div>
    </div>
  );
};
