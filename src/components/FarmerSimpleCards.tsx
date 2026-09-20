import React from 'react';
import { Volume2, Mic } from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/translations';

interface FarmerSimpleCardsProps {
  onSelectQuery: (query: string, domain: 'Agriculture & Climate' | 'Healthcare') => void;
  onVoiceInputToggle: () => void;
  isListening: boolean;
  lang?: Language;
}

export const FarmerSimpleCards: React.FC<FarmerSimpleCardsProps> = ({
  onSelectQuery,
  onVoiceInputToggle,
  isListening,
  lang = 'hi',
}) => {
  const t = TRANSLATIONS[lang];

  const speakHelp = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'en' ? 'en-IN' : 'hi-IN';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const cards = [
    {
      id: 'pest',
      icon: '🐛',
      title: lang === 'en' ? t.cardPestTitle : 'कीट व बीमारी का इलाज',
      desc: t.cardPestDesc,
      speechText: t.cardPestAudio,
      query: t.cardPestQuery,
      domain: 'Agriculture & Climate' as const,
      color: 'from-emerald-950/80 to-emerald-900/40 border-emerald-500/50 text-emerald-300',
    },
    {
      id: 'water',
      icon: '💧',
      title: lang === 'en' ? t.cardWaterTitle : 'मौसम व सिंचाई सलाह',
      desc: t.cardWaterDesc,
      speechText: t.cardWaterAudio,
      query: t.cardWaterQuery,
      domain: 'Agriculture & Climate' as const,
      color: 'from-sky-950/80 to-sky-900/40 border-sky-500/50 text-sky-300',
    },
    {
      id: 'fertilizer',
      icon: '🧪',
      title: lang === 'en' ? t.cardFertilizerTitle : 'खाद व पोषण प्रबंधन',
      desc: t.cardFertilizerDesc,
      speechText: t.cardFertilizerAudio,
      query: t.cardFertilizerQuery,
      domain: 'Agriculture & Climate' as const,
      color: 'from-amber-950/80 to-amber-900/40 border-amber-500/50 text-amber-300',
    },
    {
      id: 'scheme',
      icon: '🏛️',
      title: lang === 'en' ? t.cardSchemeTitle : 'सरकारी योजना व सब्सिडी',
      desc: t.cardSchemeDesc,
      speechText: t.cardSchemeAudio,
      query: t.cardSchemeQuery,
      domain: 'Agriculture & Climate' as const,
      color: 'from-purple-950/80 to-purple-900/40 border-purple-500/50 text-purple-300',
    },
  ];

  return (
    <div className="space-y-3 bg-[#111622] border-2 border-emerald-500/40 rounded-2xl p-4 shadow-xl">
      {/* Friendly Visual Banner for Farmers */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-gradient-to-r from-emerald-900/60 to-amber-900/40 p-3 sm:p-3.5 rounded-xl border border-emerald-500/30">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="text-2xl sm:text-3xl bg-emerald-500/20 p-2 rounded-xl border border-emerald-400/40 shrink-0">
            🚜
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm sm:text-base font-bold text-white tracking-wide">
                {t.cardsHeaderTitle}
              </span>
              <span className="text-[10px] bg-emerald-500 text-black font-bold px-2 py-0.5 rounded-full uppercase font-sans whitespace-nowrap shrink-0">
                {t.cardsHeaderTag}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-emerald-200/90 font-medium">
              {t.cardsHeaderSubtitle}
            </p>
          </div>
        </div>

        {/* Large Voice Action */}
        <button
          type="button"
          id="farmer-voice-speak-button"
          onClick={onVoiceInputToggle}
          className={`px-4 py-2.5 sm:py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-xs sm:text-sm shadow-lg transition-all active:scale-95 touch-manipulation min-h-[44px] whitespace-nowrap shrink-0 ${
            isListening
              ? 'bg-rose-600 text-white animate-pulse'
              : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/30'
          }`}
        >
          <Mic className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span className="whitespace-nowrap">{isListening ? t.listening : t.tapToSpeak}</span>
        </button>
      </div>

      {/* Big Visual Grid: 2 columns on phone with large tap targets */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`relative rounded-xl border-2 p-3 sm:p-4 bg-gradient-to-b ${card.color} flex flex-col justify-between transition-all hover:scale-[1.02] active:scale-98 cursor-pointer touch-manipulation`}
            onClick={() => onSelectQuery(card.query, card.domain)}
          >
            <div className="flex items-start justify-between">
              <span className="text-3xl sm:text-4xl filter drop-shadow">{card.icon}</span>
              <button
                type="button"
                id={`listen-card-${card.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  speakHelp(card.speechText);
                }}
                className="p-2 rounded-full bg-black/40 hover:bg-black/70 text-white/90 transition"
                title={lang === 'en' ? 'Listen in English' : 'आवाज में सुनें'}
              >
                <Volume2 className="w-4 h-4 text-amber-300" />
              </button>
            </div>

            <div className="mt-2.5">
              <h4 className="font-bold text-sm sm:text-base text-white leading-tight">
                {card.title}
              </h4>
              <p className="text-[11px] text-neutral-300 mt-1 line-clamp-2 leading-snug">
                {card.desc}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-sans text-white/80">
              <span className="font-bold">{lang === 'en' ? 'Get Advice' : 'सलाह लें'}</span>
              <span className="text-emerald-400 font-bold text-sm">➔</span>
            </div>
          </div>
        ))}
      </div>

      {/* Visual Recommendation Legend for farmers */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-800 text-center">
        <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs">
          <div className="text-lg">✅</div>
          <div className="font-bold leading-tight">{lang === 'en' ? 'Do Immediately' : 'तुरंत करें'}</div>
          <div className="text-[10px] text-emerald-400/80 mt-0.5">{lang === 'en' ? 'Safe & Profitable' : 'फसल के लिए सुरक्षित'}</div>
        </div>
        <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs">
          <div className="text-lg">⚠️</div>
          <div className="font-bold leading-tight">{lang === 'en' ? 'Proceed with Caution' : 'सावधानी बरतें'}</div>
          <div className="text-[10px] text-amber-400/80 mt-0.5">{lang === 'en' ? 'Check conditions' : 'मौसम व मात्रा देखकर'}</div>
        </div>
        <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
          <div className="text-lg">❌</div>
          <div className="font-bold leading-tight">{lang === 'en' ? 'Do Not Do' : 'बिल्कुल न करें'}</div>
          <div className="text-[10px] text-rose-400/80 mt-0.5">{lang === 'en' ? 'Risk of Crop Loss' : 'नुकसान की संभावना'}</div>
        </div>
      </div>
    </div>
  );
};
