import React from 'react';
import { FarmerUser, KisanPost } from '../types';
import {
  UserCheck,
  UserPlus,
  MessageCircle,
  PhoneCall,
  MapPin,
  Sprout,
  LogOut,
  Heart,
  Grid,
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/translations';

interface FarmerProfileViewProps {
  farmer: FarmerUser;
  currentUser: FarmerUser;
  allPosts: KisanPost[];
  onFollowToggle: (username: string) => void;
  onOpenChatWith: (username: string) => void;
  onSwitchAccount: () => void;
  onLogout: () => void;
  lang?: Language;
}

export const FarmerProfileView: React.FC<FarmerProfileViewProps> = ({
  farmer,
  currentUser,
  allPosts,
  onFollowToggle,
  onOpenChatWith,
  onSwitchAccount,
  onLogout,
  lang = 'hi',
}) => {
  const t = TRANSLATIONS[lang];
  const isMe = farmer.username === currentUser.username;
  const isFollowing = currentUser.following.includes(farmer.username);

  // Filter posts by this author
  const farmerPosts = allPosts.filter((p) => p.authorUsername === farmer.username);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Profile Header Card */}
      <div className="bg-[#111722] border border-emerald-500/30 rounded-2xl p-4 sm:p-6 shadow-xl text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Avatar and Basic Info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-neutral-800 border-2 border-emerald-500/60 flex items-center justify-center text-4xl shadow-inner">
                {farmer.avatar}
              </div>
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-[#111722] rounded-full" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">{farmer.name}</h2>
                {farmer.isVerified && (
                  <span className="text-[10px] bg-emerald-500 text-black px-1.5 py-0.2 rounded font-bold">
                    ✓ {lang === 'en' ? 'Verified Farmer' : 'सत्यापित किसान'}
                  </span>
                )}
              </div>
              <div className="text-xs text-emerald-400 font-mono">@{farmer.username}</div>
              <div className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>{farmer.village}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isMe ? (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onSwitchAccount}
                  className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs transition"
                >
                  {t.switchAccountBtn}
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-rose-950 hover:text-rose-300 border border-neutral-700 text-neutral-300 text-xs font-bold transition flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t.logoutBtn}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => onFollowToggle(farmer.username)}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    isFollowing
                      ? 'bg-neutral-800 text-neutral-300 border border-neutral-700 hover:bg-neutral-700'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-md'
                  }`}
                >
                  {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  <span>{isFollowing ? t.following : t.follow}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenChatWith(farmer.username)}
                  className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-emerald-400 border border-neutral-700 text-xs font-bold transition flex items-center gap-1"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{lang === 'en' ? 'DM Chat' : 'DM चैट'}</span>
                </button>

                <a
                  href="tel:18001801551"
                  className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-emerald-400 border border-neutral-700 transition"
                  title={lang === 'en' ? 'Call Helpline' : 'कॉल करें'}
                >
                  <PhoneCall className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Bio & Details */}
        <div className="mt-4 pt-4 border-t border-neutral-800/80 space-y-2">
          <p className="text-xs sm:text-sm text-neutral-200 font-sans leading-relaxed">
            {farmer.bio}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] bg-neutral-900 border border-neutral-800 text-neutral-300 px-2.5 py-1 rounded-lg flex items-center gap-1">
              <Sprout className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.landSizeLabel} <strong>{farmer.acres}</strong></span>
            </span>

            {farmer.crops.map((crop, i) => (
              <span
                key={i}
                className="text-[11px] bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 px-2.5 py-1 rounded-lg"
              >
                🌾 {crop}
              </span>
            ))}
          </div>
        </div>

        {/* Counters (Instagram style: Posts, Followers, Following) */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-neutral-800/80 text-center">
          <div className="p-2 rounded-xl bg-neutral-900/60">
            <div className="text-base sm:text-lg font-bold text-white">{farmerPosts.length}</div>
            <div className="text-[11px] text-neutral-400">{t.postsCount}</div>
          </div>
          <div className="p-2 rounded-xl bg-neutral-900/60">
            <div className="text-base sm:text-lg font-bold text-emerald-400">
              {farmer.followers.length}
            </div>
            <div className="text-[11px] text-neutral-400">{t.followersCount}</div>
          </div>
          <div className="p-2 rounded-xl bg-neutral-900/60">
            <div className="text-base sm:text-lg font-bold text-amber-400">
              {farmer.following.length}
            </div>
            <div className="text-[11px] text-neutral-400">{t.followingCount}</div>
          </div>
        </div>
      </div>

      {/* Farmer Posts Grid */}
      <div className="bg-[#111722] border border-neutral-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-2 mb-3 text-xs font-bold text-neutral-300">
          <Grid className="w-4 h-4 text-emerald-400" />
          <span>
            {farmer.name} • {t.myPostsTab} ({farmerPosts.length})
          </span>
        </div>

        {farmerPosts.length === 0 ? (
          <div className="text-center py-10 text-neutral-500 text-xs">
            {t.noPostsYet}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {farmerPosts.map((post) => (
              <div
                key={post.id}
                className="group relative aspect-square rounded-xl overflow-hidden bg-black border border-neutral-800"
              >
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt={post.caption}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3 text-white text-xs font-bold p-2 text-center">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4 fill-white" />
                    <span>{post.likes.length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>{post.comments.length}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
