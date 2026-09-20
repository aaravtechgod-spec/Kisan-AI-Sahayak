import React, { useState, useEffect, useRef } from 'react';
import { FarmerUser, ChatMessage, MentorAudit } from '../types';
import {
  Send,
  ArrowLeft,
  PhoneCall,
  UserCheck,
  UserPlus,
  Mic,
  Sprout,
  X,
  Volume2,
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/translations';

interface KisanDirectChatProps {
  currentUser: FarmerUser;
  allFarmers: FarmerUser[];
  selectedPartnerUsername?: string;
  onClose?: () => void;
  onFollowToggle: (targetUsername: string) => void;
  activeAdvice?: MentorAudit | null;
  chatMessages: ChatMessage[];
  onSendMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  lang?: Language;
}

export const KisanDirectChat: React.FC<KisanDirectChatProps> = ({
  currentUser,
  allFarmers,
  selectedPartnerUsername,
  onClose,
  onFollowToggle,
  activeAdvice,
  chatMessages,
  onSendMessage,
  lang = 'hi',
}) => {
  const t = TRANSLATIONS[lang];

  const [activePartnerUsername, setActivePartnerUsername] = useState<string>(() => {
    if (selectedPartnerUsername) return selectedPartnerUsername;
    const other = allFarmers.find((f) => f.username !== currentUser.username);
    return other ? other.username : 'baldev_singh';
  });

  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileList, setShowMobileList] = useState(!selectedPartnerUsername);
  const [audioPlayingId, setAudioPlayingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedPartnerUsername) {
      setActivePartnerUsername(selectedPartnerUsername);
      setShowMobileList(false);
    }
  }, [selectedPartnerUsername]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, activePartnerUsername]);

  const activePartner = allFarmers.find((f) => f.username === activePartnerUsername) || allFarmers[1];
  const isFollowing = currentUser.following.includes(activePartner.username);

  const conversationMessages = chatMessages.filter(
    (m) =>
      (m.senderUsername === currentUser.username && m.receiverUsername === activePartner.username) ||
      (m.senderUsername === activePartner.username && m.receiverUsername === currentUser.username)
  );

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage({
      senderUsername: currentUser.username,
      receiverUsername: activePartner.username,
      text: inputText.trim(),
    });
    setInputText('');
  };

  const handleSendVoiceNote = () => {
    const voiceText = lang === 'en'
      ? '🎙️ [Voice Note 0:14s] "Hello brother, how is the crop doing today?"'
      : '🎙️ [आवाज संदेश / Voice Note 0:14s] "नमस्ते भाई, खेत का हाल बताएं"';
    onSendMessage({
      senderUsername: currentUser.username,
      receiverUsername: activePartner.username,
      text: voiceText,
      isVoiceNote: true,
    });
  };

  const handleShareAdvice = () => {
    if (!activeAdvice) {
      alert(lang === 'en' 
        ? 'Please generate advice from the Crop Doctor first, then share it here.' 
        : 'पहले कृषि डॉक्टर से कोई सलाह या पर्ची प्राप्त करें, फिर यहाँ शेयर करें।');
      return;
    }

    const sharePrefix = lang === 'en'
      ? `🌾 [Shared Crop Doctor Prescription]\n${activeAdvice.query}\nVerdict: ${activeAdvice.verdict === 'SHIP IT' ? 'Recommended' : 'Caution'}`
      : `🌾 [फसल उपचार पर्ची साझा की]\n${activeAdvice.query}\nनिर्णय: ${activeAdvice.verdict === 'SHIP IT' ? 'तुरंत करें' : 'सावधानी बरतें'}`;

    onSendMessage({
      senderUsername: currentUser.username,
      receiverUsername: activePartner.username,
      text: sharePrefix,
      adviceCard: {
        crop: activeAdvice.statusSnapshot.works || (lang === 'en' ? 'Crop Advice' : 'फसल सलाह'),
        verdict: activeAdvice.verdict || 'SHIP IT',
        summary: activeAdvice.response.slice(0, 180) + '...',
      },
    });
  };

  const playVoiceNote = (id: string, text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const speakString = lang === 'en'
        ? 'Hello brother, how is the crop doing today?'
        : 'नमस्ते भाई, खेत का हाल बताएं';
      const utterance = new SpeechSynthesisUtterance(speakString);
      utterance.lang = lang === 'en' ? 'en-IN' : 'hi-IN';
      utterance.onend = () => setAudioPlayingId(null);
      setAudioPlayingId(id);
      window.speechSynthesis.speak(utterance);
    }
  };

  const quickReplies = lang === 'en'
    ? [
        'Hello Brother!',
        'Which fertilizer did you use?',
        'What rate did you get at Mandi?',
        'What is the pesticide dosage?',
        'How is the solar pump running?',
      ]
    : [
        'राम राम भाई जी!',
        'फसल में कौन सी खाद डाली?',
        'मंडी में क्या भाव मिला?',
        'कीटनाशक का क्या नाम है?',
        'सोलर पंप की लागत कितनी आई?',
      ];

  const otherFarmers = allFarmers.filter((f) => f.username !== currentUser.username);
  const filteredFarmers = otherFarmers.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.village.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#0e131d] border-2 border-emerald-500/40 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[640px] sm:h-[680px]">
      {/* Top Banner */}
      <div className="bg-emerald-950/70 px-4 py-2.5 border-b border-emerald-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">💬</span>
          <span className="font-bold text-white text-sm">{t.chatTitle}</span>
          <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
            Live DM
          </span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Conversations & Farmers List */}
        <div
          className={`w-full sm:w-72 md:w-80 border-r border-neutral-800 bg-[#0b0e17] flex flex-col ${
            showMobileList ? 'block' : 'hidden sm:flex'
          }`}
        >
          {/* Search Box */}
          <div className="p-3 border-b border-neutral-800">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'en' ? '🔍 Search farmer or village...' : '🔍 किसान या गाँव खोजें...'}
              className="w-full bg-[#121724] border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Farmers Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/60">
            {filteredFarmers.map((farmer) => {
              const isActive = farmer.username === activePartner.username;
              const isPartnerFollowing = currentUser.following.includes(farmer.username);
              const lastMsg = [...chatMessages]
                .reverse()
                .find(
                  (m) =>
                    (m.senderUsername === currentUser.username && m.receiverUsername === farmer.username) ||
                    (m.senderUsername === farmer.username && m.receiverUsername === currentUser.username)
                );

              return (
                <button
                  key={farmer.id}
                  type="button"
                  onClick={() => {
                    setActivePartnerUsername(farmer.username);
                    setShowMobileList(false);
                  }}
                  className={`w-full text-left p-3 flex items-center gap-3 transition ${
                    isActive ? 'bg-emerald-950/40 border-l-4 border-emerald-500' : 'hover:bg-neutral-900/60'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-2xl">
                      {farmer.avatar}
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0b0e17] rounded-full" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white truncate">{farmer.name}</span>
                      {isPartnerFollowing && (
                        <span className="text-[10px] text-emerald-400 font-medium">{t.following}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 truncate">
                      {lastMsg ? lastMsg.text : `${farmer.village}`}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[10px] text-neutral-500 font-mono">@{farmer.username}</span>
                      <span className="text-[10px] text-neutral-600">•</span>
                      <span className="text-[10px] text-neutral-400 truncate">{farmer.crops[0]}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Area: Active Chat Window */}
        <div
          className={`flex-1 flex flex-col bg-[#090c14] ${
            showMobileList ? 'hidden sm:flex' : 'flex'
          }`}
        >
          {/* Chat Header */}
          <div className="p-3 bg-[#0d121c] border-b border-neutral-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => setShowMobileList(true)}
                className="sm:hidden p-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-neutral-800 border border-emerald-500/50 flex items-center justify-center text-xl">
                  {activePartner.avatar}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0d121c] rounded-full" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs sm:text-sm text-white truncate">
                    {activePartner.name}
                  </span>
                  {activePartner.isVerified && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                      ✓
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-emerald-400/90 truncate">
                  @{activePartner.username} • {activePartner.village}
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onFollowToggle(activePartner.username)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  isFollowing
                    ? 'bg-neutral-800 text-neutral-300 border border-neutral-700 hover:bg-neutral-700'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-sm'
                }`}
              >
                {isFollowing ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                <span>{isFollowing ? t.following : t.follow}</span>
              </button>

              <a
                href="tel:18001801551"
                title={lang === 'en' ? 'Helpline Call' : 'कॉल करें'}
                className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-emerald-400 border border-neutral-700 transition"
              >
                <PhoneCall className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3">
            <div className="text-center my-2">
              <div className="inline-block px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-400">
                🔒 {lang === 'en' ? `You and ${activePartner.name} are connected in chat` : `आप और ${activePartner.name} किसान चैट में जुड़े हैं`}
              </div>
            </div>

            {conversationMessages.length === 0 ? (
              <div className="text-center py-12 text-neutral-500 text-xs">
                {lang === 'en' ? 'No messages yet. Say hello or ask a question below!' : 'कोई पुराना संदेश नहीं है। नीचे से नमस्ते कहें या सवाल पूछें!'}
              </div>
            ) : (
              conversationMessages.map((msg) => {
                const isMe = msg.senderUsername === currentUser.username;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 shadow-md ${
                        isMe
                          ? 'bg-emerald-600 text-white rounded-tr-none'
                          : 'bg-[#161c2b] text-neutral-100 border border-neutral-800 rounded-tl-none'
                      }`}
                    >
                      {/* Advice Card if shared */}
                      {msg.adviceCard && (
                        <div className="mb-2 p-2.5 rounded-xl bg-black/30 border border-white/20 text-xs">
                          <div className="flex items-center justify-between font-bold mb-1">
                            <span className="flex items-center gap-1 text-emerald-300">
                              <Sprout className="w-3.5 h-3.5" />
                              {msg.adviceCard.crop}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500 text-black font-bold">
                              {msg.adviceCard.verdict === 'SHIP IT' ? (lang === 'en' ? 'Recommended' : 'अनुशंसित') : (lang === 'en' ? 'Caution' : 'सावधानी')}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-200 line-clamp-3">
                            {msg.adviceCard.summary}
                          </p>
                        </div>
                      )}

                      {/* Text content */}
                      <p className="text-xs sm:text-sm font-sans whitespace-pre-wrap leading-relaxed">
                        {msg.text}
                      </p>

                      {/* Voice Note audio player button */}
                      {msg.isVoiceNote && (
                        <button
                          type="button"
                          onClick={() => playVoiceNote(msg.id, msg.text)}
                          className="mt-2 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 hover:bg-black/60 text-xs font-bold transition text-emerald-300"
                        >
                          <Volume2 className={`w-3.5 h-3.5 ${audioPlayingId === msg.id ? 'animate-bounce' : ''}`} />
                          <span>
                            {audioPlayingId === msg.id 
                              ? (lang === 'en' ? 'Playing voice note...' : 'आवाज बज रही है...') 
                              : (lang === 'en' ? '▶ Listen Voice Note (0:14s)' : '▶ आवाज सुनें (0:14s)')}
                          </span>
                        </button>
                      )}

                      <div
                        className={`text-[10px] mt-1 text-right ${
                          isMe ? 'text-emerald-200/80' : 'text-neutral-500'
                        }`}
                      >
                        {msg.timestamp} {isMe && '✓✓'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies Chips */}
          <div className="px-3 py-1.5 bg-[#0b0e17] border-t border-neutral-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] text-neutral-500 shrink-0 font-medium">
              {lang === 'en' ? 'Quick:' : 'त्वरित:'}
            </span>
            {quickReplies.map((qr, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setInputText(qr)}
                className="px-2.5 py-1 rounded-full bg-neutral-900 hover:bg-emerald-950 hover:text-emerald-300 border border-neutral-800 text-[11px] text-neutral-300 whitespace-nowrap shrink-0 transition"
              >
                {qr}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-[#0d121c] border-t border-neutral-800 flex items-center gap-2">
            {/* Share Doctor Advice Button */}
            <button
              type="button"
              onClick={handleShareAdvice}
              className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-emerald-400 border border-neutral-700 transition shrink-0"
              title={lang === 'en' ? 'Share your active doctor slip' : 'अपनी डॉक्टर पर्ची शेयर करें'}
            >
              <Sprout className="w-4 h-4" />
            </button>

            {/* Send Voice Note Button */}
            <button
              type="button"
              onClick={handleSendVoiceNote}
              className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-neutral-700 transition shrink-0"
              title={lang === 'en' ? 'Send Voice Note' : 'आवाज संदेश भेजें'}
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={lang === 'en' ? `Message ${activePartner.name}...` : `${activePartner.name} को संदेश लिखें...`}
              className="flex-1 bg-[#080b12] border border-neutral-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
            />

            {/* Send Button */}
            <button
              type="button"
              onClick={handleSend}
              disabled={!inputText.trim()}
              className={`p-2.5 rounded-xl font-bold transition shrink-0 ${
                inputText.trim()
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20'
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
