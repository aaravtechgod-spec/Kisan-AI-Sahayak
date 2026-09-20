import React from 'react';
import { MentorAudit } from '../types';
import { History, Trash2, ArrowUpRight, FileText } from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/translations';

interface SprintLogProps {
  audits: MentorAudit[];
  onSelectAudit: (audit: MentorAudit) => void;
  onClearHistory: () => void;
  activeId?: string;
  lang?: Language;
}

export const SprintLog: React.FC<SprintLogProps> = ({
  audits,
  onSelectAudit,
  onClearHistory,
  activeId,
  lang = 'hi',
}) => {
  const t = TRANSLATIONS[lang];

  if (audits.length === 0) {
    return (
      <div className="bg-[#111722] border border-neutral-800 rounded-xl p-4 text-center">
        <div className="flex items-center justify-center gap-2 text-neutral-400 font-sans text-xs mb-1">
          <History className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-neutral-300">
            {lang === 'en' ? 'Previous Advice & Slips (0)' : 'पिछली सलाह और पर्चियां (0)'}
          </span>
        </div>
        <p className="text-xs text-neutral-500 font-sans">
          {lang === 'en'
            ? 'When you ask a question, the recommended medicines and steps will be saved here.'
            : 'जब आप कोई सवाल पूछेंगे, तो उसकी दवा, उपाय और सलाह यहाँ सुरक्षित सहेज ली जाएगी।'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#111722] border border-emerald-500/30 rounded-xl p-4 shadow-xl space-y-3">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs sm:text-sm font-bold tracking-wide text-white font-sans">
            {lang === 'en' ? `Saved Prescriptions (${audits.length})` : `सहेजी गई किसान पर्चियां (${audits.length})`}
          </h3>
        </div>
        <button
          type="button"
          id="clear-sprint-log-button"
          onClick={onClearHistory}
          className="text-neutral-500 hover:text-rose-400 transition text-xs p-1"
          title={lang === 'en' ? 'Clear History' : 'इतिहास साफ करें'}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
        {audits.map((item) => {
          const isSelected = item.id === activeId;
          const verdictColor =
            item.verdict === 'SHIP IT'
              ? 'text-emerald-400 border-emerald-500/40 bg-emerald-950/60'
              : item.verdict === 'FAKE IT'
              ? 'text-amber-400 border-amber-500/40 bg-amber-950/60'
              : item.verdict === 'CUT IT'
              ? 'text-rose-400 border-rose-500/40 bg-rose-950/60'
              : 'text-neutral-400 border-neutral-700 bg-neutral-800/40';

          const verdictLabel =
            item.verdict === 'SHIP IT'
              ? (lang === 'en' ? '✅ Recommended' : '✅ तुरंत करें')
              : item.verdict === 'FAKE IT'
              ? (lang === 'en' ? '⚠️ Caution' : '⚠️ सावधानी')
              : item.verdict === 'CUT IT'
              ? (lang === 'en' ? '❌ Avoid' : '❌ न करें')
              : (lang === 'en' ? 'Advice' : 'सलाह');

          return (
            <button
              key={item.id}
              type="button"
              id={`audit-history-item-${item.id}`}
              onClick={() => onSelectAudit(item)}
              className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs font-sans group ${
                isSelected
                  ? 'bg-neutral-800/90 border-emerald-500 shadow-md'
                  : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-neutral-500 text-[10px] font-mono">
                  {item.timestamp}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] border font-bold ${verdictColor}`}>
                  {verdictLabel}
                </span>
              </div>
              <div className="text-neutral-200 line-clamp-2 text-xs group-hover:text-emerald-300 font-medium">
                {item.query}
              </div>
              <div className="flex items-center justify-between mt-1 text-[10px] text-neutral-400">
                <span>{lang === 'en' ? '🔊 Voice audio available' : '🔊 आवाज में उपलब्ध'}</span>
                <span className="flex items-center gap-0.5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                  {lang === 'en' ? 'Open' : 'खोलें'} <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
