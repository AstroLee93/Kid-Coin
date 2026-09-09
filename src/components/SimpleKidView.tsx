import React, { useState } from 'react';
import { KidProfile, SavingsGoal, Chore, Transaction } from '../types';
import { ThemeOption } from '../lib/theme';
import { playCoinSound, playMilestoneFanfare, playVictorySound } from '../lib/sound';
import { INITIAL_AVATARS } from '../lib/storage';
import { sendKidNotification } from '../lib/notifications';
import { ChoreQuestSyncModal } from './ChoreQuestSyncModal';
import { GoalIcon, BadgeIcon, ChoreIcon } from './IconRenderer';
import { 
  Plus, 
  Minus, 
  Sparkles, 
  Flame, 
  Trophy, 
  Target, 
  Coins, 
  CheckCircle2, 
  ShoppingBag, 
  ArrowRight,
  SlidersHorizontal,
  PartyPopper,
  Calendar,
  Gift
} from 'lucide-react';

interface SimpleKidViewProps {
  kid: KidProfile;
  themeConfig: ThemeOption;
  onUpdateKid: (updated: KidProfile) => void;
  onSwitchToAdvanced: () => void;
  onOpenNewGoalModal: () => void;
}

export const SimpleKidView: React.FC<SimpleKidViewProps> = ({
  kid,
  themeConfig,
  onUpdateKid,
  onSwitchToAdvanced,
  onOpenNewGoalModal,
}) => {
  const [selectedGoalId, setSelectedGoalId] = useState<string>(
    kid.goals[0]?.id || ''
  );
  const [customDepositOpen, setCustomDepositOpen] = useState(false);
  const [customDepositAmount, setCustomDepositAmount] = useState('');
  const [customDepositReason, setCustomDepositReason] = useState('Piggy Bank Deposit');

  const [spendModalOpen, setSpendModalOpen] = useState(false);
  const [spendAmount, setSpendAmount] = useState('');
  const [spendReason, setSpendReason] = useState('');

  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [celebrationMsg, setCelebrationMsg] = useState<string | null>(null);

  const [addChoreOpen, setAddChoreOpen] = useState(false);
  const [choreQuestModalOpen, setChoreQuestModalOpen] = useState(false);
  const [newChoreTitle, setNewChoreTitle] = useState('');
  const [newChoreReward, setNewChoreReward] = useState('3.00');

  // Active goal fallback
  const activeGoal =
    kid.goals.find((g) => g.id === selectedGoalId) || kid.goals[0];

  const currentAvatar =
    INITIAL_AVATARS.find((a) => a.id === kid.avatarId) || INITIAL_AVATARS[0];

  // Calculations for active goal
  const savedAmount = activeGoal ? activeGoal.currentSaved : kid.totalSaved;
  const targetAmount = activeGoal ? activeGoal.targetCost : 100;
  const remaining = Math.max(0, targetAmount - savedAmount);
  const progressPercent = Math.min(
    100,
    Math.round((savedAmount / targetAmount) * 100)
  );

  // Quick Deposit Handler
  const handleQuickDeposit = (amount: number, reason: string = 'Savings Deposit') => {
    playCoinSound();

    const newSaved = kid.totalSaved + amount;
    const newCash = kid.availableCash + amount;
    const newXP = kid.xp + Math.round(amount * 3);
    const newLevel = Math.max(kid.level, Math.floor(newXP / 100) + 1);

    // Update goals
    let updatedGoals = [...kid.goals];
    if (activeGoal) {
      const updatedGoalSaved = activeGoal.currentSaved + amount;
      const reachedGoal = updatedGoalSaved >= activeGoal.targetCost;

      // Check milestones
      const updatedMilestones = activeGoal.milestones.map((m) => {
        const threshold = (m.percent / 100) * activeGoal.targetCost;
        if (!m.reached && updatedGoalSaved >= threshold) {
          playMilestoneFanfare();
          sendKidNotification(
            kid.name,
            `🎯 ${m.percent}% Milestone reached for ${activeGoal.title}! +${m.rewardXP} XP`,
            'milestone'
          );
          return { ...m, reached: true, reachedAt: new Date().toISOString() };
        }
        return m;
      });

      if (reachedGoal && activeGoal.currentSaved < activeGoal.targetCost) {
        playVictorySound();
        setCelebrationMsg(`🎉 YOU HIT 100% OF YOUR GOAL FOR ${activeGoal.title.toUpperCase()}!`);
      } else {
        setCelebrationMsg(`+$${amount.toFixed(2)} added to ${activeGoal.title}! 🚀`);
      }
      setTimeout(() => setCelebrationMsg(null), 4000);

      updatedGoals = updatedGoals.map((g) =>
        g.id === activeGoal.id
          ? { ...g, currentSaved: updatedGoalSaved, milestones: updatedMilestones }
          : g
      );
    }

    // New transaction
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      kidId: kid.id,
      type: 'deposit',
      amount,
      category: 'allowance',
      description: reason,
      date: new Date().toISOString(),
      goalContribution: activeGoal?.id,
    };

    onUpdateKid({
      ...kid,
      totalSaved: newSaved,
      availableCash: newCash,
      xp: newXP,
      level: newLevel,
      goals: updatedGoals,
      transactions: [newTx, ...kid.transactions],
    });
  };

  // Spend Handler
  const handleSpend = (amount: number, reason: string) => {
    if (amount <= 0) return;
    if (amount > kid.totalSaved) {
      alert(`You only have $${kid.totalSaved.toFixed(2)} saved!`);
      return;
    }

    const newSaved = Math.max(0, kid.totalSaved - amount);
    let updatedGoals = [...kid.goals];
    if (activeGoal) {
      updatedGoals = updatedGoals.map((g) =>
        g.id === activeGoal.id
          ? { ...g, currentSaved: Math.max(0, g.currentSaved - amount) }
          : g
      );
    }

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      kidId: kid.id,
      type: 'withdrawal',
      amount,
      category: 'snack',
      description: reason || 'Pocket Money Spent',
      date: new Date().toISOString(),
    };

    onUpdateKid({
      ...kid,
      totalSaved: newSaved,
      goals: updatedGoals,
      transactions: [newTx, ...kid.transactions],
    });

    setSpendModalOpen(false);
    setSpendAmount('');
    setSpendReason('');
  };

  // Complete Chore Handler
  const handleCompleteChore = (chore: Chore) => {
    playCoinSound();
    const updatedChores = kid.chores.map((c) =>
      c.id === chore.id ? { ...c, completed: true } : c
    );

    handleQuickDeposit(chore.rewardAmount, `Completed Chore: ${chore.title}`);
    sendKidNotification(
      kid.name,
      `🌟 Chore finished: ${chore.title}! Earned +$${chore.rewardAmount.toFixed(2)}`,
      'chore'
    );

    onUpdateKid({
      ...kid,
      chores: updatedChores,
    });
  };

  // Add Chore Handler
  const handleAddChore = () => {
    if (!newChoreTitle.trim()) return;
    const reward = parseFloat(newChoreReward) || 2.0;

    const newChore: Chore = {
      id: `chore_${Date.now()}`,
      kidId: kid.id,
      title: newChoreTitle.trim(),
      rewardAmount: reward,
      category: 'cleaning',
      icon: '🧹',
      completed: false,
      isRepeatingWeekly: true,
    };

    onUpdateKid({
      ...kid,
      chores: [newChore, ...kid.chores],
    });

    setNewChoreTitle('');
    setAddChoreOpen(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Friendly Celebration Toast */}
      {celebrationMsg && (
        <div className="w-full p-4 rounded-2xl bg-amber-400 text-amber-950 font-black text-center shadow-lg border-2 border-amber-300 flex items-center justify-center gap-2 animate-bounce">
          <PartyPopper className="w-6 h-6 animate-spin" />
          <span className="text-base sm:text-lg">{celebrationMsg}</span>
        </div>
      )}

      {/* Top Kid Welcome Banner */}
      <div className={`${themeConfig.cardClass} rounded-3xl p-5 sm:p-6 border ${themeConfig.cardBorderClass} shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors`}>
        <div className="flex items-center gap-4 text-center sm:text-left">
          {/* Avatar button */}
          <button
            onClick={() => setAvatarPickerOpen(true)}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-50 dark:bg-slate-800 border-2 flex items-center justify-center text-4xl shadow-sm hover:scale-105 transition-transform cursor-pointer relative group"
            style={{ borderColor: themeConfig.primaryColor }}
            title="Tap to change avatar"
          >
            {currentAvatar.emoji}
            <span 
              className="absolute -bottom-1 -right-1 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-xs"
              style={{ backgroundColor: themeConfig.primaryColor }}
            >
              Lvl {kid.level}
            </span>
          </button>

          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Hey, {kid.name}!
              </h1>
              <span className="text-xl">👋</span>
            </div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              Welcome to your personal piggy bank vault.
            </p>
          </div>
        </div>

        {/* Level & Streak Stats */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/80 rounded-2xl">
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">Streak</div>
              <div className="text-sm font-black text-orange-800 dark:text-orange-200">{kid.savingsStreakDays} Days</div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 rounded-2xl">
            <Trophy className="w-5 h-5 text-indigo-500" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Total Saved</div>
              <div className="text-sm font-black text-indigo-800 dark:text-indigo-200">${kid.totalSaved.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 🎯 MAIN GOAL SHOWCASE (Big, Visual, Satisfying) */}
      {activeGoal ? (
        <div className={`${themeConfig.cardClass} rounded-3xl p-6 sm:p-8 border ${themeConfig.cardBorderClass} shadow-md relative overflow-hidden transition-colors`}>
          {/* Top Goal Header & Goal Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 min-w-0">
              <div 
                className="w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-xs"
                style={{
                  backgroundColor: themeConfig.cssVars.softLight,
                  borderColor: themeConfig.primaryColor,
                }}
              >
                <GoalIcon icon={activeGoal.icon} className="w-6 h-6" style={{ color: themeConfig.primaryColor }} />
              </div>
              <div className="min-w-0">
                <span 
                  className="text-xs font-bold uppercase tracking-wider block"
                  style={{ color: themeConfig.primaryColor }}
                >
                  Current Target Goal
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate">
                  {activeGoal.title}
                </h2>
              </div>
            </div>

            {/* Switch Goal pills if multiple goals exist */}
            {kid.goals.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0">
                {kid.goals.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGoalId(g.id)}
                    className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                      g.id === activeGoal.id
                        ? 'text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                    style={{
                      backgroundColor: g.id === activeGoal.id ? themeConfig.primaryColor : undefined,
                    }}
                  >
                    <GoalIcon icon={g.icon} className="w-3.5 h-3.5 shrink-0" />
                    <span>{g.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Big Progress Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6 text-center">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase">You Have Saved</div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                ${savedAmount.toFixed(2)}
              </div>
            </div>

            <div 
              className="p-4 rounded-2xl border"
              style={{
                backgroundColor: themeConfig.cssVars.softLight,
                borderColor: themeConfig.cssVars.lightBorder,
              }}
            >
              <div 
                className="text-xs font-bold uppercase"
                style={{ color: themeConfig.cssVars.textLight }}
              >
                Need Left To Buy
              </div>
              <div 
                className="text-3xl sm:text-4xl font-black mt-1"
                style={{ color: themeConfig.primaryColor }}
              >
                ${remaining.toFixed(2)}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Target Cost</div>
              <div className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white mt-1">
                ${targetAmount.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Big satisfying Progress Bar */}
          <div className="space-y-2 mb-8">
            <div className="flex items-center justify-between text-sm font-black">
              <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" style={{ color: themeConfig.primaryColor }} />
                <span>{progressPercent}% of the way there!</span>
              </span>
              <span className="font-extrabold" style={{ color: themeConfig.primaryColor }}>
                {progressPercent >= 100 ? '🎉 READY TO BUY!' : `$${remaining.toFixed(2)} to go`}
              </span>
            </div>

            {/* High-visibility animated progress track */}
            <div className="h-6 sm:h-7 w-full bg-slate-100 dark:bg-slate-800 rounded-full p-1 border border-slate-200 dark:border-slate-700 overflow-hidden relative shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-2 font-bold text-xs text-white shadow-md ${
                  progressPercent >= 100
                    ? 'bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600 animate-pulse'
                    : `bg-gradient-to-r ${themeConfig.progressBarGradient}`
                }`}
                style={{ width: `${Math.max(8, progressPercent)}%` }}
              >
                <span className="drop-shadow-sm font-black">{progressPercent}%</span>
              </div>
            </div>

            {/* Milestone indicators */}
            <div className="grid grid-cols-4 text-center text-xs font-bold pt-1 text-slate-600 dark:text-slate-400">
              <span className={progressPercent >= 25 ? 'text-emerald-700 dark:text-emerald-400 font-extrabold' : ''}>25% Start 🥉</span>
              <span className={progressPercent >= 50 ? 'text-emerald-700 dark:text-emerald-400 font-extrabold' : ''}>50% Halfway 🥈</span>
              <span className={progressPercent >= 75 ? 'text-emerald-700 dark:text-emerald-400 font-extrabold' : ''}>75% Close 🥇</span>
              <span className={progressPercent >= 100 ? 'text-emerald-700 dark:text-emerald-400 font-extrabold' : ''}>100% Prize 🏆</span>
            </div>
          </div>

          {/* Quick Piggy Deposit Buttons (Big 48px Touch Targets) */}
          <div className="pt-2">
            <div className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 text-center sm:text-left flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-500" />
              <span>Feed The Piggy Bank (1-Tap Deposit):</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <button
                onClick={() => handleQuickDeposit(1, 'Pocket Change')}
                className="h-14 rounded-2xl bg-emerald-50 hover:bg-emerald-100 active:scale-95 border-2 border-emerald-300 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-black text-lg flex flex-col items-center justify-center transition-all cursor-pointer shadow-xs"
              >
                <span>+$1</span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Coins</span>
              </button>

              <button
                onClick={() => handleQuickDeposit(5, 'Allowance / Help')}
                className="h-14 rounded-2xl bg-emerald-100 hover:bg-emerald-200 active:scale-95 border-2 border-emerald-400 dark:bg-emerald-950/70 dark:hover:bg-emerald-900/80 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-black text-lg flex flex-col items-center justify-center transition-all cursor-pointer shadow-xs"
              >
                <span>+$5</span>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">Allowance</span>
              </button>

              <button
                onClick={() => handleQuickDeposit(10, 'Great Work')}
                className="h-14 rounded-2xl bg-amber-50 hover:bg-amber-100 active:scale-95 border-2 border-amber-300 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 dark:border-amber-800 text-amber-900 dark:text-amber-200 font-black text-lg flex flex-col items-center justify-center transition-all cursor-pointer shadow-xs"
              >
                <span>+$10</span>
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">Big Chore</span>
              </button>

              <button
                onClick={() => handleQuickDeposit(20, 'Birthday / Gift')}
                className="h-14 rounded-2xl bg-indigo-50 hover:bg-indigo-100 active:scale-95 border-2 border-indigo-300 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 font-black text-lg flex flex-col items-center justify-center transition-all cursor-pointer shadow-xs"
              >
                <span>+$20</span>
                <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300">Gift</span>
              </button>

              <button
                onClick={() => setCustomDepositOpen(true)}
                className="col-span-2 sm:col-span-1 h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 border-2 border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 text-slate-800 dark:text-white font-black text-sm flex flex-col items-center justify-center transition-all cursor-pointer"
              >
                <span>+ Custom</span>
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Other $</span>
              </button>
            </div>

            {/* Quick Spend / Take Out Button */}
            <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSpendModalOpen(true)}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Spend some money (Bought snack/toy)</span>
              </button>

              <button
                onClick={onOpenNewGoalModal}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
              >
                <Target className="w-3.5 h-3.5" />
                <span>+ Create New Goal</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center border border-slate-200 dark:border-slate-800">
          <Target className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h3 className="text-xl font-black text-slate-900 dark:text-white">No Savings Goal Yet!</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Pick something fun you want to save for, like a game, bicycle, or LEGO set!
          </p>
          <button
            onClick={onOpenNewGoalModal}
            className="px-6 py-3 rounded-2xl bg-amber-500 text-white font-black text-sm shadow-md hover:bg-amber-600 cursor-pointer"
          >
            + Set Your First Goal
          </button>
        </div>
      )}

      {/* 🧹 WAYS TO EARN (Kids Chore Bounty Cards) */}
      <div className={`${themeConfig.cardClass} rounded-3xl p-6 border ${themeConfig.cardBorderClass} shadow-sm transition-colors`}>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>🧹 Earn Cash With Chores</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-bold">
                {kid.chores.filter((c) => !c.completed).length} Available
              </span>
            </h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Tap when finished to instantly add money to your savings!
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="chorequest-sync-btn-simple"
              onClick={() => setChoreQuestModalOpen(true)}
              className="text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-3 py-1.5 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="Sync with AstroLee93/Chore-Quest Portainer stack on your Raspberry Pi"
            >
              <span>⚔️</span>
              <span>Chore-Quest</span>
            </button>

            <button
              onClick={() => setAddChoreOpen(true)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1 border"
              style={{
                backgroundColor: themeConfig.cssVars.softLight,
                borderColor: themeConfig.cssVars.lightBorder,
                color: themeConfig.primaryColor,
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Chore</span>
            </button>
          </div>
        </div>

        {/* Chores Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {kid.chores.map((chore) => (
            <div
              key={chore.id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                chore.completed
                  ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                  : 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
                  <ChoreIcon icon={chore.icon} category={chore.category} className="w-5 h-5" />
                </div>
                <div>
                  <h4 className={`text-sm font-bold ${chore.completed ? 'line-through text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                    {chore.title}
                  </h4>
                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                      +${chore.rewardAmount.toFixed(2)} reward
                    </span>
                    {chore.source === 'chore-quest' && (
                      <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        <span>⚔️</span>
                        <span>{chore.choreQuestPoints || Math.round(chore.rewardAmount * 10)} pts</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {chore.completed ? (
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Done!</span>
                </div>
              ) : (
                <button
                  onClick={() => handleCompleteChore(chore)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-xs shadow-xs transition-all cursor-pointer whitespace-nowrap"
                >
                  I Did This! 🎉
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 🏆 TROPHIES & LEVEL (Kid Badges) */}
      <div className={`${themeConfig.cardClass} rounded-3xl p-6 border ${themeConfig.cardBorderClass} shadow-sm transition-colors`}>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-5 h-5" style={{ color: themeConfig.primaryColor }} />
              <span>Trophy Room & Badges</span>
            </h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Level {kid.level} Saver • {kid.xp} Total XP earned
            </p>
          </div>

          <button
            onClick={() => setAvatarPickerOpen(true)}
            className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Change Avatar {currentAvatar.emoji}
          </button>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {kid.badges.slice(0, 4).map((badge) => (
            <div
              key={badge.id}
              className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                badge.unlocked
                  ? 'border-amber-200 dark:border-amber-800'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-50'
              }`}
              style={{
                backgroundColor: badge.unlocked ? themeConfig.cssVars.softLight : undefined,
              }}
            >
              <div 
                className="w-12 h-12 rounded-2xl border flex items-center justify-center mb-1 shrink-0 shadow-xs"
                style={{
                  backgroundColor: themeConfig.cssVars.softLight,
                  borderColor: themeConfig.cssVars.lightBorder,
                }}
              >
                <BadgeIcon icon={badge.icon} className="w-6 h-6" />
              </div>
              <div className="text-xs font-black text-slate-900 dark:text-white">{badge.title}</div>
              <div className="text-[10px] text-slate-600 dark:text-slate-400 line-clamp-2">
                {badge.description}
              </div>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                  badge.unlocked
                    ? 'text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
                }`}
                style={{
                  backgroundColor: badge.unlocked ? themeConfig.primaryColor : undefined,
                }}
              >
                {badge.unlocked ? 'Unlocked ✨' : 'Locked 🔒'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 📖 RECENT MONEY DIARY (Simple Kid-Friendly Log) */}
      <div className={`${themeConfig.cardClass} rounded-3xl p-6 border ${themeConfig.cardBorderClass} shadow-sm transition-colors`}>
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3">
          Recent Activity
        </h3>

        <div className="space-y-2">
          {kid.transactions.slice(0, 4).map((tx) => (
            <div
              key={tx.id}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">
                  {tx.type === 'deposit' ? '🪙' : '🛍️'}
                </span>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {tx.description}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">
                    {new Date(tx.date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              <div
                className={`text-sm font-black ${
                  tx.type === 'deposit'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SWITCH TO ADVANCED MODE BANNER (Clean & Easy for parents or curious kids) */}
      <div className="p-5 rounded-3xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-1.5">
            <SlidersHorizontal className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Need graphs, full transaction tables, or parent tools?</span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            You can switch to Advanced Mode at any time.
          </p>
        </div>

        <button
          onClick={onSwitchToAdvanced}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <span>Switch to Advanced Mode</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* MODAL: Custom Deposit */}
      {customDepositOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3">
              Add Money to Piggy Bank
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Amount ($)</label>
                <input
                  type="number"
                  step="0.50"
                  min="0.50"
                  value={customDepositAmount}
                  onChange={(e) => setCustomDepositAmount(e.target.value)}
                  placeholder="e.g. 7.50"
                  className="w-full mt-1 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-black text-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Where did it come from?</label>
                <input
                  type="text"
                  value={customDepositReason}
                  onChange={(e) => setCustomDepositReason(e.target.value)}
                  placeholder="e.g. Birthday card, lemonade stand"
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setCustomDepositOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const amt = parseFloat(customDepositAmount);
                    if (amt > 0) {
                      handleQuickDeposit(amt, customDepositReason || 'Deposit');
                      setCustomDepositOpen(false);
                      setCustomDepositAmount('');
                    }
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs cursor-pointer"
                >
                  Deposit Money
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Spend Money */}
      {spendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
              Spend Money
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Available savings: ${kid.totalSaved.toFixed(2)}
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Amount to Spend ($)</label>
                <input
                  type="number"
                  step="0.50"
                  min="0.50"
                  value={spendAmount}
                  onChange={(e) => setSpendAmount(e.target.value)}
                  placeholder="e.g. 3.00"
                  className="w-full mt-1 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-black text-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">What did you buy?</label>
                <input
                  type="text"
                  value={spendReason}
                  onChange={(e) => setSpendReason(e.target.value)}
                  placeholder="e.g. Ice cream, trading cards"
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setSpendModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const amt = parseFloat(spendAmount);
                    if (amt > 0) {
                      handleSpend(amt, spendReason);
                    }
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs cursor-pointer"
                >
                  Confirm Spend
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Avatar Picker */}
      {avatarPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
              Choose Your Avatar
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Select your character for your savings vault!
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-72 overflow-y-auto p-1">
              {INITIAL_AVATARS.map((avatar) => {
                const isSelected = avatar.id === kid.avatarId;
                return (
                  <button
                    key={avatar.id}
                    onClick={() => {
                      onUpdateKid({ ...kid, avatarId: avatar.id });
                      setAvatarPickerOpen(false);
                    }}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 scale-105 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-3xl">{avatar.emoji}</span>
                    <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 truncate w-full text-center">
                      {avatar.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setAvatarPickerOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add Chore */}
      {addChoreOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
              Add New Chore Quest
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Set a chore task and the dollar reward for completing it.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Chore Name</label>
                <input
                  type="text"
                  value={newChoreTitle}
                  onChange={(e) => setNewChoreTitle(e.target.value)}
                  placeholder="e.g. Clean bedroom, Wash dishes"
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Reward ($)</label>
                <input
                  type="number"
                  step="0.50"
                  min="0.50"
                  value={newChoreReward}
                  onChange={(e) => setNewChoreReward(e.target.value)}
                  placeholder="3.00"
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-black text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setAddChoreOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddChore}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs cursor-pointer"
                >
                  Save Chore
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chore-Quest Portainer Pi Integration Modal */}
      <ChoreQuestSyncModal
        isOpen={choreQuestModalOpen}
        onClose={() => setChoreQuestModalOpen(false)}
        kid={kid}
        onUpdateKid={onUpdateKid}
      />
    </div>
  );
};
