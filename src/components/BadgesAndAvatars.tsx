import React, { useState } from 'react';
import { KidProfile, AvatarItem, Badge } from '../types';
import { INITIAL_AVATARS } from '../lib/storage';
import { playMilestoneFanfare, playCoinSound } from '../lib/sound';
import { sendKidNotification } from '../lib/notifications';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Award, 
  ShieldCheck, 
  Flame, 
  Coins, 
  Crown, 
  Lock, 
  Check, 
  Sparkles,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface BadgesAndAvatarsProps {
  kid: KidProfile;
  onUpdateKid: (updated: KidProfile) => void;
}

export const BadgesAndAvatars: React.FC<BadgesAndAvatarsProps> = ({
  kid,
  onUpdateKid,
}) => {
  const [activeTab, setActiveTab] = useState<'badges' | 'avatars'>('badges');

  const primaryGoal = kid.goals.find((g) => g.priority === 'primary') || kid.goals[0];
  const goalPercent = primaryGoal
    ? Math.min(100, (primaryGoal.currentSaved / primaryGoal.targetCost) * 100)
    : 0;

  // Calculate unlock status for all avatars dynamically
  const avatarsWithStatus: AvatarItem[] = INITIAL_AVATARS.map((avatar) => {
    let isUnlocked = false;
    if (avatar.unlockType === 'saved_amount') {
      isUnlocked = kid.totalSaved >= avatar.unlockThreshold;
    } else if (avatar.unlockType === 'milestone_percent') {
      isUnlocked = goalPercent >= avatar.unlockThreshold;
    }
    return { ...avatar, isUnlocked };
  });

  const handleEquipAvatar = (avatar: AvatarItem) => {
    if (!avatar.isUnlocked) return;

    onUpdateKid({
      ...kid,
      avatarId: avatar.id,
    });

    playCoinSound();
    confetti({ particleCount: 50, spread: 60 });
    sendKidNotification(
      '✨ Avatar Equipped!',
      `You are now rocking the ${avatar.name} avatar (${avatar.emoji})!`,
      'avatar'
    );
  };

  const getBadgeIcon = (icon: string) => {
    switch (icon) {
      case 'Coins':
        return <Coins className="w-5 h-5 text-amber-500" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-emerald-500" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-orange-500" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'Crown':
        return <Crown className="w-5 h-5 text-indigo-500" />;
      case 'Trophy':
        return <Trophy className="w-5 h-5 text-amber-500" />;
      default:
        return <Award className="w-5 h-5 text-purple-500" />;
    }
  };

  const unlockedBadgeCount = kid.badges.filter((b) => b.unlocked).length;

  return (
    <div id="badges-avatars-section" className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-xs m-0">
      {/* Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span>Trophy Room & Wardrobe</span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
              {unlockedBadgeCount}/{kid.badges.length} Badges Earned
            </span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Earn virtual achievements and unlock exclusive avatars as you save
          </p>
        </div>

        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold self-start sm:self-center">
          <button
            id="tab-badges-btn"
            onClick={() => setActiveTab('badges')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'badges'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Virtual Badges</span>
          </button>
          <button
            id="tab-avatars-btn"
            onClick={() => setActiveTab('avatars')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'avatars'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Unlockable Avatars</span>
          </button>
        </div>
      </div>

      {/* Badges Tab */}
      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
          {kid.badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border transition-all ${
                badge.unlocked
                  ? 'bg-gradient-to-b from-amber-50/60 to-white dark:from-amber-950/20 dark:to-slate-800/40 border-amber-200/80 dark:border-amber-800/50 shadow-xs'
                  : 'bg-slate-50/60 dark:bg-slate-800/20 border-slate-200/60 dark:border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    badge.unlocked
                      ? 'bg-amber-100 dark:bg-amber-900/50 shadow-xs'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                  }`}
                >
                  {badge.unlocked ? (
                    getBadgeIcon(badge.icon)
                  ) : (
                    <Lock className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-950/80 px-2 py-0.5 rounded-md">
                  +{badge.xpValue} XP
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <span>{badge.title}</span>
                {badge.unlocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {badge.description}
              </p>
              {badge.unlockedAt && (
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-2">
                  Unlocked on {badge.unlockedAt}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Avatars Tab */}
      {activeTab === 'avatars' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-5">
          {avatarsWithStatus.map((avatar) => {
            const isEquipped = kid.avatarId === avatar.id;
            return (
              <div
                key={avatar.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isEquipped
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20 shadow-md'
                    : avatar.isUnlocked
                    ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-indigo-300'
                    : 'border-slate-200/50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-3xl shadow-xs">
                      {avatar.emoji}
                    </div>

                    {isEquipped ? (
                      <span className="text-[11px] font-black bg-indigo-600 text-white px-2.5 py-1 rounded-xl shadow-xs flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" /> Equipped
                      </span>
                    ) : avatar.isUnlocked ? (
                      <button
                        onClick={() => handleEquipAvatar(avatar)}
                        className="text-xs font-bold bg-slate-100 hover:bg-indigo-50 dark:bg-slate-700 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-xl transition-colors cursor-pointer"
                      >
                        Equip
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    {avatar.name}
                  </h4>
                  <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    {avatar.role}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {avatar.flavorText}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-[11px]">
                  {avatar.isUnlocked ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Unlocked & Ready
                    </span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">
                      Requires:{' '}
                      {avatar.unlockType === 'saved_amount'
                        ? `$${avatar.unlockThreshold} total saved`
                        : `${avatar.unlockThreshold}% goal completed`}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
