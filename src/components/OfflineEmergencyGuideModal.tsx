import React, { useState } from 'react';
import {
  ShieldAlert,
  X,
  Search,
  PhoneCall,
  WifiOff,
  Leaf,
  Droplets,
  AlertTriangle,
  BookOpen,
} from 'lucide-react';
import { OfflineEmergencyItem } from '../types';

interface OfflineEmergencyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'hi';
}

const OFFLINE_EMERGENCY_DATA: OfflineEmergencyItem[] = [
  {
    id: 'off-1',
    crop: 'Wheat (गेहूं)',
    problem: 'Yellow Rust / Stripe Rust',
    problemHindi: 'पीला रतुआ (येलो रस्ट)',
    symptomSign: 'Yellow/orange powdery pustules forming linear stripes on leaves, yellow powder stains fingers when touched.',
    quickChemical: 'Propiconazole 25% EC (Tilt) @ 1ml per Litre of water (15ml / pump)',
    quickOrganic: 'Spray 500ml sour buttermilk (खट्टी छाछ) + 50g turmeric powder in 15L water',
    dosage: '150 - 200 Litres spray water per acre',
    urgentAction: 'Spray within 48 hours to stop fungal spore spread across neighboring fields.',
  },
  {
    id: 'off-2',
    crop: 'Paddy / Rice (धान)',
    problem: 'Sheath Blight & Brown Spot',
    problemHindi: 'शीथ ब्लाइट एवं भूरा धब्बा',
    symptomSign: 'Greenish-grey oval water-soaked lesions on leaf sheath, turning straw-colored with brown borders.',
    quickChemical: 'Hexaconazole 5% SC @ 2ml/L OR Validamycin 3% L @ 2.5ml/L',
    quickOrganic: 'Trichoderma viride @ 5g/L foliar spray early in the morning',
    dosage: 'Focus spray towards plant base where moisture accumulates',
    urgentAction: 'Drain stagnant water from field for 2 days to lower humidity.',
  },
  {
    id: 'off-3',
    crop: 'Cotton (कपास)',
    problem: 'Pink Bollworm (गुलाबी सुंडी)',
    problemHindi: 'गुलाबी सुंडी का प्रकोप',
    symptomSign: 'Rosetted flowers that fail to open, entry pinholes on green bolls with larvae inside.',
    quickChemical: 'Emamectin Benzoate 5% SG @ 5g per 15L pump OR Profenofos 50% EC @ 30ml/pump',
    quickOrganic: 'Install 4-5 Pheromone traps per acre + Neem Oil 1500 PPM @ 50ml/pump',
    dosage: 'Spray in the evening when adult moths become active',
    urgentAction: 'Pick and destroy fallen rosette flowers to stop second generation emergence.',
  },
  {
    id: 'off-4',
    crop: 'Mustard (सरसों)',
    problem: 'Aphid / Chepa / Mahu',
    problemHindi: 'माहू / चेपा कीट',
    symptomSign: 'Thousands of small greenish-black insects clustered on tender twigs and flowers sucking sap.',
    quickChemical: 'Dimethoate 30% EC (Rogor) @ 25ml per 15L pump OR Imidacloprid 17.8% SL @ 5ml/pump',
    quickOrganic: 'Spray Neem seed kernel extract (NSKE 5%) or 100g wood ash dusted early morning',
    dosage: 'Spray before 10 AM when aphids are active on flower heads',
    urgentAction: 'Never spray insecticides during peak honeybee foraging hours (11 AM - 3 PM).',
  },
  {
    id: 'off-5',
    crop: 'Potato / Tomato (आलू / टमाटर)',
    problem: 'Late Blight (पिछेता झुलसा)',
    problemHindi: 'पिछेता झुलसा रोग',
    symptomSign: 'Water-soaked irregular black/brown lesions on leaf tips, white cottony mold under leaves on misty mornings.',
    quickChemical: 'Metalaxyl 8% + Mancozeb 64% WP (Ridomil MZ) @ 2.5g per Litre',
    quickOrganic: 'Bordeaux mixture 1% foliar spray or fermented garlic-chilli extract',
    dosage: 'Thorough coverage of leaf underside is critical',
    urgentAction: 'Act immediately! Late blight can destroy an entire field within 4 to 6 days in cloudy weather.',
  },
  {
    id: 'off-6',
    crop: 'Gram / Chickpea (चना)',
    problem: 'Pod Borer (सुंडी / इल्ली)',
    problemHindi: 'चना फली छेदक (इल्ली)',
    symptomSign: 'Chewed leaves and small round holes drilled into chickpea pods with green caterpillars.',
    quickChemical: 'Chlorantraniliprole 18.5% SC (Coragen) @ 5ml per 15L water',
    quickOrganic: 'NPV (Nuclear Polyhedrosis Virus) @ 1ml/L OR Bird perches (T-shaped bamboo sticks) @ 15/acre',
    dosage: 'Early instar stage spray provides 95%+ control',
    urgentAction: 'Place ' + 'T-shaped sticks for insectivorous birds to naturally feed on caterpillars.',
  },
  {
    id: 'off-7',
    crop: 'All Crops (सभी फसलें)',
    problem: 'Termite / White Grub (दीमक)',
    problemHindi: 'दीमक एवं सफेद लट',
    symptomSign: 'Suddenly wilting plants in dry patches, roots chewed off clean below soil line.',
    quickChemical: 'Chlorpyriphos 20% EC @ 1 Litre per acre through irrigation water',
    quickOrganic: 'Metarhizium anisopliae bio-control fungus @ 2 kg mixed with 100 kg compost',
    dosage: 'Apply with canal or tubewell flood irrigation',
    urgentAction: 'Never apply un-decomposed raw cow dung as it directly attracts termites.',
  },
];

export const OfflineEmergencyGuideModal: React.FC<OfflineEmergencyGuideModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = OFFLINE_EMERGENCY_DATA.filter(
    (item) =>
      item.crop.toLowerCase().includes(search.toLowerCase()) ||
      item.problem.toLowerCase().includes(search.toLowerCase()) ||
      item.problemHindi.toLowerCase().includes(search.toLowerCase()) ||
      item.symptomSign.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#10141e] border border-neutral-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-auto text-neutral-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 bg-neutral-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base sm:text-lg text-white">
                  {lang === 'en' ? 'Offline Emergency Crop Defense Guide' : 'ऑफलाइन आपातकालीन फसल रक्षा गाइड'}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  100% Offline Ready
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                {lang === 'en'
                  ? 'Field prescriptions for top 10 urgent farm crises — available without internet'
                  : 'खेत में बिना इंटरनेट के भी तुरंत आपातकालीन दवा और देशी समाधान देखें'}
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

        {/* Search Bar */}
        <div className="p-4 border-b border-neutral-800/80 bg-neutral-900/40">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                lang === 'en'
                  ? 'Search disease, crop, or symptoms (e.g. rust, aphid, yellow)...'
                  : 'रोग, फसल या लक्षण खोजें (उदा. रतुआ, माहू, पीलापन, सुंडी)...'
              }
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Emergency Guide List */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 transition space-y-3 shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-neutral-800 pb-2.5">
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    {item.crop}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                    {lang === 'en' ? item.problem : item.problemHindi}
                  </h3>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Urgent Action</span>
                </span>
              </div>

              <div className="text-xs text-neutral-300">
                <strong className="text-neutral-200 block mb-0.5">
                  {lang === 'en' ? 'Symptoms & Identification:' : 'पहचान व लक्षण:'}
                </strong>
                <p className="leading-relaxed">{item.symptomSign}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Chemical */}
                <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-800 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <Droplets className="w-3 h-3" />
                    <span>{lang === 'en' ? 'Fast Chemical Treatment' : 'तुरंत रासायनिक दवा'}</span>
                  </span>
                  <p className="text-xs text-white font-medium">{item.quickChemical}</p>
                </div>

                {/* Organic */}
                <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-800 space-y-1">
                  <span className="text-[11px] font-bold text-lime-400 flex items-center gap-1">
                    <Leaf className="w-3 h-3" />
                    <span>{lang === 'en' ? 'Zero-Cost Organic Remedy' : 'देशी / जैविक उपाय'}</span>
                  </span>
                  <p className="text-xs text-white font-medium">{item.quickOrganic}</p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                <strong>{lang === 'en' ? 'Field Protocol:' : 'खेत में जरूरी कदम:'}</strong>{' '}
                <span>{item.urgentAction}</span>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="text-center text-xs text-neutral-500 py-8">
              {lang === 'en' ? 'No emergency guides found.' : 'कोई जानकारी नहीं मिली।'}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-900/60 flex items-center justify-between text-xs">
          <a
            href="tel:18001801551"
            className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1.5"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Kisan Helpline: 1800-180-1551 (Toll-Free)</span>
          </a>

          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition"
          >
            {lang === 'en' ? 'Close' : 'बंद करें'}
          </button>
        </div>
      </div>
    </div>
  );
};
