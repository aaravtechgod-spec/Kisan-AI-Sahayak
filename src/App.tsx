import React, { useState, useEffect, useRef } from 'react';
import {
  StatusBlock,
  ResponseMode,
  ContextOptions,
  MentorAudit,
  Verdict,
  FarmerUser,
  KisanPost,
  KisanStory,
  ChatMessage,
} from './types';
import { StatusBlockEditor } from './components/StatusBlockEditor';
import { BricsCriteriaPanel } from './components/BricsCriteriaPanel';
import { MentorOutputCard } from './components/MentorOutputCard';
import { SprintLog } from './components/SprintLog';
import { FarmerSimpleCards } from './components/FarmerSimpleCards';
import { FarmerAuthModal } from './components/FarmerAuthModal';
import { KisanSocialFeed } from './components/KisanSocialFeed';
import { KisanDirectChat } from './components/KisanDirectChat';
import { FarmerProfileView } from './components/FarmerProfileView';
import { CropDiseaseScannerModal } from './components/CropDiseaseScannerModal';
import { MandiMarketTracker } from './components/MandiMarketTracker';
import { WeatherSprayAdvisoryCard } from './components/WeatherSprayAdvisoryCard';
import { FertilizerCalculatorModal } from './components/FertilizerCalculatorModal';
import { OfflineEmergencyGuideModal } from './components/OfflineEmergencyGuideModal';
import {
  DEFAULT_FARMERS,
  INITIAL_POSTS,
  INITIAL_STORIES,
  INITIAL_CHAT_MESSAGES,
} from './data/mockSocialData';
import { PRESETS, ScenarioPreset } from './data/presets';
import { Language, TRANSLATIONS } from './data/translations';
import {
  Send,
  Sparkles,
  RefreshCw,
  Share2,
  Check,
  Droplets,
  Bug,
  Landmark,
  PhoneCall,
  Mic,
  AlertCircle,
  MessageCircle,
  Camera,
  TrendingUp,
  Calculator,
  ShieldAlert,
  Download,
  CloudSun,
  WifiOff,
} from 'lucide-react';

const INITIAL_STATUS: StatusBlock = {
  hoursRemaining: 45, // Crop age (days)
  works: 'गेहूं (Wheat PBW 550)',
  stubbed: '4 एकड़, दोमट मिट्टी',
  cut: 'ट्यूबवेल / बोरवेल सिंचाई',
};

export default function App() {
  // Language State: 'hi' (Hindi) or 'en' (English)
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('kisan_preferred_lang');
    return saved === 'en' || saved === 'hi' ? saved : 'hi';
  });

  const t = TRANSLATIONS[lang];

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'hi' ? 'en' : 'hi'));
  };

  useEffect(() => {
    localStorage.setItem('kisan_preferred_lang', lang);
  }, [lang]);

  const [status, setStatus] = useState<StatusBlock>(() => {
    const saved = localStorage.getItem('kisan_farm_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_STATUS;
  });

  const [mode, setMode] = useState<ResponseMode>('AUTO');
  const [query, setQuery] = useState('');
  const [useThinking] = useState(true);
  const [farmerMode] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [mobileTab, setMobileTab] = useState<'farmer' | 'mentor' | 'status'>('farmer');

  const [contextOptions, setContextOptions] = useState<ContextOptions>({
    targetDomain: 'Agriculture & Climate',
    bricsFocus: false,
    farmerMode: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active or selected audit result
  const [activeAudit, setActiveAudit] = useState<MentorAudit | null>(null);

  // Audit history
  const [audits, setAudits] = useState<MentorAudit[]>(() => {
    const saved = localStorage.getItem('kisan_advice_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  const [copiedSummary, setCopiedSummary] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Main Section Tab: 'doctor' | 'mandi' | 'social' | 'chat' | 'profile'
  const [mainTab, setMainTab] = useState<'doctor' | 'mandi' | 'social' | 'chat' | 'profile'>('doctor');

  // New Breakthrough Agricultural Modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isFertilizerOpen, setIsFertilizerOpen] = useState(false);
  const [isEmergencyGuideOpen, setIsEmergencyGuideOpen] = useState(false);

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  // All Farmers in the community (persisted)
  const [allFarmers, setAllFarmers] = useState<FarmerUser[]>(() => {
    const saved = localStorage.getItem('kisan_all_farmers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_FARMERS;
  });

  // Current Logged-in Farmer User with User ID and Password
  const [currentUser, setCurrentUser] = useState<FarmerUser>(() => {
    const saved = localStorage.getItem('kisan_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_FARMERS[0]; // Ramesh Patel
  });

  // Posts Feed (Instagram style)
  const [posts, setPosts] = useState<KisanPost[]>(() => {
    const saved = localStorage.getItem('kisan_social_posts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_POSTS;
  });

  // Stories
  const [stories, setStories] = useState<KisanStory[]>(() => {
    const saved = localStorage.getItem('kisan_social_stories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_STORIES;
  });

  // Chat Messages (Direct Messages / DMs)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('kisan_chat_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_CHAT_MESSAGES;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedChatPartner, setSelectedChatPartner] = useState<string>('baldev_singh');
  const [selectedProfileUsername, setSelectedProfileUsername] = useState<string>(currentUser.username);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('kisan_farm_profile', JSON.stringify(status));
  }, [status]);

  useEffect(() => {
    localStorage.setItem('kisan_advice_history', JSON.stringify(audits));
  }, [audits]);

  useEffect(() => {
    localStorage.setItem('kisan_all_farmers', JSON.stringify(allFarmers));
  }, [allFarmers]);

  useEffect(() => {
    localStorage.setItem('kisan_auth_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('kisan_social_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('kisan_social_stories', JSON.stringify(stories));
  }, [stories]);

  useEffect(() => {
    localStorage.setItem('kisan_chat_messages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Follow / Unfollow other farmers
  const handleFollowToggle = (targetUsername: string) => {
    const isFollowing = currentUser.following.includes(targetUsername);
    const updatedFollowing = isFollowing
      ? currentUser.following.filter((u) => u !== targetUsername)
      : [...currentUser.following, targetUsername];

    const updatedUser = { ...currentUser, following: updatedFollowing };
    setCurrentUser(updatedUser);

    const updatedAllFarmers = allFarmers.map((f) => {
      if (f.username === currentUser.username) {
        return updatedUser;
      }
      if (f.username === targetUsername) {
        const hasFollower = f.followers.includes(currentUser.username);
        const newFollowers = isFollowing
          ? f.followers.filter((u) => u !== currentUser.username)
          : hasFollower ? f.followers : [...f.followers, currentUser.username];
        return { ...f, followers: newFollowers };
      }
      return f;
    });

    setAllFarmers(updatedAllFarmers);
  };

  // Like / Unlike post
  const handleLikeToggle = (postId: string) => {
    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        const liked = post.likes.includes(currentUser.username);
        const likes = liked
          ? post.likes.filter((u) => u !== currentUser.username)
          : [...post.likes, currentUser.username];
        return { ...post, likes };
      }
      return post;
    });
    setPosts(updatedPosts);
  };

  // Add comment to post
  const handleAddComment = (postId: string, text: string) => {
    const newComment = {
      id: `c_${Date.now()}`,
      authorUsername: currentUser.username,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      text,
      timestamp: lang === 'en' ? 'Just now' : 'अभी',
    };
    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        return { ...post, comments: [...post.comments, newComment] };
      }
      return post;
    });
    setPosts(updatedPosts);
  };

  // Create new post
  const handleCreatePost = (postData: Omit<KisanPost, 'id' | 'timestamp' | 'likes' | 'comments'>) => {
    const newPost: KisanPost = {
      id: `p_${Date.now()}`,
      ...postData,
      timestamp: lang === 'en' ? 'Just now' : 'अभी',
      likes: [currentUser.username],
      comments: [],
    };
    setPosts([newPost, ...posts]);
  };

  // Send DM
  const handleSendMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      ...msg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, newMsg]);
  };

  // Open direct chat with a farmer
  const handleOpenChatWith = (username: string) => {
    setSelectedChatPartner(username);
    setMainTab('chat');
  };

  // Open farmer profile
  const handleOpenProfile = (username: string) => {
    setSelectedProfileUsername(username);
    setMainTab('profile');
  };

  // Register new farmer account
  const handleRegisterSuccess = (newUser: FarmerUser) => {
    const updated = [newUser, ...allFarmers];
    setAllFarmers(updated);
    setCurrentUser(newUser);
    setSelectedProfileUsername(newUser.username);
  };

  // Toggle Voice Input using Web Speech API
  const toggleVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(t.speechNotSupported);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang === 'en' ? 'en-IN' : 'hi-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setQuery((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setMobileTab('mentor');
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error('Speech recognition failed to initialize:', e);
      setIsListening(false);
    }
  };

  const handleFarmerCardSelect = (selectedQuery: string, domain: 'Agriculture & Climate' | 'Healthcare') => {
    setQuery(selectedQuery);
    setContextOptions((prev) => ({
      ...prev,
      targetDomain: domain,
      farmerMode: true,
    }));
    setMobileTab('mentor');
  };

  const handleSubmitQuery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/mentor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: query,
          mode,
          statusBlock: status,
          useThinking,
          contextOptions: {
            ...contextOptions,
            preferredLanguage: lang,
            farmerMode: true,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.error ||
            (lang === 'en'
              ? `Failed to receive response from server (${res.status})`
              : `सर्वर से उत्तर नहीं मिला (${res.status})`)
        );
      }

      const data = await res.json();

      const newAudit: MentorAudit = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        query: query.trim(),
        mode,
        detectedMode: data.parsed?.mode,
        verdict: data.parsed?.verdict as Verdict,
        feasibilityScore: data.parsed?.feasibilityScore,
        response: data.text,
        statusSnapshot: { ...status },
        modelUsed: data.modelUsed || 'gemini-2.5-flash',
      };

      setAudits((prev) => [newAudit, ...prev]);
      setActiveAudit(newAudit);
      setMobileTab('mentor');
    } catch (err: any) {
      console.error('Advisory failed:', err);
      const rawMsg = err.message || '';
      let userFriendlyMsg = rawMsg;

      if (rawMsg.includes('503') || rawMsg.includes('UNAVAILABLE') || rawMsg.includes('high demand')) {
        userFriendlyMsg =
          lang === 'en'
            ? 'The AI advisory servers are temporarily experiencing high demand. Please tap "Retry Advice" below or contact the Toll-Free Kisan Helpline.'
            : 'एआई सलाहकार सर्वर पर इस समय लोड अधिक है। कृपया नीचे "पुनः प्रयास करें" पर टैप करें अथवा किसान हेल्पलाइन पर संपर्क करें।';
      } else if (rawMsg.includes('429') || rawMsg.includes('RESOURCE_EXHAUSTED')) {
        userFriendlyMsg =
          lang === 'en'
            ? 'Service is temporarily busy. Please retry in a few seconds.'
            : 'सेवा अभी व्यस्त है। कृपया कुछ सेकंड बाद पुनः प्रयास करें।';
      } else if (rawMsg.startsWith('{') && rawMsg.endsWith('}')) {
        try {
          const parsed = JSON.parse(rawMsg);
          userFriendlyMsg = parsed?.error?.message || parsed?.message || rawMsg;
        } catch (_) {}
      }

      setError(userFriendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = (preset: ScenarioPreset) => {
    setQuery(preset.query);
    setMode(preset.mode);
    setContextOptions((prev) => ({
      ...prev,
      targetDomain: preset.domain,
    }));
    setStatus((prev) => ({
      ...prev,
      hoursRemaining: preset.hoursDefault,
      works: preset.status.works,
      stubbed: preset.status.stubbed,
      cut: preset.status.cut,
    }));
    setMobileTab('mentor');
  };

  const handleApplyCut = (cutText: string) => {
    const cleanCut = cutText.replace(/^[-*•\d.]+\s*/gm, '').trim();
    setStatus((prev) => {
      const existing = prev.cut.trim();
      const updated = existing ? `${existing}; ${cleanCut}` : cleanCut;
      return { ...prev, cut: updated };
    });
  };

  const handleCopyFarmPrescription = () => {
    const summary =
      lang === 'en'
        ? `=== 🌾 Kisan AI Crop Advisory & Prescription ===
Current Crop: ${status.works}
Field & Soil: ${status.stubbed}
Irrigation Source: ${status.cut}
Crop Stage: ${status.hoursRemaining} days after sowing

Status: ${activeAudit?.verdict === 'SHIP IT' ? 'Recommended' : activeAudit?.verdict === 'FAKE IT' ? 'Caution' : 'Avoid'}

[Expert Advice]
${activeAudit ? activeAudit.response.slice(0, 500) : 'Advisory is being generated...'}

Kisan Helpline: 1800-180-1551 (Toll-Free)
`
        : `=== 🌾 किसान फसल सलाह व उपचार पर्ची ===
वर्तमान फसल: ${status.works}
खेत व मिट्टी: ${status.stubbed}
सिंचाई का साधन: ${status.cut}
फसल की अवस्था: बुवाई के ${status.hoursRemaining} दिन

सलाह स्थिति: ${activeAudit?.verdict === 'SHIP IT' ? 'तुरंत करें' : activeAudit?.verdict === 'FAKE IT' ? 'सावधानी बरतें' : 'नुकसान से बचें'}

[विशेषज्ञ की सलाह]
${activeAudit ? activeAudit.response.slice(0, 500) : 'सलाह तैयार की जा रही है...'}

किसान हेल्पलाइन: 1800-180-1551 (टोल-फ्री)
`;

    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const selectedProfileFarmer =
    allFarmers.find((f) => f.username === selectedProfileUsername) || currentUser;

  return (
    <div className="min-h-screen bg-[#0a0d14] text-neutral-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="border-b border-neutral-800 bg-[#0e1420]/95 backdrop-blur sticky top-0 z-30 px-3 sm:px-6 py-2.5 sm:py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Persona */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl sm:text-2xl shadow-md shadow-emerald-950/40">
              🌾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white font-sans">
                  {t.appName}
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-sans font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                  {t.appBadge}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-400 font-sans">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs (Desktop & Tablet) */}
          <nav className="hidden md:flex items-center bg-[#131926] p-1 rounded-2xl border border-neutral-800">
            <button
              type="button"
              onClick={() => setMainTab('doctor')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                mainTab === 'doctor'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>🌾</span>
              <span>{t.navDoctor}</span>
            </button>

            <button
              type="button"
              onClick={() => setMainTab('mandi')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                mainTab === 'mandi'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>📈</span>
              <span>{lang === 'en' ? 'Mandi Rates' : 'मंडी भाव'}</span>
            </button>

            <button
              type="button"
              onClick={() => setMainTab('social')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                mainTab === 'social'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>📸</span>
              <span>{t.navSocial}</span>
            </button>

            <button
              type="button"
              onClick={() => setMainTab('chat')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                mainTab === 'chat'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>💬</span>
              <span>{t.navChat}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedProfileUsername(currentUser.username);
                setMainTab('profile');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                mainTab === 'profile'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>👤</span>
              <span>{t.navProfile}</span>
            </button>
          </nav>

          {/* Right Actions: Language Switch, User ID Badge, Helpline, Share */}
          <div className="flex items-center gap-2">
            {/* Primary Language Toggle Button */}
            <button
              type="button"
              id="language-toggle-button"
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-emerald-500/20 hover:from-amber-500/30 hover:to-emerald-500/30 border border-amber-400/40 text-amber-300 hover:text-amber-200 text-xs font-bold transition shadow-sm"
              title={lang === 'hi' ? 'Switch to English language' : 'हिंदी भाषा में बदलें'}
            >
              <span className="text-sm">🌐</span>
              <span className="font-sans font-bold">{t.langSwitchBtn}</span>
            </button>

            {/* User Account ID Pill */}
            <button
              type="button"
              id="farmer-account-auth-button"
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-emerald-500/40 text-neutral-200 text-xs font-sans transition group"
              title={lang === 'en' ? 'User ID & Password / Switch Account' : 'यूजर आईडी व पासवर्ड / खाता बदलें'}
            >
              <span className="text-base">{currentUser.avatar}</span>
              <div className="text-left">
                <div className="text-[10px] text-emerald-400 font-mono font-bold leading-none">
                  @{currentUser.username}
                </div>
                <div className="text-[9px] text-neutral-400 leading-none mt-0.5 group-hover:text-white">
                  {t.loginOrSwitch}
                </div>
              </div>
            </button>

            {/* Quick DM Chat button */}
            <button
              type="button"
              onClick={() => setMainTab('chat')}
              className={`p-2 rounded-xl border transition relative ${
                mainTab === 'chat'
                  ? 'bg-emerald-500 text-black border-emerald-400'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-emerald-400 border-neutral-700'
              }`}
              title={lang === 'en' ? 'View Chat Messages' : 'चैट संदेश देखें'}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full" />
            </button>

            {/* Toll Free Helpline Badge */}
            <a
              href="tel:18001801551"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold hover:bg-emerald-900 transition shadow-sm"
              title={lang === 'en' ? 'Call Kisan Call Center' : 'किसान कॉल सेंटर पर कॉल करें'}
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.helpline}</span>
            </a>

            {/* Export Prescription Button */}
            <button
              type="button"
              id="export-sprint-summary-button"
              onClick={handleCopyFarmPrescription}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 text-xs font-sans transition"
              title={lang === 'en' ? 'Copy crop prescription' : 'फसल पर्ची कॉपी करें'}
            >
              {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedSummary ? t.copied : t.copyPrescription}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Kisan Super Action Ribbon */}
      <div className="bg-[#0b0e17] border-b border-neutral-800/80 px-3 py-2 sticky top-[57px] md:static z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap shadow-sm shadow-emerald-950/40"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>{lang === 'en' ? '📷 AI Disease Scanner' : '📷 एआई रोग जांच'}</span>
            </button>

            <button
              type="button"
              onClick={() => setMainTab('mandi')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
                mainTab === 'mandi'
                  ? 'bg-emerald-500 text-black border-emerald-400 shadow'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-800'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'en' ? '📈 Mandi Rates & Advice' : '📈 मंडी भाव व सलाह'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFertilizerOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap"
            >
              <Calculator className="w-3.5 h-3.5 text-sky-400" />
              <span>{lang === 'en' ? '🧮 Fertilizer & ROI Calc' : '🧮 खाद एवं बचत कैलकुलेटर'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsEmergencyGuideOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span>{lang === 'en' ? '🛡️ Offline Emergency Guide' : '🛡️ ऑफलाइन रक्षा गाइड'}</span>
            </button>
          </div>

          {/* PWA Install Button */}
          {isInstallable && (
            <button
              type="button"
              onClick={handleInstallPWA}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-1.5 transition shadow-md whitespace-nowrap animate-bounce"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? '📱 Install App' : '📱 ऐप इंस्टॉल करें'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Nav Bar (Phone Only) */}
      <div className="md:hidden bg-[#0e1420] border-b border-neutral-800 px-2 py-1.5 flex items-center justify-between gap-1 sticky top-[102px] z-10">
        <button
          type="button"
          onClick={() => setMainTab('doctor')}
          className={`flex-1 py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center gap-0.5 transition ${
            mainTab === 'doctor'
              ? 'bg-emerald-500 text-black shadow-md'
              : 'text-neutral-400 hover:text-white bg-neutral-900/60'
          }`}
        >
          <span className="text-base leading-none">🌾</span>
          <span className="text-[10px]">{t.navDoctor}</span>
        </button>

        <button
          type="button"
          onClick={() => setMainTab('mandi')}
          className={`flex-1 py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center gap-0.5 transition ${
            mainTab === 'mandi'
              ? 'bg-emerald-500 text-black shadow-md'
              : 'text-neutral-400 hover:text-white bg-neutral-900/60'
          }`}
        >
          <span className="text-base leading-none">📈</span>
          <span className="text-[10px]">{lang === 'en' ? 'Mandi' : 'मंडी'}</span>
        </button>

        <button
          type="button"
          onClick={() => setMainTab('social')}
          className={`flex-1 py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center gap-0.5 transition ${
            mainTab === 'social'
              ? 'bg-emerald-500 text-black shadow-md'
              : 'text-neutral-400 hover:text-white bg-neutral-900/60'
          }`}
        >
          <span className="text-base leading-none">📸</span>
          <span className="text-[10px]">{t.navSocial}</span>
        </button>

        <button
          type="button"
          onClick={() => setMainTab('chat')}
          className={`flex-1 py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center gap-0.5 transition relative ${
            mainTab === 'chat'
              ? 'bg-emerald-500 text-black shadow-md'
              : 'text-neutral-400 hover:text-white bg-neutral-900/60'
          }`}
        >
          <span className="text-base leading-none">💬</span>
          <span className="text-[10px]">{t.navChat}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedProfileUsername(currentUser.username);
            setMainTab('profile');
          }}
          className={`flex-1 py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center gap-0.5 transition ${
            mainTab === 'profile'
              ? 'bg-emerald-500 text-black shadow-md'
              : 'text-neutral-400 hover:text-white bg-neutral-900/60'
          }`}
        >
          <span className="text-base leading-none">👤</span>
          <span className="text-[10px]">{t.navProfile}</span>
        </button>
      </div>

      {/* VIEW 1: AI KRISHI DOCTOR */}
      {mainTab === 'doctor' && (
        <>
          {/* Sub Tab Navigation for Doctor on Phone */}
          <div className="lg:hidden bg-[#111722] border-b border-neutral-800 px-3 py-1.5 flex items-center justify-between gap-1.5">
            <button
              type="button"
              id="mobile-tab-farmer"
              onClick={() => setMobileTab('farmer')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                mobileTab === 'farmer'
                  ? 'bg-emerald-500 text-black shadow'
                  : 'text-neutral-400 hover:text-white bg-neutral-900/60'
              }`}
            >
              <span>🚜 {t.oneTapAssistance}</span>
            </button>

            <button
              type="button"
              id="mobile-tab-mentor"
              onClick={() => setMobileTab('mentor')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                mobileTab === 'mentor'
                  ? 'bg-emerald-500 text-black shadow'
                  : 'text-neutral-400 hover:text-white bg-neutral-900/60'
              }`}
            >
              <span>🌱 {t.adviceAndRx}</span>
            </button>

            <button
              type="button"
              id="mobile-tab-status"
              onClick={() => setMobileTab('status')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                mobileTab === 'status'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-neutral-400 hover:text-white bg-neutral-900/60'
              }`}
            >
              <span>🌾 {t.farmProfile}</span>
            </button>
          </div>

          {/* Main Workspace */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
            {/* Left Column: Farm Profile, Guidelines & Presets (5 cols on lg) */}
            <div
              className={`lg:col-span-5 space-y-4 sm:space-y-5 ${
                mobileTab === 'status' ? 'block' : 'hidden lg:block'
              }`}
            >
              {/* Frequently Asked Farm Questions */}
              <div className="bg-[#111722] border border-emerald-500/30 rounded-xl p-3.5 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-sans font-bold text-white flex items-center gap-1.5">
                    <span>🌾</span>
                    {t.quickTopicsTitle}
                  </span>
                  <span className="text-[11px] text-emerald-400 font-sans">
                    {lang === 'en' ? 'Tap to ask' : '1-टैप में पूछें'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      id={`apply-preset-${p.id}`}
                      onClick={() => handleApplyPreset(p)}
                      className="text-left p-2.5 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 hover:border-emerald-500/40 text-xs font-sans transition"
                    >
                      <div className="font-bold text-neutral-200 truncate">{p.title}</div>
                      <div className="text-[11px] text-emerald-400 flex justify-between mt-1">
                        <span>
                          {p.domain === 'Agriculture & Climate'
                            ? (lang === 'en' ? 'Agri' : 'कृषि')
                            : (lang === 'en' ? 'Scheme' : 'योजना')}
                        </span>
                        <span className="text-neutral-400">{lang === 'en' ? 'Tap →' : 'टैप करें →'}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Farm & Crop Profile Card */}
              <StatusBlockEditor status={status} onChange={setStatus} lang={lang} />

              {/* Kisan Guidelines & Govt Schemes */}
              <BricsCriteriaPanel lang={lang} />

              {/* Saved Prescriptions History */}
              <SprintLog
                audits={audits}
                activeId={activeAudit?.id}
                onSelectAudit={(item) => {
                  setActiveAudit(item);
                  setMobileTab('mentor');
                }}
                onClearHistory={() => {
                  setAudits([]);
                  setActiveAudit(null);
                }}
                lang={lang}
              />
            </div>

            {/* Right Column: Visual Touch Cards, Query Console & Advisory Output Card (7 cols on lg) */}
            <div
              className={`lg:col-span-7 space-y-4 sm:space-y-5 ${
                mobileTab === 'status' ? 'hidden lg:block' : 'block'
              }`}
            >
              {/* Microclimate Weather & Spray Window Index */}
              <div className={`${mobileTab === 'farmer' || mobileTab === 'mentor' ? 'block' : 'hidden lg:block'}`}>
                <WeatherSprayAdvisoryCard lang={lang} />
              </div>

              {/* Farmer Visual Touch Cards */}
              <div className={`${mobileTab === 'farmer' ? 'block' : 'hidden lg:block'}`}>
                <FarmerSimpleCards
                  onSelectQuery={handleFarmerCardSelect}
                  onVoiceInputToggle={toggleVoiceInput}
                  isListening={isListening}
                  lang={lang}
                />
              </div>

              {/* Consultation Form */}
              <div
                className={`bg-[#111722] border border-emerald-500/40 rounded-xl p-4 sm:p-5 shadow-2xl ${
                  mobileTab === 'mentor' || mobileTab === 'farmer' ? 'block' : 'hidden lg:block'
                }`}
              >
                <form onSubmit={handleSubmitQuery} className="space-y-3.5 sm:space-y-4">
                  {/* Voice Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/40">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-2xl shrink-0">🎙️</span>
                      <div className="min-w-0">
                        <span className="font-bold text-white text-xs sm:text-sm truncate block">
                          {t.voiceAskTitle}
                        </span>
                        <div className="text-neutral-300 text-[11px] truncate">
                          {t.voiceAskSubtitle}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      id="toggle-mic-input-button"
                      onClick={toggleVoiceInput}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-1.5 transition shadow-md min-h-[40px] whitespace-nowrap shrink-0 ${
                        isListening
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-black'
                      }`}
                    >
                      <Mic className="w-4 h-4 shrink-0" />
                      <span className="whitespace-nowrap">
                        {isListening ? t.listening : t.tapToSpeak}
                      </span>
                    </button>
                  </div>

                  {/* Advisory Category Selection */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-sans">
                      <span className="text-neutral-300 font-medium">
                        {t.categoryLabel}
                      </span>
                      <span className="text-emerald-400 text-[11px]">
                        {mode === 'AUTO' && t.categoryAll}
                        {mode === 'SCOPE' && t.categoryPest}
                        {mode === 'DEBUG' && t.categoryWater}
                        {mode === 'PITCH' && t.categorySchemes}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                      <button
                        type="button"
                        id="mode-auto-button"
                        onClick={() => setMode('AUTO')}
                        className={`p-2 rounded-xl text-xs font-sans flex items-center justify-center gap-1 border transition min-h-[38px] ${
                          mode === 'AUTO'
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span className="truncate">{t.categoryAll}</span>
                      </button>

                      <button
                        type="button"
                        id="mode-scope-button"
                        onClick={() => setMode('SCOPE')}
                        className={`p-2 rounded-xl text-xs font-sans flex items-center justify-center gap-1 border transition min-h-[38px] ${
                          mode === 'SCOPE'
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        <Bug className="w-3.5 h-3.5" />
                        <span className="truncate">{t.categoryPest}</span>
                      </button>

                      <button
                        type="button"
                        id="mode-debug-button"
                        onClick={() => setMode('DEBUG')}
                        className={`p-2 rounded-xl text-xs font-sans flex items-center justify-center gap-1 border transition min-h-[38px] ${
                          mode === 'DEBUG'
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        <Droplets className="w-3.5 h-3.5" />
                        <span className="truncate">{t.categoryWater}</span>
                      </button>

                      <button
                        type="button"
                        id="mode-pitch-button"
                        onClick={() => setMode('PITCH')}
                        className={`p-2 rounded-xl text-xs font-sans flex items-center justify-center gap-1 border transition min-h-[38px] ${
                          mode === 'PITCH'
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        <Landmark className="w-3.5 h-3.5" />
                        <span className="truncate">{t.categorySchemes}</span>
                      </button>
                    </div>
                  </div>

                  {/* Query Textarea */}
                  <div>
                    <label className="block text-xs font-sans text-neutral-300 mb-1 font-medium flex justify-between">
                      <span>{t.problemLabel}</span>
                      <span className="text-emerald-400 text-[11px]">{t.speakOrTypeHint}</span>
                    </label>
                    <textarea
                      id="mentor-query-textarea"
                      rows={3}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                          handleSubmitQuery();
                        }
                      }}
                      placeholder={t.queryPlaceholder}
                      className="w-full bg-[#090c12] border border-neutral-800 rounded-xl p-3 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition resize-none font-sans"
                    />
                  </div>

                  {/* Submit Button & Helpline Info */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                    <div className="text-xs text-neutral-400 flex items-center gap-1.5">
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{t.helplineText} <strong>1800-180-1551</strong></span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <button
                        type="button"
                        id="scan-crop-camera-button"
                        onClick={() => setIsScannerOpen(true)}
                        className="w-full sm:w-auto px-4 py-3 sm:py-2.5 rounded-xl font-sans text-xs sm:text-sm font-bold flex items-center justify-center gap-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 transition shadow-md min-h-[46px]"
                      >
                        <Camera className="w-4 h-4 text-emerald-400" />
                        <span>{lang === 'en' ? '📷 Scan Leaf Photo' : '📷 पत्ती का फोटो जांचें'}</span>
                      </button>

                      <button
                        type="submit"
                        id="submit-mentor-audit-button"
                        disabled={loading || !query.trim()}
                        className={`w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-xl font-sans text-xs sm:text-sm font-bold tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg min-h-[46px] ${
                          loading || !query.trim()
                            ? 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20 active:scale-98'
                        }`}
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>{t.preparingAdvice}</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>{t.getAdviceBtn}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs font-sans space-y-2.5 shadow-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <strong className="block text-red-200 text-sm font-bold">
                        {lang === 'en' ? 'Unable to generate advice:' : 'सलाह प्राप्त नहीं हो सकी:'}
                      </strong>
                      <p className="text-red-300/90 text-xs leading-relaxed mt-0.5">{error}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-red-500/20">
                    <button
                      type="button"
                      onClick={() => handleSubmitQuery()}
                      disabled={loading || !query.trim()}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 transition shadow"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                      <span>{lang === 'en' ? 'Retry Advice' : 'पुनः सलाह प्राप्त करें'}</span>
                    </button>

                    <a
                      href="tel:18001801551"
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs flex items-center gap-1.5 transition border border-neutral-700"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{lang === 'en' ? 'Call Helpline: 1800-180-1551' : 'किसान हेल्पलाइन: 1800-180-1551'}</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => setError(null)}
                      className="ml-auto text-neutral-400 hover:text-white text-xs px-2 py-1"
                    >
                      {lang === 'en' ? 'Dismiss' : 'हटाएं'}
                    </button>
                  </div>
                </div>
              )}

              {/* Output Card or Guidance Placeholder */}
              {activeAudit ? (
                <MentorOutputCard
                  content={activeAudit.response}
                  verdict={activeAudit.verdict}
                  feasibilityScore={activeAudit.feasibilityScore}
                  modelUsed={activeAudit.modelUsed}
                  onApplyCut={handleApplyCut}
                  farmerMode={farmerMode}
                  lang={lang}
                />
              ) : (
                <div className="bg-[#111722] border border-emerald-500/30 rounded-xl p-6 sm:p-8 text-center space-y-4 shadow-xl">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-3xl shadow-inner">
                    🌱
                  </div>
                  <div className="max-w-md mx-auto space-y-2">
                    <h3 className="text-base sm:text-lg font-bold text-white font-sans">
                      {t.placeholderHeading}
                    </h3>
                    <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                      {t.placeholderDesc}
                    </p>
                  </div>

                  {/* Three Service Highlights */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto pt-3 text-left">
                    <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                      <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <Bug className="w-3.5 h-3.5" />
                        <span>{t.servicePestTitle}</span>
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-1">
                        {t.servicePestDesc}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                      <div className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                        <Droplets className="w-3.5 h-3.5" />
                        <span>{t.serviceWaterTitle}</span>
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-1">
                        {t.serviceWaterDesc}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                      <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <Landmark className="w-3.5 h-3.5" />
                        <span>{t.serviceSchemesTitle}</span>
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-1">
                        {t.serviceSchemesDesc}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </>
      )}

      {/* VIEW: MANDI RATES & PRICE INTELLIGENCE */}
      {mainTab === 'mandi' && (
        <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-4 lg:p-6">
          <MandiMarketTracker lang={lang} />
        </main>
      )}

      {/* VIEW 2: KISAN SOCIAL FEED (Instagram style) */}
      {mainTab === 'social' && (
        <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-4 lg:p-6">
          <KisanSocialFeed
            currentUser={currentUser}
            allFarmers={allFarmers}
            posts={posts}
            stories={stories}
            onFollowToggle={handleFollowToggle}
            onLikeToggle={handleLikeToggle}
            onAddComment={handleAddComment}
            onCreatePost={handleCreatePost}
            onOpenChatWith={handleOpenChatWith}
            onOpenProfile={handleOpenProfile}
            lang={lang}
          />
        </main>
      )}

      {/* VIEW 3: KISAN DIRECT CHAT (Instagram DM style) */}
      {mainTab === 'chat' && (
        <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-4 lg:p-6">
          <KisanDirectChat
            currentUser={currentUser}
            allFarmers={allFarmers}
            selectedPartnerUsername={selectedChatPartner}
            onFollowToggle={handleFollowToggle}
            activeAdvice={activeAudit}
            chatMessages={chatMessages}
            onSendMessage={handleSendMessage}
            lang={lang}
          />
        </main>
      )}

      {/* VIEW 4: FARMER PROFILE (Instagram profile style) */}
      {mainTab === 'profile' && (
        <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-4 lg:p-6">
          <FarmerProfileView
            farmer={selectedProfileFarmer}
            currentUser={currentUser}
            allPosts={posts}
            onFollowToggle={handleFollowToggle}
            onOpenChatWith={handleOpenChatWith}
            onSwitchAccount={() => setIsAuthModalOpen(true)}
            onLogout={() => setIsAuthModalOpen(true)}
            lang={lang}
          />
        </main>
      )}

      {/* User ID & Password Authentication Modal */}
      <FarmerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setSelectedProfileUsername(user.username);
        }}
        allFarmers={allFarmers}
        onRegisterSuccess={handleRegisterSuccess}
        lang={lang}
        onToggleLang={toggleLanguage}
      />

      {/* Multimodal AI Crop Disease Scanner Modal */}
      <CropDiseaseScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        lang={lang}
      />

      {/* Precision Fertilizer & ROI Savings Calculator Modal */}
      <FertilizerCalculatorModal
        isOpen={isFertilizerOpen}
        onClose={() => setIsFertilizerOpen(false)}
        lang={lang}
      />

      {/* 100% Offline Emergency Crop Defense Guide Modal */}
      <OfflineEmergencyGuideModal
        isOpen={isEmergencyGuideOpen}
        onClose={() => setIsEmergencyGuideOpen(false)}
        lang={lang}
      />
    </div>
  );
}
