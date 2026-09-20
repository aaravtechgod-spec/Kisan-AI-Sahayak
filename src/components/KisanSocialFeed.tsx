import React, { useState } from 'react';
import { FarmerUser, KisanPost, KisanStory } from '../types';
import {
  Heart,
  MessageCircle,
  Share2,
  UserPlus,
  UserCheck,
  Send,
  PlusCircle,
  X,
  Sparkles,
  Check,
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/translations';

interface KisanSocialFeedProps {
  currentUser: FarmerUser;
  allFarmers: FarmerUser[];
  posts: KisanPost[];
  stories: KisanStory[];
  onFollowToggle: (targetUsername: string) => void;
  onLikeToggle: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onCreatePost: (post: Omit<KisanPost, 'id' | 'timestamp' | 'likes' | 'comments'>) => void;
  onOpenChatWith: (username: string) => void;
  onOpenProfile: (username: string) => void;
  lang?: Language;
}

export const KisanSocialFeed: React.FC<KisanSocialFeedProps> = ({
  currentUser,
  posts,
  stories,
  onFollowToggle,
  onLikeToggle,
  onAddComment,
  onCreatePost,
  onOpenChatWith,
  onOpenProfile,
  lang = 'hi',
}) => {
  const [activeStory, setActiveStory] = useState<KisanStory | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  const t = TRANSLATIONS[lang];

  // New post form state
  const [newCaption, setNewCaption] = useState('');
  const [newCropTag, setNewCropTag] = useState(lang === 'en' ? 'Wheat (PBW 550)' : 'गेहूं (Wheat)');
  const [selectedPhotoPreset, setSelectedPhotoPreset] = useState(
    'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&auto=format&fit=crop&q=80'
  );

  const photoPresets = [
    {
      label: lang === 'en' ? 'Lush Wheat' : 'लहलहाता गेहूं',
      url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&auto=format&fit=crop&q=80',
    },
    {
      label: lang === 'en' ? 'Cotton Field' : 'कपास का खेत',
      url: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800&auto=format&fit=crop&q=80',
    },
    {
      label: lang === 'en' ? 'Fresh Veggies' : 'ताजा सब्जियां',
      url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
    },
    {
      label: lang === 'en' ? 'Mustard Bloom' : 'पीली सरसों',
      url: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=800&auto=format&fit=crop&q=80',
    },
    {
      label: lang === 'en' ? 'Solar Pump' : 'सोलर पंप / ड्रिप',
      url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80',
    },
  ];

  const handleCreatePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaption.trim()) return;

    onCreatePost({
      authorId: currentUser.id,
      authorUsername: currentUser.username,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      authorVillage: currentUser.village,
      imageUrl: selectedPhotoPreset,
      caption: newCaption.trim(),
      cropTag: newCropTag,
    });

    setNewCaption('');
    setShowCreateModal(false);
  };

  const handleCommentSubmit = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    onAddComment(postId, text);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  const handleSharePost = (post: KisanPost) => {
    const shareText = `🌾 ${t.appName} Post: ${post.authorName} (@${post.authorUsername})\n"${post.caption}"\nCrop: ${post.cropTag}`;
    navigator.clipboard.writeText(shareText);
    setCopiedPostId(post.id);
    setTimeout(() => setCopiedPostId(null), 2500);
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Top Stories Tray (Instagram Style for Farmers) */}
      <div className="bg-[#111722] border border-emerald-500/30 rounded-2xl p-3 sm:p-4 shadow-xl">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <span className="text-sm">📸</span>
            <span>{t.farmerStories}</span>
          </span>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{t.createPostBtn}</span>
          </button>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-1 no-scrollbar">
          {/* User's own add story avatar */}
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex flex-col items-center gap-1 shrink-0 group"
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-neutral-800 border-2 border-dashed border-emerald-500/60 flex items-center justify-center text-2xl group-hover:scale-105 transition">
                {currentUser.avatar}
              </div>
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 text-black font-bold text-xs flex items-center justify-center border-2 border-[#111722]">
                +
              </span>
            </div>
            <span className="text-[11px] text-neutral-300 font-medium truncate max-w-[64px]">
              {lang === 'en' ? 'My Story' : 'मेरी स्टोरी'}
            </span>
          </button>

          {/* Other Farmers' Stories */}
          {stories.map((story) => (
            <button
              key={story.id}
              type="button"
              onClick={() => setActiveStory(story)}
              className="flex flex-col items-center gap-1 shrink-0 group"
            >
              <div className="p-0.5 rounded-full bg-gradient-to-tr from-emerald-500 via-amber-400 to-rose-500 group-hover:scale-105 transition">
                <div className="w-13 h-13 rounded-full bg-[#111722] p-0.5 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-neutral-800 flex items-center justify-center text-2xl">
                    {story.authorAvatar}
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-white font-medium truncate max-w-[68px]">
                {story.authorName.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => {
          const isLiked = post.likes.includes(currentUser.username);
          const isFollowing = currentUser.following.includes(post.authorUsername);
          const isMe = post.authorUsername === currentUser.username;

          return (
            <article
              key={post.id}
              className="bg-[#111722] border border-neutral-800/90 rounded-2xl overflow-hidden shadow-xl"
            >
              {/* Post Header */}
              <div className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => onOpenProfile(post.authorUsername)}
                    className="w-11 h-11 rounded-full bg-neutral-800 border border-emerald-500/40 flex items-center justify-center text-2xl shrink-0 hover:opacity-90 transition"
                  >
                    {post.authorAvatar}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onOpenProfile(post.authorUsername)}
                        className="font-bold text-xs sm:text-sm text-white hover:text-emerald-300 truncate"
                      >
                        {post.authorName}
                      </button>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        @{post.authorUsername}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400 truncate">
                      {post.authorVillage} • {post.timestamp}
                    </div>
                  </div>
                </div>

                {/* Follow Button & DM Button */}
                <div className="flex items-center gap-2 shrink-0">
                  {!isMe && (
                    <button
                      type="button"
                      onClick={() => onFollowToggle(post.authorUsername)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                        isFollowing
                          ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-sm'
                      }`}
                    >
                      {isFollowing ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                      <span>{isFollowing ? t.following : `+ ${t.follow}`}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onOpenChatWith(post.authorUsername)}
                    className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-emerald-400 border border-neutral-700 transition"
                    title={t.directMessage}
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Crop Tag Badge */}
              <div className="px-3.5 pb-2">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                  🌾 {post.cropTag}
                </span>
              </div>

              {/* Post Image */}
              {post.imageUrl && (
                <div className="relative aspect-[4/3] sm:aspect-[16/10] bg-black overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt={post.caption}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Post Action Buttons */}
              <div className="p-3.5">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-4">
                    {/* Heart Like */}
                    <button
                      type="button"
                      onClick={() => onLikeToggle(post.id)}
                      className={`flex items-center gap-1.5 text-xs font-bold transition ${
                        isLiked ? 'text-rose-500 scale-105' : 'text-neutral-300 hover:text-rose-400'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-500' : ''}`} />
                      <span>{post.likes.length}</span>
                    </button>

                    {/* Comment toggle */}
                    <button
                      type="button"
                      onClick={() =>
                        setActiveCommentPostId(
                          activeCommentPostId === post.id ? null : post.id
                        )
                      }
                      className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 hover:text-white transition"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>{post.comments.length}</span>
                    </button>

                    {/* Share Post */}
                    <button
                      type="button"
                      onClick={() => handleSharePost(post)}
                      className="flex items-center gap-1 text-xs font-bold text-neutral-300 hover:text-emerald-400 transition"
                      title={t.share}
                    >
                      {copiedPostId === post.id ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400 text-[11px]">{t.copied}</span>
                        </>
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenChatWith(post.authorUsername)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                  >
                    <span>{t.directMessage}</span>
                    <span>➔</span>
                  </button>
                </div>

                {/* Caption */}
                <p className="text-xs sm:text-sm text-neutral-100 font-sans leading-relaxed">
                  <strong className="text-emerald-300 mr-1.5 font-bold">
                    {post.authorName}:
                  </strong>
                  {post.caption}
                </p>

                {/* Comments Section */}
                {post.comments.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-neutral-800/80 space-y-2">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="text-xs flex items-start gap-2">
                        <span className="text-base shrink-0">{comment.authorAvatar}</span>
                        <div>
                          <span className="font-bold text-neutral-200 mr-1.5">
                            {comment.authorName}:
                          </span>
                          <span className="text-neutral-300">{comment.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Comment Input */}
                <div className="mt-3 pt-2 border-t border-neutral-800/60 flex items-center gap-2">
                  <span className="text-base shrink-0">{currentUser.avatar}</span>
                  <input
                    type="text"
                    value={commentInputs[post.id] || ''}
                    onChange={(e) =>
                      setCommentInputs((prev) => ({
                        ...prev,
                        [post.id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCommentSubmit(post.id);
                      }
                    }}
                    placeholder={t.addCommentPlaceholder}
                    className="flex-1 bg-[#090d14] border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleCommentSubmit(post.id)}
                    className="p-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Story Full Screen Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl border border-neutral-700">
            {/* Story Top Bar */}
            <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{activeStory.authorAvatar}</span>
                <div>
                  <div className="text-xs font-bold text-white">{activeStory.authorName}</div>
                  <div className="text-[10px] text-neutral-300">
                    @{activeStory.authorUsername} • {activeStory.timestamp}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveStory(null)}
                className="p-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Story Image */}
            <div className="aspect-[9/16] bg-black">
              <img
                src={activeStory.imageUrl}
                alt={activeStory.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Story Bottom Caption & Reply */}
            <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-black mb-2">
                🌾 {activeStory.crop}
              </span>
              <p className="text-sm font-bold text-white mb-3">{activeStory.title}</p>
              <button
                type="button"
                onClick={() => {
                  const targetUser = activeStory.authorUsername;
                  setActiveStory(null);
                  onOpenChatWith(targetUser);
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg transition flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{lang === 'en' ? 'Reply to Farmer in DM' : 'किसान को DM में जवाब दें'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#111722] border-2 border-emerald-500/50 rounded-2xl p-5 shadow-2xl text-white">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-2xl">
                📸
              </div>
              <div>
                <h3 className="text-base font-bold">{t.newPostModalTitle}</h3>
                <p className="text-xs text-neutral-400">
                  {t.socialSubtitle}
                </p>
              </div>
            </div>

            <form onSubmit={handleCreatePostSubmit} className="space-y-4">
              {/* Photo Preset Selector */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-2">
                  {t.selectPhotoPreset}
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {photoPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedPhotoPreset(preset.url)}
                      className={`relative rounded-xl overflow-hidden aspect-square border-2 transition ${
                        selectedPhotoPreset === preset.url
                          ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                          : 'border-neutral-700 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-white p-0.5 truncate text-center">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Crop Tag */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  {t.cropTagLabel}
                </label>
                <input
                  type="text"
                  value={newCropTag}
                  onChange={(e) => setNewCropTag(e.target.value)}
                  placeholder={lang === 'en' ? 'e.g. Wheat, Basmati Rice, Cotton...' : 'उदा. गेहूं, बासमती धान, कपास...'}
                  className="w-full bg-[#0a0d14] border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Caption */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  {t.captionLabel}
                </label>
                <textarea
                  rows={3}
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder={t.captionPlaceholder}
                  className="w-full bg-[#0a0d14] border border-neutral-700 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={!newCaption.trim()}
                className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 ${
                  newCaption.trim()
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20'
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{t.publishPostBtn}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
