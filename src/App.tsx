import React, { useState, useEffect } from 'react';
import {
  FarmerUser,
  KisanPost,
  KisanStory,
  ChatMessage,
  CropDiseaseDiagnosis,
} from './types';
import { SpraySafetyTrafficCard } from './components/SpraySafetyTrafficCard';
import { RegenerativeSoilCard } from './components/RegenerativeSoilCard';
import { CropDiagnosisView } from './components/CropDiagnosisView';
import { VoiceAssistantView } from './components/VoiceAssistantView';
import { MoreFeaturesDrawer } from './components/MoreFeaturesDrawer';
import { BricsAgriNNetworkHub } from './components/BricsAgriNNetworkHub';
import { MandiMarketTracker } from './components/MandiMarketTracker';
import { KisanSocialFeed } from './components/KisanSocialFeed';
import { KisanDirectChat } from './components/KisanDirectChat';
import { FarmerProfileView } from './components/FarmerProfileView';
import { FertilizerCalculatorModal } from './components/FertilizerCalculatorModal';
import { OfflineEmergencyGuideModal } from './components/OfflineEmergencyGuideModal';
import { FarmerAuthModal } from './components/FarmerAuthModal';
import {
  DEFAULT_FARMERS,
  INITIAL_POSTS,
  INITIAL_STORIES,
  INITIAL_CHAT_MESSAGES,
} from './data/mockSocialData';
import {
  Camera,
  Mic,
  PhoneCall,
  Sun,
  Volume2,
  VolumeX,
  Globe,
  Grid,
  ArrowLeft,
  Download,
  ShieldAlert,
  Calculator,
  TrendingUp,
} from 'lucide-react';
import { speechManager } from './utils/speech';

type ActiveView = 'home' | 'camera' | 'voice' | 'agrin' | 'mandi' | 'social' | 'chat' | 'profile';

export default function App() {
  // Language State: 'hi' (Hindi) or 'en' (English) - Default to Hindi
  const [lang, setLang] = useState<'hi' | 'en'>(() => {
    const saved = localStorage.getItem('kisan_preferred_lang');
    return saved === 'en' || saved === 'hi' ? saved : 'hi';
  });

  // Outdoor Sun-Glare Mode (High Contrast Light Mode)
  const [isSunMode, setIsSunMode] = useState<boolean>(() => {
    return localStorage.getItem('kisan_sun_mode') === 'true';
  });

  // Active Screen View: 'home' is the streamlined 3-action illiterate screen
  const [activeView, setActiveView] = useState<ActiveView>('home');

  // Secondary Features Drawer
  const [isMoreDrawerOpen, setIsMoreDrawerOpen] = useState(false);

  // Modals for secondary tools
  const [isFertilizerOpen, setIsFertilizerOpen] = useState(false);
  const [isEmergencyGuideOpen, setIsEmergencyGuideOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // Persisted Farmers, Posts, Stories & Chats
  const [allFarmers, setAllFarmers] = useState<FarmerUser[]>(() => {
    const saved = localStorage.getItem('kisan_all_farmers');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_FARMERS;
  });

  const [currentUser, setCurrentUser] = useState<FarmerUser>(() => {
    const saved = localStorage.getItem('kisan_auth_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_FARMERS[0];
  });

  const [posts, setPosts] = useState<KisanPost[]>(() => {
    const saved = localStorage.getItem('kisan_social_posts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_POSTS;
  });

  const [stories, setStories] = useState<KisanStory[]>(() => {
    const saved = localStorage.getItem('kisan_social_stories');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_STORIES;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('kisan_chat_messages');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_CHAT_MESSAGES;
  });

  const [selectedChatPartner, setSelectedChatPartner] = useState<string>('baldev_singh');
  const [selectedProfileUsername, setSelectedProfileUsername] = useState<string>(currentUser.username);

  useEffect(() => {
    localStorage.setItem('kisan_preferred_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('kisan_sun_mode', String(isSunMode));
  }, [isSunMode]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
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

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'hi' ? 'en' : 'hi'));
  };

  const toggleSunMode = () => {
    setIsSunMode((prev) => !prev);
  };

  // Welcome spoken greeting on first entry
  const playWelcomeSpeech = () => {
    const greeting = lang === 'hi'
      ? 'किसान सहायक में आपका स्वागत है। फसल जांच के लिए हरा कैमरा बटन दबाएं, या बोलकर पूछने के लिए नीला माइक बटन दबाएं।'
      : 'Welcome to Kisan AI. Tap green camera to scan crop, or tap blue mic to ask questions by voice.';
    speechManager.speak(greeting, lang);
  };

  // Secondary subview handlers
  const handleFollowToggle = (targetUsername: string) => {
    setAllFarmers((prev) =>
      prev.map((f) => {
        if (f.username === targetUsername) {
          const isFollowing = f.followers.includes(currentUser.username);
          return {
            ...f,
            followers: isFollowing
              ? f.followers.filter((u) => u !== currentUser.username)
              : [...f.followers, currentUser.username],
          };
        }
        if (f.username === currentUser.username) {
          const isFollowing = f.following.includes(targetUsername);
          return {
            ...f,
            following: isFollowing
              ? f.following.filter((u) => u !== targetUsername)
              : [...f.following, targetUsername],
          };
        }
        return f;
      })
    );
  };

  const handleLikeToggle = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const hasLiked = p.likes.includes(currentUser.username);
          return {
            ...p,
            likes: hasLiked
              ? p.likes.filter((u) => u !== currentUser.username)
              : [...p.likes, currentUser.username],
          };
        }
        return p;
      })
    );
  };

  const handleAddComment = (postId: string, text: string) => {
    const newComment = {
      id: 'c_' + Date.now(),
      authorUsername: currentUser.username,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      text,
      timestamp: 'अभी',
    };
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p
      )
    );
  };

  const handleCreatePost = (newPostData: Partial<KisanPost>) => {
    const post: KisanPost = {
      id: 'post_' + Date.now(),
      authorId: currentUser.id,
      authorUsername: currentUser.username,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      authorVillage: currentUser.village,
      caption: newPostData.caption || '',
      imageUrl: newPostData.imageUrl,
      cropTag: newPostData.cropTag || currentUser.crops[0] || 'फसल',
      timestamp: 'अभी',
      likes: [],
      comments: [],
    };
    setPosts((prev) => [post, ...prev]);
  };

  const handleSendMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: 'msg_' + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, newMsg]);
  };

  const selectedProfileFarmer =
    allFarmers.find((f) => f.username === selectedProfileUsername) || currentUser;

  // ROUTE 1: CAMERA-FIRST CROP DIAGNOSIS
  if (activeView === 'camera') {
    return (
      <CropDiagnosisView
        lang={lang}
        isSunMode={isSunMode}
        onBack={() => setActiveView('home')}
      />
    );
  }

  // ROUTE 2: VOICE Q&A
  if (activeView === 'voice') {
    return (
      <VoiceAssistantView
        lang={lang}
        isSunMode={isSunMode}
        onBack={() => setActiveView('home')}
      />
    );
  }

  // ROUTE 3: COLLAPSED SECONDARY VIEWS (WITH 1-TAP "BACK TO HOME")
  if (activeView !== 'home') {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 pb-16">
        {/* Sticky Back Header */}
        <header className="sticky top-0 z-40 bg-white border-b-3 border-black px-4 py-3 flex items-center justify-between shadow-sm">
          <button
            type="button"
            onClick={() => setActiveView('home')}
            className="h-12 px-4 rounded-xl border-2 border-black bg-slate-100 active:bg-slate-200 font-black text-sm flex items-center gap-2 shadow-[0_3px_0_0_#000]"
          >
            <ArrowLeft className="w-5 h-5 text-black" />
            <span>{lang === 'hi' ? '🔙 मुख्य पृष्ठ' : '🔙 Home'}</span>
          </button>

          <span className="font-black text-sm sm:text-base text-slate-900">
            {activeView === 'agrin' && (lang === 'hi' ? '🌐 ब्रिक्स AgriN नेटवर्क' : '🌐 BRICS AgriN Hub')}
            {activeView === 'mandi' && (lang === 'hi' ? '📈 मंडी भाव व सलाह' : '📈 Mandi Rates')}
            {activeView === 'social' && (lang === 'hi' ? '📸 किसान चौपाल' : '📸 Community Feed')}
            {activeView === 'chat' && (lang === 'hi' ? '💬 किसान संदेश' : '💬 Direct Chat')}
            {activeView === 'profile' && (lang === 'hi' ? '👤 प्रोफ़ाइल' : '👤 Profile')}
          </span>

          <a
            href="tel:18001801551"
            className="h-12 w-12 rounded-xl border-2 border-black bg-emerald-400 active:bg-emerald-500 flex items-center justify-center shadow-[0_3px_0_0_#000]"
            title="Call Helpline"
          >
            <PhoneCall className="w-6 h-6 text-black" />
          </a>
        </header>

        <main className="max-w-5xl mx-auto p-3 sm:p-4">
          {activeView === 'agrin' && (
            <BricsAgriNNetworkHub
              lang={lang}
              onOpenDiseaseScanner={() => setActiveView('camera')}
            />
          )}

          {activeView === 'mandi' && <MandiMarketTracker lang={lang} />}

          {activeView === 'social' && (
            <KisanSocialFeed
              currentUser={currentUser}
              allFarmers={allFarmers}
              posts={posts}
              stories={stories}
              onFollowToggle={handleFollowToggle}
              onLikeToggle={handleLikeToggle}
              onAddComment={handleAddComment}
              onCreatePost={handleCreatePost}
              onOpenChatWith={(u) => {
                setSelectedChatPartner(u);
                setActiveView('chat');
              }}
              onOpenProfile={(u) => {
                setSelectedProfileUsername(u);
                setActiveView('profile');
              }}
              lang={lang}
            />
          )}

          {activeView === 'chat' && (
            <KisanDirectChat
              currentUser={currentUser}
              allFarmers={allFarmers}
              selectedPartnerUsername={selectedChatPartner}
              onFollowToggle={handleFollowToggle}
              activeAdvice={null}
              chatMessages={chatMessages}
              onSendMessage={handleSendMessage}
              lang={lang}
            />
          )}

          {activeView === 'profile' && (
            <FarmerProfileView
              farmer={selectedProfileFarmer}
              currentUser={currentUser}
              allPosts={posts}
              onFollowToggle={handleFollowToggle}
              onOpenChatWith={(u) => {
                setSelectedChatPartner(u);
                setActiveView('chat');
              }}
              onSwitchAccount={() => setIsAuthModalOpen(true)}
              onLogout={() => setIsAuthModalOpen(true)}
              lang={lang}
            />
          )}
        </main>
      </div>
    );
  }

  // -------------------------------------------------------------
  // THE REDESIGNED HOME SCREEN:
  // Designed for farmers with low/no literacy on a basic 5" Android phone
  // in direct sun-glare outdoor conditions.
  // 1 home screen, exactly 3-4 giant tactile icon buttons max.
  // -------------------------------------------------------------
  return (
    <div
      className={`min-h-screen pb-14 font-sans transition-colors ${
        isSunMode ? 'bg-white text-black' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* High-Contrast Outdoor Top Bar */}
      <header className="sticky top-0 z-30 bg-white border-b-3 border-black px-3 py-2.5 flex items-center justify-between shadow-sm">
        {/* Brand & Audio Welcome */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-[#16A34A] border-2 border-black flex items-center justify-center text-xl shadow-[0_2px_0_0_#000]">
            🌾
          </div>
          <div>
            <h1 className="font-black text-base sm:text-lg leading-tight tracking-tight text-slate-950 flex items-center gap-1.5">
              <span>{lang === 'hi' ? 'किसान AI सहायक' : 'Kisan AI Assistant'}</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-600 leading-none">
              {lang === 'hi' ? 'सरल • बोलकर • सुरक्षित' : 'Voice-First • Solar-Tested'}
            </p>
          </div>
        </div>

        {/* Quick Outdoor Controls */}
        {/* Quick Outdoor Controls with explicit non-literate visual labels (FIX 3) */}
        <div className="flex items-center gap-1.5">
          {/* Audio Welcome/Help */}
          <button
            type="button"
            onClick={playWelcomeSpeech}
            className="h-11 px-2 rounded-xl border-2 border-black bg-slate-100 active:bg-slate-200 flex flex-col items-center justify-center shadow-[0_2px_0_0_#000] cursor-pointer"
            title={lang === 'hi' ? 'आवाज़ से मदद सुनें' : 'Listen to Voice Help'}
          >
            <Volume2 className="w-4 h-4 text-black" />
            <span className="text-[9px] font-black text-slate-800 leading-none mt-0.5">
              {lang === 'hi' ? 'आवाज़' : 'Audio'}
            </span>
          </button>

          {/* Sun-Glare Mode Toggle */}
          <button
            type="button"
            id="sun-glare-mode-toggle"
            onClick={toggleSunMode}
            className={`h-11 px-2 rounded-xl border-2 border-black flex flex-col items-center justify-center shadow-[0_2px_0_0_#000] transition active:scale-95 cursor-pointer ${
              isSunMode ? 'bg-amber-400 text-black' : 'bg-slate-100 text-slate-700'
            }`}
            title={lang === 'hi' ? 'तेज धूप मोड (Sun Glare)' : 'Sun Glare High Contrast Mode'}
          >
            <Sun className="w-4 h-4" />
            <span className="text-[9px] font-black text-slate-900 leading-none mt-0.5">
              {lang === 'hi' ? 'धूप मोड' : 'Sun'}
            </span>
          </button>

          {/* Language Switch */}
          <button
            type="button"
            id="lang-toggle-button"
            onClick={toggleLanguage}
            className="h-11 px-2.5 rounded-xl border-2 border-black bg-white active:bg-slate-200 font-black text-xs flex flex-col items-center justify-center shadow-[0_2px_0_0_#000] cursor-pointer"
            title={lang === 'hi' ? 'Switch to English' : 'हिंदी भाषा'}
          >
            <Globe className="w-4 h-4 text-black" />
            <span className="text-[9px] font-black text-slate-900 leading-none mt-0.5">
              {lang === 'hi' ? 'English' : 'हिंदी'}
            </span>
          </button>

          {/* PWA Install Button (if eligible) */}
          {isInstallable && (
            <button
              type="button"
              onClick={handleInstallPWA}
              className="h-11 px-2 rounded-xl border-2 border-black bg-emerald-400 active:bg-emerald-500 font-black text-xs flex flex-col items-center justify-center shadow-[0_2px_0_0_#000] animate-bounce cursor-pointer"
            >
              <Download className="w-4 h-4 text-black" />
              <span className="text-[9px] font-black leading-none mt-0.5">ऐप</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Single-Column Thumb Area (Fits a 5" 720p Screen) */}
      <main className="max-w-md mx-auto p-3 sm:p-4 space-y-3.5">
        {/* ============================================================ */}
        {/* FIX 5: LEAD WITH STRONGEST FEATURE: CROP DOCTOR (DIAGNOSTIC)  */}
        {/* FIX 4: Entire card is one giant tap target with pressed state */}
        {/* ============================================================ */}
        <section id="crop-doctor-section">
          <button
            type="button"
            id="home-action-camera-scan"
            onClick={() => setActiveView('camera')}
            className="w-full min-h-[140px] sm:min-h-[155px] rounded-3xl bg-[#16A34A] hover:bg-[#15803D] active:scale-[0.98] active:translate-y-1 active:shadow-[0_2px_0_0_#000] text-white border-4 border-black p-4 flex items-center gap-4 shadow-[0_6px_0_0_#000] transition select-none cursor-pointer"
          >
            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-white border-3 border-black flex items-center justify-center shrink-0 shadow-inner">
              <Camera className="w-12 h-12 text-[#16A34A]" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-white block leading-tight">
                {lang === 'hi' ? '📷 फसल डॉक्टर' : '📷 Crop Doctor'}
              </span>
              <span className="text-xs sm:text-sm font-bold text-emerald-100 block mt-0.5">
                {lang === 'hi' ? 'बीमार पत्ती की फोटो जांचें' : 'Scan Leaf Disease (AI)'}
              </span>
              <div className="inline-flex items-center gap-1.5 text-xs font-black bg-black/30 px-2.5 py-1 rounded-lg mt-1.5 text-white border border-white/20">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
                <span>{lang === 'hi' ? '1-टैप कैमरा जांच' : '1-Tap Camera Scan'}</span>
              </div>
            </div>
          </button>
        </section>

        {/* ============================================================ */}
        {/* FIX 5: 2ND CARD: SPRAY-SAFETY TRAFFIC-LIGHT CARD (REAL-TIME) */}
        {/* ============================================================ */}
        <section id="spray-traffic-card-section">
          <SpraySafetyTrafficCard lang={lang} isSunMode={isSunMode} />
        </section>

        {/* ============================================================ */}
        {/* 3RD CARD: REGENERATIVE SOIL & CROP ADVISOR (NASA POWER + AI) */}
        {/* ============================================================ */}
        <section id="regenerative-soil-card-section">
          <RegenerativeSoilCard lang={lang} isSunMode={isSunMode} />
        </section>

        {/* ============================================================ */}
        {/* FIX 5: 4TH CARD: VOICE Q&A (GEMINI + OFFLINE AGRONOMY)       */}
        {/* FIX 4: Entire card is one giant tap target with pressed state */}
        {/* ============================================================ */}
        <section id="voice-assistant-section">
          <button
            type="button"
            id="home-action-voice-assistant"
            onClick={() => setActiveView('voice')}
            className="w-full min-h-[140px] sm:min-h-[155px] rounded-3xl bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.98] active:translate-y-1 active:shadow-[0_2px_0_0_#000] text-white border-4 border-black p-4 flex items-center gap-4 shadow-[0_6px_0_0_#000] transition select-none cursor-pointer"
          >
            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-white border-3 border-black flex items-center justify-center shrink-0 shadow-inner">
              <Mic className="w-12 h-12 text-[#2563EB] animate-pulse" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-white block leading-tight">
                {lang === 'hi' ? '🎙️ बोलकर पूछें' : '🎙️ Voice Q&A'}
              </span>
              <span className="text-xs sm:text-sm font-bold text-blue-100 block mt-0.5">
                {lang === 'hi' ? 'अपनी भाषा में सवाल बोलें' : 'Ask in any local language'}
              </span>
              <div className="inline-flex items-center gap-1.5 text-xs font-black bg-black/30 px-2.5 py-1 rounded-lg mt-1.5 text-white border border-white/20">
                <span>🔊</span>
                <span>{lang === 'hi' ? 'आवाज़ में सुने उत्तर' : 'Voice Speaks Back'}</span>
              </div>
            </div>
          </button>
        </section>

        {/* ============================================================ */}
        {/* DIRECT 1-TAP KISAN HELPLINE BUTTON                           */}
        {/* ============================================================ */}
        <section>
          <a
            href="tel:18001801551"
            id="quick-helpline-call-button"
            className="w-full h-15 rounded-2xl bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-950 border-3 border-black p-3 flex items-center justify-between gap-3 shadow-[0_4px_0_0_#000] transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 border-2 border-black flex items-center justify-center text-black shrink-0">
                <PhoneCall className="w-5 h-5 text-black" />
              </div>
              <div className="text-left">
                <span className="text-xs sm:text-sm font-black text-slate-950 block">
                  {lang === 'hi' ? '📞 सीधे वैज्ञानिक से बात करें' : '📞 Call Kisan Helpline'}
                </span>
                <span className="text-[11px] font-bold text-slate-600 block">
                  टोल-फ्री: <strong>1800-180-1551</strong>
                </span>
              </div>
            </div>

            <span className="text-xs font-black bg-[#16A34A] text-white px-2.5 py-1 rounded-lg border border-black">
              {lang === 'hi' ? 'कॉल' : 'Call'}
            </span>
          </a>
        </section>

        {/* ============================================================ */}
        {/* NETWORK & RESEARCH VIEW ENTRY POINT (Audience Separation)   */}
        {/* ============================================================ */}
        <section className="pt-1">
          <button
            type="button"
            id="open-more-features-drawer-button"
            onClick={() => setIsMoreDrawerOpen(true)}
            className="w-full min-h-[54px] py-2.5 px-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 active:bg-black text-slate-100 border-2 border-black font-black text-xs sm:text-sm flex items-center justify-between shadow-[0_3px_0_0_#000] transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5 text-left">
              <Globe className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="block font-black text-white text-xs sm:text-sm">
                  {lang === 'hi'
                    ? '🌐 नेटवर्क व अनुसंधान दृश्य (Network / Research View)'
                    : '🌐 Network & Research View (BRICS AgriN Hub)'}
                </span>
                <span className="block text-[10px] font-bold text-slate-400">
                  {lang === 'hi'
                    ? 'संस्थागत अनुसंधान केंद्र, मंडी विश्लेषण व नीतियां'
                    : 'Institutional Node Console for Researchers & Officers'}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-slate-800 text-emerald-300 border border-slate-700 px-2 py-1 rounded-lg shrink-0">
              {lang === 'hi' ? 'खोलें' : 'Open'}
            </span>
          </button>
        </section>
      </main>

      {/* MORE FEATURES DRAWER */}
      <MoreFeaturesDrawer
        isOpen={isMoreDrawerOpen}
        onClose={() => setIsMoreDrawerOpen(false)}
        lang={lang}
        currentUser={currentUser}
        onSelectFeature={(feature) => {
          if (feature === 'fertilizer') {
            setIsFertilizerOpen(true);
          } else if (feature === 'emergency') {
            setIsEmergencyGuideOpen(true);
          } else if (feature === 'profile') {
            setSelectedProfileUsername(currentUser.username);
            setActiveView('profile');
          } else {
            setActiveView(feature as ActiveView);
          }
        }}
      />

      {/* Secondary Modals */}
      <FertilizerCalculatorModal
        isOpen={isFertilizerOpen}
        onClose={() => setIsFertilizerOpen(false)}
        lang={lang}
      />

      <OfflineEmergencyGuideModal
        isOpen={isEmergencyGuideOpen}
        onClose={() => setIsEmergencyGuideOpen(false)}
        lang={lang}
      />

      <FarmerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setSelectedProfileUsername(user.username);
        }}
        allFarmers={allFarmers}
        onRegisterSuccess={(newUser) => {
          setAllFarmers((prev) => [...prev, newUser]);
          setCurrentUser(newUser);
        }}
        lang={lang}
        onToggleLang={toggleLanguage}
      />
    </div>
  );
}
