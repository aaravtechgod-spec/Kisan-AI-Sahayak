import React, { useState } from 'react';
import { PhoneCall, ShieldAlert, Droplets, FlaskConical, Sun, ChevronDown, ChevronUp, Landmark } from 'lucide-react';
import { Language } from '../data/translations';

interface BricsCriteriaPanelProps {
  lang?: Language;
}

export const BricsCriteriaPanel: React.FC<BricsCriteriaPanelProps> = ({ lang = 'hi' }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-[#111722] border border-emerald-500/30 rounded-xl p-4 shadow-xl">
      <button
        type="button"
        id="toggle-kisan-guidelines"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left focus:outline-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-bold tracking-wide text-white font-sans">
              {lang === 'en' ? 'Farmer Helpline & Govt Schemes' : 'किसान हेल्पलाइन व सरकारी सुविधाएं'}
            </span>
            <div className="text-[11px] text-emerald-400 font-mono">
              {lang === 'en' ? 'Toll-free Assistance & Rules' : 'टोल फ्री सहायता व नियम'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-mono">
          <span>{isOpen ? (lang === 'en' ? 'Close' : 'बंद करें') : (lang === 'en' ? 'View' : 'देखें')}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="mt-3 space-y-2.5 pt-3 border-t border-neutral-800 text-xs text-neutral-300">
          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
            <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-200 block font-medium">
                {lang === 'en' ? 'Kisan Call Center' : 'किसान कॉल सेंटर (Kisan Call Center)'}
              </strong>
              <span className="text-neutral-300">
                {lang === 'en'
                  ? 'Call toll-free 1800-180-1551 (6 AM to 10 PM) to speak with agricultural experts in your regional language directly.'
                  : 'टोल-फ्री नंबर 1800-180-1551 पर सुबह 6 से रात 10 बजे तक अपनी क्षेत्रीय भाषा में कृषि विशेषज्ञों से सीधे बात करें।'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-200 block font-medium">
                {lang === 'en' ? 'PM Crop Insurance Claim (72h Rule)' : 'PM फसल बीमा दावा (72 घंटे का नियम)'}
              </strong>
              <span className="text-neutral-400">
                {lang === 'en'
                  ? 'Report hail, flood, or pest damage within 72 hours via Crop Insurance App or toll-free 14447.'
                  : "ओलावृष्टि, जलभराव या कीट हमले से नुकसान होने पर 72 घंटे के अंदर 'Crop Insurance App' या टोल फ्री 14447 पर शिकायत दर्ज करें।"}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800">
            <Droplets className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-sky-200 block font-medium">
                {lang === 'en' ? 'Drip & Sprinkler Irrigation (55% Govt Subsidy)' : 'ड्रिप व फव्वारा सिंचाई (55% सरकारी अनुदान)'}
              </strong>
              <span className="text-neutral-400">
                {lang === 'en'
                  ? 'Under Per Drop More Crop (PMKSY), small & marginal farmers get up to 55% subsidy, saving 60% water.'
                  : 'प्रति बूंद अधिक फसल (PMKSY) योजना के तहत छोटे व सीमांत किसानों को 55% तक सब्सिडी मिलती है। पानी की 60% बचत।'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800">
            <FlaskConical className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-purple-200 block font-medium">
                {lang === 'en' ? 'Soil Health Card' : 'मृदा स्वास्थ्य कार्ड (Soil Health Card)'}
              </strong>
              <span className="text-neutral-400">
                {lang === 'en'
                  ? 'Get soil tested at your nearest KVK before applying fertilizers. Reduces fertilizer costs by 25-30%.'
                  : 'बिना जांच के यूरिया न डालें। नजदीकी कृषि विज्ञान केंद्र (KVK) पर मिट्टी जांच कराएं, जिससे खाद का खर्च 25-30% घटता है।'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800">
            <Landmark className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-200 block font-medium">
                {lang === 'en' ? 'Kisan Credit Card (KCC at 4% Interest)' : 'किसान क्रेडिट कार्ड (KCC मात्र 4% ब्याज)'}
              </strong>
              <span className="text-neutral-400">
                {lang === 'en'
                  ? 'Timely loan repayment earns a 3% interest subvention, making the net interest rate just 4% per annum.'
                  : 'समय पर ऋण चुकाने पर केंद्र व राज्य सरकार से 3% ब्याज छूट मिलती है, जिससे कुल ब्याज केवल 4% प्रति वर्ष रह जाता है।'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800">
            <Sun className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-200 block font-medium">
                {lang === 'en' ? 'PM KUSUM Scheme (Solar Pump 60% Subsidy)' : 'पीएम कुसुम योजना (सोलर पंप 60% सब्सिडी)'}
              </strong>
              <span className="text-neutral-400">
                {lang === 'en'
                  ? 'Replace diesel pumps with solar pumps. The farmer contributes only 10%, with 60% subsidy and 30% bank loan.'
                  : 'डीजल पंप हटाकर सोलर पंप लगाएं। किसान को केवल 10% लागत देनी होती है, शेष 60% सब्सिडी और 30% बैंक ऋण मिलता है।'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
