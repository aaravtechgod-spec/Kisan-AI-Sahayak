import React, { useState } from 'react';
import { FarmerUser } from '../types';
import { X, Lock, LogIn, UserPlus } from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/translations';

interface FarmerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FarmerUser | null;
  onLoginSuccess: (user: FarmerUser) => void;
  allFarmers: FarmerUser[];
  onRegisterSuccess: (newUser: FarmerUser) => void;
  lang?: Language;
  onToggleLang?: () => void;
}

export const FarmerAuthModal: React.FC<FarmerAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  allFarmers,
  onRegisterSuccess,
  lang = 'hi',
  onToggleLang,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [state, setState] = useState(lang === 'en' ? 'Punjab, India' : 'उत्तर प्रदेश');
  const [crops, setCrops] = useState(lang === 'en' ? 'Wheat, Paddy, Mustard' : 'गेहूं, धान, सरसों');
  const [acres, setAcres] = useState(lang === 'en' ? '5 Acres' : '5 एकड़');
  const [error, setError] = useState('');

  const t = TRANSLATIONS[lang];

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanUsername = username.trim().toLowerCase().replace('@', '');
    if (!cleanUsername) {
      setError(lang === 'en' ? 'Please enter User ID' : 'कृपया यूजर आईडी (User ID) दर्ज करें');
      return;
    }
    if (!password) {
      setError(lang === 'en' ? 'Please enter Password' : 'कृपया पासवर्ड (Password) दर्ज करें');
      return;
    }

    const found = allFarmers.find(
      (f) => f.username.toLowerCase() === cleanUsername
    );

    if (!found) {
      setError(
        lang === 'en'
          ? `User ID '@${cleanUsername}' not found. Would you like to create a new account?`
          : `यूजर ID '@${cleanUsername}' नहीं मिला। क्या आप नया खाता बनाना चाहते हैं?`
      );
      return;
    }

    // Check password if set on user, or default demo password 'kisan'
    if (found.password && found.password !== password && password !== 'kisan') {
      setError(lang === 'en' ? 'Incorrect password. (Default demo password: kisan)' : 'पासवर्ड गलत है। (डिफ़ॉल्ट पासवर्ड: kisan)');
      return;
    }

    onLoginSuccess(found);
    onClose();
  };

  const handleQuickLogin = (farmer: FarmerUser) => {
    onLoginSuccess(farmer);
    onClose();
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanUsername = username.trim().toLowerCase().replace('@', '');
    if (!cleanUsername || cleanUsername.length < 3) {
      setError(lang === 'en' ? 'User ID must be at least 3 characters' : 'यूजर ID कम से कम 3 अक्षरों का होना चाहिए');
      return;
    }
    if (!name.trim()) {
      setError(lang === 'en' ? 'Please enter your full name' : 'कृपया अपना पूरा नाम दर्ज करें');
      return;
    }
    if (!password || password.length < 4) {
      setError(lang === 'en' ? 'Password must be at least 4 characters' : 'पासवर्ड कम से कम 4 अक्षरों का होना चाहिए');
      return;
    }

    const exists = allFarmers.some((f) => f.username.toLowerCase() === cleanUsername);
    if (exists) {
      setError(t.registerError);
      return;
    }

    const newUser: FarmerUser = {
      id: `f_${Date.now()}`,
      username: cleanUsername,
      name: name.trim(),
      password,
      avatar: '👨‍🌾',
      village: village.trim() || (lang === 'en' ? 'My Village' : 'मेरा गाँव'),
      state: state || (lang === 'en' ? 'India' : 'भारत'),
      crops: crops.split(',').map((c) => c.trim()).filter(Boolean),
      acres: acres.trim() || (lang === 'en' ? '4 Acres' : '4 एकड़'),
      bio: `${lang === 'en' ? 'Progressive Farmer' : 'प्रगतिशील किसान'} • ${village} • Crops: ${crops}`,
      followers: [],
      following: ['ramesh_kisan', 'baldev_singh'],
      joinedDate: lang === 'en' ? 'Joined today' : 'आज ही जुड़े',
      isVerified: false,
    };

    onRegisterSuccess(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#10141f] border-2 border-emerald-500/50 rounded-2xl p-5 sm:p-6 shadow-2xl text-white">
        {/* Close Button & Language Toggle in modal */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {onToggleLang && (
            <button
              type="button"
              onClick={onToggleLang}
              className="px-2.5 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-amber-300 font-bold border border-neutral-700"
            >
              🌐 {t.langSwitchBtn}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 pr-20">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-2xl shrink-0">
            🌾
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold font-sans truncate">
              {authMode === 'login' ? t.tabLogin : t.tabRegister}
            </h2>
            <p className="text-xs text-neutral-400">
              {t.authModalSubtitle}
            </p>
          </div>
        </div>

        {/* Tab switcher: Login vs Signup */}
        <div className="flex rounded-xl bg-neutral-900 p-1 border border-neutral-800 mb-5">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setError('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              authMode === 'login'
                ? 'bg-emerald-500 text-black shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{t.tabLogin}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setError('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              authMode === 'signup'
                ? 'bg-emerald-500 text-black shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{t.tabRegister}</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {authMode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                {t.usernameLabel}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-neutral-500 text-sm">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t.usernamePlaceholder}
                  className="w-full bg-[#0a0d14] border border-neutral-700 rounded-xl pl-8 pr-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                {t.passwordLabel}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3.5 text-neutral-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  className="w-full bg-[#0a0d14] border border-neutral-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                {lang === 'en' ? 'Demo password for all accounts:' : 'डेमो खातों के लिए पासवर्ड:'}{' '}
                <code className="text-emerald-400 font-bold">kisan</code>
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{t.loginActionBtn}</span>
            </button>

            {/* Quick Demo Accounts */}
            <div className="pt-3 border-t border-neutral-800">
              <span className="text-[11px] font-bold text-neutral-400 block mb-2">
                ⚡ {t.quickSwitchAccountTitle}
              </span>
              <div className="grid grid-cols-2 gap-2">
                {allFarmers.slice(0, 4).map((farmer) => (
                  <button
                    key={farmer.id}
                    type="button"
                    onClick={() => handleQuickLogin(farmer)}
                    className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-left transition flex items-center gap-2"
                  >
                    <span className="text-xl">{farmer.avatar}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{farmer.name}</div>
                      <div className="text-[10px] text-emerald-400 truncate">@{farmer.username}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit} className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                {t.usernameLabel} *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-neutral-500 text-sm">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder={t.usernamePlaceholder}
                  className="w-full bg-[#0a0d14] border border-neutral-700 rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                {t.fullNameLabel} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.fullNamePlaceholder}
                className="w-full bg-[#0a0d14] border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                {t.passwordLabel} *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={lang === 'en' ? 'Minimum 4 characters' : 'न्यूनतम 4 अक्षर'}
                className="w-full bg-[#0a0d14] border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  {t.villageLabel}
                </label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder={t.villagePlaceholder}
                  className="w-full bg-[#0a0d14] border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  {t.acresLabel}
                </label>
                <input
                  type="text"
                  value={acres}
                  onChange={(e) => setAcres(e.target.value)}
                  placeholder={t.acresPlaceholder}
                  className="w-full bg-[#0a0d14] border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                {t.cropsLabel}
              </label>
              <input
                type="text"
                value={crops}
                onChange={(e) => setCrops(e.target.value)}
                placeholder={t.cropsPlaceholder}
                className="w-full bg-[#0a0d14] border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 mt-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t.registerActionBtn}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
