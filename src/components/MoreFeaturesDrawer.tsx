import React from 'react';
import {
  X,
  Globe,
  TrendingUp,
  Camera,
  Users,
  MessageCircle,
  Calculator,
  ShieldAlert,
  User,
  ChevronRight,
} from 'lucide-react';

interface MoreFeaturesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'hi' | 'en';
  onSelectFeature: (feature: 'agrin' | 'mandi' | 'social' | 'chat' | 'fertilizer' | 'emergency' | 'profile') => void;
  currentUser: { name: string; username: string; avatar: string };
}

export const MoreFeaturesDrawer: React.FC<MoreFeaturesDrawerProps> = ({
  isOpen,
  onClose,
  lang,
  onSelectFeature,
  currentUser,
}) => {
  if (!isOpen) return null;

  const features = [
    {
      id: 'agrin' as const,
      icon: '🌐',
      nameHi: '🔬 ब्रिक्स AgriN रिसर्च हब (Institutional Node)',
      nameEn: '🔬 BRICS AgriN Research Hub (Institutional Node)',
      descHi: 'वैज्ञानिकों व विस्तार अधिकारियों के लिए उपग्रह व मृदा विश्लेषण',
      descEn: 'Institutional node for agronomists, ICAR & EMBRAPA researchers',
      tag: 'Research Node',
      tagColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    {
      id: 'mandi' as const,
      icon: '📈',
      nameHi: 'मंडी भाव व मूल्य सलाह',
      nameEn: 'Mandi Rates & Market Intelligence',
      descHi: 'गेहूं, धान, सरसों के दैनिक ताजा भाव',
      descEn: 'Live crop market prices & MSP trends',
      tag: 'APMC Live',
      tagColor: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    {
      id: 'fertilizer' as const,
      icon: '🧮',
      nameHi: 'खाद एवं बचत कैलकुलेटर',
      nameEn: 'Precision Fertilizer Calculator',
      descHi: 'यूरिया, डीएपी की सही मात्रा व खर्च',
      descEn: 'Soil-based NPK dosage & cost optimizer',
      tag: 'Save ₹',
      tagColor: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    {
      id: 'emergency' as const,
      icon: '🛡️',
      nameHi: '100% ऑफलाइन रक्षा गाइड',
      nameEn: 'Offline Emergency Defense Guide',
      descHi: 'बिना इंटरनेट फसल सुरक्षा समाधान',
      descEn: 'Zero-data emergency agronomy manual',
      tag: '100% Offline',
      tagColor: 'bg-rose-100 text-rose-800 border-rose-300',
    },
    {
      id: 'social' as const,
      icon: '📸',
      nameHi: 'किसान चौपाल (Farmer Feed)',
      nameEn: 'Farmer Community Feed',
      descHi: 'साथी किसानों की सफलता व तकनीक',
      descEn: 'Photos, crop updates & community wisdom',
      tag: 'Social',
      tagColor: 'bg-purple-100 text-purple-800 border-purple-300',
    },
    {
      id: 'chat' as const,
      icon: '💬',
      nameHi: 'किसान संदेश (Direct Chat)',
      nameEn: 'Kisan Direct Chat',
      descHi: 'विशेषज्ञों व किसानों से निजी बात',
      descEn: 'One-on-one direct messages',
      tag: 'DMs',
      tagColor: 'bg-teal-100 text-teal-800 border-teal-300',
    },
    {
      id: 'profile' as const,
      icon: '👤',
      nameHi: `प्रोफ़ाइल: @${currentUser.username}`,
      nameEn: `Profile: @${currentUser.username}`,
      descHi: 'खेत, फसल व खाता विवरण',
      descEn: 'Farm profile, acreage & settings',
      tag: currentUser.avatar,
      tagColor: 'bg-slate-100 text-slate-800 border-slate-300',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl border-3 border-black shadow-[0_10px_0_0_#000] max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b-3 border-black flex items-center justify-between bg-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌐</span>
            <div>
              <h3 className="font-black text-base sm:text-lg text-slate-900">
                {lang === 'hi' ? 'नेटवर्क व अनुसंधान केंद्र' : 'Network & Research Consoles'}
              </h3>
              <p className="text-[11px] font-bold text-slate-600">
                {lang === 'hi'
                  ? 'कृषि विस्तार अधिकारियों, वैज्ञानिकों एवं अनुसंधान नोड्स के लिए'
                  : 'For Extension Officers, Agronomists & Researchers'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl border-2 border-black bg-white hover:bg-slate-100 active:bg-slate-200 flex items-center justify-center shadow-[0_2px_0_0_#000]"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        {/* Feature List */}
        <div className="p-4 space-y-2.5 overflow-y-auto max-h-[70vh]">
          {features.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelectFeature(item.id);
                onClose();
              }}
              className="w-full p-3.5 rounded-2xl border-2 border-black bg-white hover:bg-slate-50 active:bg-emerald-50 text-left flex items-center justify-between gap-3 shadow-[0_3px_0_0_#000] active:translate-y-0.5 active:shadow-[0_1px_0_0_#000] transition group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border-2 border-black flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm sm:text-base text-slate-900 truncate">
                      {lang === 'hi' ? item.nameHi : item.nameEn}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-600 truncate mt-0.5">
                    {lang === 'hi' ? item.descHi : item.descEn}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${item.tagColor}`}>
                  {item.tag}
                </span>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-black transition" />
              </div>
            </button>
          ))}
        </div>

        {/* Footer Close */}
        <div className="p-3 border-t-2 border-slate-200 bg-slate-50 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-12 rounded-xl border-2 border-black bg-slate-200 hover:bg-slate-300 font-black text-xs text-slate-900 shadow-[0_2px_0_0_#000]"
          >
            {lang === 'hi' ? 'बंद करें (Close)' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
