import React, { useState, useEffect } from 'react';
import {
  Calculator,
  X,
  Sparkles,
  TrendingDown,
  Share2,
  CheckCircle2,
  Leaf,
  Layers,
  DollarSign,
  Info,
  Droplets,
} from 'lucide-react';
import { FertilizerCalculation } from '../types';

interface FertilizerCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'hi';
}

export const FertilizerCalculatorModal: React.FC<FertilizerCalculatorModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [crop, setCrop] = useState('Wheat');
  const [stage, setStage] = useState('basal');
  const [acres, setAcres] = useState<number>(2);
  const [soilType, setSoilType] = useState('loam');
  const [calcResult, setCalcResult] = useState<FertilizerCalculation | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const calculate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/calculate-fertilizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crop, stage, acres, soilType }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCalcResult(data.result);
      }
    } catch (e) {
      console.error('Fertilizer calc error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculate();
  }, [crop, stage, acres, soilType]);

  const shareToWhatsApp = () => {
    if (!calcResult) return;

    const msg =
      lang === 'en'
        ? `🌾 *Kisan AI - Precision Fertilizer Prescription* 🌾
🌱 *Crop:* ${calcResult.crop} | *Area:* ${calcResult.acres} Acres | *Stage:* ${calcResult.stage}
📦 *Required Inputs:*
• Urea: ${calcResult.ureaKg} kg (~${calcResult.ureaBags} bags)
• DAP: ${calcResult.dapKg} kg (~${calcResult.dapBags} bags)
• MOP (Potash): ${calcResult.mopKg} kg
• Zinc Sulphate 33%: ${calcResult.zincKg} kg
• Nano Urea: ${calcResult.nanoUreaBottles} bottle(s)
• Organic Jeevamrutha: ${calcResult.organicJeevamruthaLiters} Litres
💰 *Estimated Balanced Cost:* ₹${calcResult.balancedCostEst.toLocaleString()}
🎉 *Farmer Savings:* ₹${calcResult.netSavingsRupees.toLocaleString()} (Avoided chemical leaching)`
        : `🌾 *किसान एआई - संतुलित खाद एवं पोषण पर्चा* 🌾
🌱 *फसल:* ${calcResult.crop} | *रकबा:* ${calcResult.acres} एकड़ | *अवस्था:* ${calcResult.stage}
📦 *खाद की सटीक मात्रा:*
• यूरिया: ${calcResult.ureaKg} किग्रा (~${calcResult.ureaBags} बोरी)
• डीएपी: ${calcResult.dapKg} किग्रा (~${calcResult.dapBags} बोरी)
• पोटाश (MOP): ${calcResult.mopKg} किग्रा
• जिंक सल्फेट 33%: ${calcResult.zincKg} किग्रा
• नैनो यूरिया: ${calcResult.nanoUreaBottles} बोतल
• जैविक जीवामृत: ${calcResult.organicJeevamruthaLiters} लीटर
💰 *संतुलित लागत:* ₹${calcResult.balancedCostEst.toLocaleString()}
🎉 *किसान की सीधी बचत:* ₹${calcResult.netSavingsRupees.toLocaleString()} (अनावश्यक खाद से बचाव)`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#10141e] border border-neutral-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-auto text-neutral-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 bg-neutral-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-white">
                {lang === 'en' ? 'Precision Fertilizer & Savings Calculator' : 'संतुलित खाद एवं बचत कैलकुलेटर'}
              </h2>
              <p className="text-xs text-neutral-400">
                {lang === 'en'
                  ? 'Calculate exact NPK & Nano Urea requirements to maximize yield and cut wasteful costs'
                  : 'फसल के अनुसार यूरिया, डीएपी और नैनो उर्वरक की सही मात्रा जानें और हजारों रुपये बचाएं'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Inputs */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                {lang === 'en' ? 'Crop (फसल):' : 'फसल:'}
              </label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Wheat">Wheat (गेहूं)</option>
                <option value="Paddy">Paddy / Rice (धान)</option>
                <option value="Mustard">Mustard (सरसों / राई)</option>
                <option value="Cotton">Cotton (कपास / नरमा)</option>
                <option value="Potato">Potato (आलू)</option>
                <option value="Sugarcane">Sugarcane (गन्ना)</option>
                <option value="Maize">Maize (मक्का)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                {lang === 'en' ? 'Growth Stage (फसल अवस्था):' : 'फसल अवस्था:'}
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="basal">Sowing / Basal (बुवाई का समय)</option>
                <option value="tillering">Tillering / First Irrigation (कल्ले फूटना / पहली सिंचाई)</option>
                <option value="flowering">Flowering / Grain Filling (फूल व दाना भराव)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-neutral-300">
                  {lang === 'en' ? 'Land Size (Acres):' : 'खेत का रकबा (एकड़):'}
                </label>
                <span className="text-xs font-bold text-emerald-400">{acres} Acres</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="15"
                step="0.5"
                value={acres}
                onChange={(e) => setAcres(parseFloat(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                {lang === 'en' ? 'Soil Type (मिट्टी का प्रकार):' : 'मिट्टी का प्रकार:'}
              </label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="loam">Alluvial / Loam (दोमट मिट्टी)</option>
                <option value="clay">Black / Clay (काली / चिकनी मिट्टी)</option>
                <option value="sandy">Sandy Loam (बलुई मिट्टी)</option>
              </select>
            </div>
          </div>

          {/* Results Display */}
          {calcResult && (
            <div className="space-y-4 pt-3 border-t border-neutral-800">
              {/* ROI Savings Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-neutral-900 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-3 shadow-lg">
                <div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                    {lang === 'en' ? 'Proven Farmer Return on Investment (ROI)' : 'किसान का सीधा आर्थिक लाभ व बचत'}
                  </span>
                  <p className="text-xl sm:text-2xl font-black text-emerald-300 mt-0.5">
                    +₹{calcResult.netSavingsRupees.toLocaleString()}
                  </p>
                  <p className="text-xs text-neutral-300 mt-0.5">
                    {lang === 'en'
                      ? 'Saved by cutting chemical excess & replacing 1 urea bag with Nano Urea'
                      : 'अनावश्यक यूरिया का खर्च बचाकर और नैनो उर्वरक उपयोग से सीधी बचत'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={shareToWhatsApp}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{lang === 'en' ? 'Send Shopping List on WhatsApp' : 'खाद पर्चा व्हाट्सएप पर भेजें'}</span>
                </button>
              </div>

              {/* Exact Fertilizer Quantities Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block uppercase font-mono">Urea (यूरिया)</span>
                  <p className="text-lg font-bold text-white mt-0.5">{calcResult.ureaKg} kg</p>
                  <span className="text-xs text-emerald-400 font-semibold">~{calcResult.ureaBags} Bags (45kg)</span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block uppercase font-mono">DAP (डीएपी)</span>
                  <p className="text-lg font-bold text-white mt-0.5">{calcResult.dapKg} kg</p>
                  <span className="text-xs text-amber-400 font-semibold">~{calcResult.dapBags} Bags (50kg)</span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block uppercase font-mono">MOP / Potash (पोटाश)</span>
                  <p className="text-lg font-bold text-white mt-0.5">{calcResult.mopKg} kg</p>
                  <span className="text-xs text-neutral-400">For grain shine & weight</span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block uppercase font-mono">Zinc Sulphate 33%</span>
                  <p className="text-lg font-bold text-white mt-0.5">{calcResult.zincKg} kg</p>
                  <span className="text-xs text-sky-400">Prevents leaf yellowing</span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block uppercase font-mono">IFFCO Nano Urea</span>
                  <p className="text-lg font-bold text-emerald-400 mt-0.5">{calcResult.nanoUreaBottles} Bottle(s)</p>
                  <span className="text-xs text-neutral-400">500ml foliar spray</span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block uppercase font-mono">Jeevamrutha (जीवामृत)</span>
                  <p className="text-lg font-bold text-lime-400 mt-0.5">{calcResult.organicJeevamruthaLiters} L</p>
                  <span className="text-xs text-neutral-400">Soil microbial booster</span>
                </div>
              </div>

              {/* Agronomic Practical Advice */}
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5 text-xs">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'en' ? 'Scientific Field Application Protocol:' : 'कृषि वैज्ञानिकों द्वारा अनुशंसित नियम:'}</span>
                </p>
                <ul className="list-disc list-inside text-neutral-300 space-y-1 text-[11px]">
                  {calcResult.guidancePoints.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
