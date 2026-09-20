import React from 'react';
import { StatusBlock } from '../types';
import { Sprout, Droplets, MapPin, Calendar } from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/translations';

interface StatusBlockEditorProps {
  status: StatusBlock;
  onChange: (status: StatusBlock) => void;
  lang?: Language;
}

const POPULAR_CROPS_HI = [
  '🌾 गेहूं (Wheat)',
  '🌿 कपास (Cotton)',
  '🌱 धान (Paddy)',
  '🌻 सरसों (Mustard)',
  '🫘 सोयाबीन (Soybean)',
  '🌽 मक्का (Maize)',
  '🥔 आलू / सब्जी',
];

const POPULAR_CROPS_EN = [
  '🌾 Wheat (PBW 550)',
  '🌿 Cotton (Bt Cotton)',
  '🌱 Paddy (Basmati)',
  '🌻 Mustard',
  '🫘 Soybean',
  '🌽 Maize (Corn)',
  '🥔 Potato / Veggies',
];

export const StatusBlockEditor: React.FC<StatusBlockEditorProps> = ({
  status,
  onChange,
  lang = 'hi',
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const t = TRANSLATIONS[lang];
  const popularCrops = lang === 'en' ? POPULAR_CROPS_EN : POPULAR_CROPS_HI;

  const updateField = (field: keyof StatusBlock, value: any) => {
    onChange({
      ...status,
      [field]: value,
    });
  };

  return (
    <div className="bg-[#111722] border border-emerald-500/30 rounded-xl p-3.5 sm:p-4 shadow-xl space-y-3 sm:space-y-4">
      {/* Header & Farm Overview - Tap to expand on mobile */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between border-b border-neutral-800 pb-3 cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold tracking-wide text-white font-sans">
              {t.farmProfileTitle}
            </h2>
            <div className="text-[11px] text-emerald-400 font-mono">
              {status.works ? status.works.split('(')[0] : (lang === 'en' ? 'Select crop' : 'फसल चुनें')} • {status.stubbed ? status.stubbed.split(',')[0] : (lang === 'en' ? 'Farm' : 'खेत')}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-md border border-emerald-500/40 bg-emerald-950/60 font-sans font-bold text-xs text-emerald-300">
            {t.activeFarmBadge}
          </div>
          <span className="text-[11px] text-neutral-400 lg:hidden">
            {isExpanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {/* Body: Always visible on desktop (lg:block), collapsible on mobile */}
      <div className={`space-y-3.5 ${isExpanded ? 'block' : 'hidden lg:block'}`}>
        {/* Quick Crop Selector */}
        <div>
          <label className="block text-xs font-sans text-neutral-300 mb-1.5 flex justify-between items-center font-medium">
            <span>{t.quickCropSelect}</span>
            <span className="text-emerald-400 text-[11px]">{t.tapToSelect}</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {popularCrops.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => updateField('works', c)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  status.works === c
                    ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Crop Details */}
        <div>
          <label className="text-xs font-sans text-emerald-400 mb-1 flex items-center gap-1.5 font-medium">
            <Sprout className="w-3.5 h-3.5" />
            <span>{t.currentCropLabel}</span>
          </label>
          <input
            type="text"
            id="status-works-textarea"
            value={status.works}
            onChange={(e) => updateField('works', e.target.value)}
            placeholder={t.currentCropPlaceholder}
            className="w-full bg-[#0a0d14] border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/70 font-sans"
          />
        </div>

        {/* Soil and Land Size */}
        <div>
          <label className="text-xs font-sans text-amber-400 mb-1 flex items-center gap-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5" />
            <span>{t.landAndSoilLabel}</span>
          </label>
          <input
            type="text"
            id="status-stubbed-textarea"
            value={status.stubbed}
            onChange={(e) => updateField('stubbed', e.target.value)}
            placeholder={t.landAndSoilPlaceholder}
            className="w-full bg-[#0a0d14] border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/70 font-sans"
          />
        </div>

        {/* Water Source & Irrigation */}
        <div>
          <label className="text-xs font-sans text-sky-400 mb-1 flex items-center gap-1.5 font-medium">
            <Droplets className="w-3.5 h-3.5" />
            <span>{t.irrigationLabel}</span>
          </label>
          <input
            type="text"
            id="status-cut-textarea"
            value={status.cut}
            onChange={(e) => updateField('cut', e.target.value)}
            placeholder={t.irrigationPlaceholder}
            className="w-full bg-[#0a0d14] border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-sky-500/70 font-sans"
          />
        </div>

        {/* Days since sowing / stage */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <label className="text-xs font-sans text-neutral-400 flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            <span>{t.cropAgeLabel}</span>
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              id="custom-hours-input"
              min="1"
              max="250"
              value={status.hoursRemaining}
              onChange={(e) => updateField('hoursRemaining', Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs font-mono text-neutral-100 focus:outline-none focus:border-emerald-500 text-center"
            />
            <span className="text-xs text-neutral-400">{t.cropAgeDays}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
