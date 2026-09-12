import React, { useState } from 'react';
import { SavingsGoal, KidProfile } from '../types';
import { playCoinSound, playMilestoneFanfare, playVictorySound } from '../lib/sound';
import { sendKidNotification } from '../lib/notifications';
import { ThemeOption } from '../lib/theme';
import { GoalIcon } from './IconRenderer';
import { RocketGoalTrack } from './RocketGoalTrack';
import { RocketTakeoffModal } from './RocketTakeoffModal';
import confetti from 'canvas-confetti';
import { 
  Gamepad2, 
  CheckCircle2, 
  Sparkles, 
  Trophy, 
  PlusCircle, 
  Clock, 
  ShieldCheck, 
  DollarSign, 
  ShoppingBag,
  Flame,
  ArrowRight,
  TrendingUp,
  Target,
  Trash2,
  AlertTriangle
} from 'lucide-react';

interface GoalTrackerProps {
  kid: KidProfile;
  themeConfig?: ThemeOption;
  onUpdateKid: (updated: KidProfile) => void;
  onOpenNewGoalModal: () => void;
  onDeleteGoal?: (goalId: string) => void;
}

export const GoalTracker: React.FC<GoalTrackerProps> = ({
  kid,
  themeConfig,
  onUpdateKid,
  onOpenNewGoalModal,
  onDeleteGoal,
}) => {
  const [quickDepositAmount, setQuickDepositAmount] = useState<string>('');
  const [showQuickDeposit, setShowQuickDeposit] = useState(false);
  const [showRocketLaunchModal, setShowRocketLaunchModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Primary goal or fallback to first goal
  const primaryGoal = kid.goals.find((g) => g.priority === 'primary') || kid.goals[0];

  if (!primaryGoal) {
    return (
      <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-center shadow-xs p-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto mb-3 text-2xl">
          🚀
        </div>
        <h3 className="text-lg font-black text-slate-900 dark:text-white">No Active Savings Goal</h3>
        {kid.totalSaved > 0 ? (
          <div className="my-3 inline-flex flex-col items-center p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70 max-w-md mx-auto text-center">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              💰 Safe in Vault: <strong className="text-sm sm:text-base">${kid.totalSaved.toFixed(2)}</strong> accumulated savings
            </span>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
              Pick a new goal now! All ${kid.totalSaved.toFixed(2)} will be automatically reallocated to launch your rocket countdown.
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Pick a dream goal like a PlayStation 5, Nintendo Switch, or LEGO set to start your countdown!
          </p>
        )}
        <div className="mt-2">
          <button
            onClick={onOpenNewGoalModal}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer min-h-[44px] inline-flex items-center justify-center gap-2"
          >
            <Target className="w-4 h-4" />
            <span>+ Set Dream Goal {kid.totalSaved > 0 ? `(Reallocate $${kid.totalSaved.toFixed(2)})` : ''}</span>
          </button>
        </div>
      </div>
    );
  }

  const targetCost = primaryGoal.targetCost;
  const currentSaved = primaryGoal.currentSaved;
  const remaining = Math.max(0, targetCost - currentSaved);
  const percentage = Math.min(100, (currentSaved / targetCost) * 100);
  const isGoalCompleted = remaining <= 0;

  // Calculate estimated time remaining based on weekly allowance
  const weeklyRate = kid.weeklyAllowance > 0 ? kid.weeklyAllowance : 10;
  const weeksLeft = remaining > 0 ? Math.ceil(remaining / weeklyRate) : 0;

  // Handle direct deposit into goal
  const handleDepositToGoal = (amt: number) => {
    if (isNaN(amt) || amt <= 0) return;

    const prevSaved = primaryGoal.currentSaved;
    const newSaved = Number((prevSaved + amt).toFixed(2));
    const newTotalSaved = Number((kid.totalSaved + amt).toFixed(2));

    const prevPercent = (prevSaved / targetCost) * 100;
    const newPercent = (newSaved / targetCost) * 100;

    let unlockedMilestoneMessage: string | null = null;
    let earnedMilestoneXP = 0;

    // Check milestones (25%, 50%, 75%, 100%)
    const updatedMilestones = primaryGoal.milestones.map((milestone) => {
      const isNewlyReached = prevPercent < milestone.percent && newPercent >= milestone.percent;
      if (isNewlyReached) {
        unlockedMilestoneMessage = `Unlocked ${milestone.label}!`;
        earnedMilestoneXP += milestone.rewardXP;
        return { ...milestone, reached: true, reachedAt: new Date().toISOString().split('T')[0] };
      }
      return milestone;
    });

    const newXP = kid.xp + Math.round(amt * 10) + earnedMilestoneXP;
    const newLevel = Math.floor(newXP / 250) + 1;

    const updatedGoals = kid.goals.map((g) => {
      if (g.id === primaryGoal.id) {
        return {
          ...g,
          currentSaved: newSaved,
          milestones: updatedMilestones,
        };
      }
      return g;
    });

    const newTx = {
      id: `tx-deposit-${Date.now()}`,
      kidId: kid.id,
      type: 'deposit' as const,
      amount: amt,
      category: 'allowance' as const,
      description: `Deposit towards ${primaryGoal.title}`,
      date: new Date().toISOString().split('T')[0],
      goalContribution: primaryGoal.id,
    };

    let updatedBadges = [...kid.badges];
    if (newPercent >= 25) {
      updatedBadges = updatedBadges.map((b) => (b.id === 'quarter-master' ? { ...b, unlocked: true } : b));
    }
    if (newPercent >= 50) {
      updatedBadges = updatedBadges.map((b) => (b.id === 'halfway-hero' ? { ...b, unlocked: true } : b));
    }
    if (newPercent >= 100) {
      updatedBadges = updatedBadges.map((b) => (b.id === 'goal-crusher' ? { ...b, unlocked: true } : b));
    }

    onUpdateKid({
      ...kid,
      totalSaved: newTotalSaved,
      xp: newXP,
      level: newLevel,
      goals: updatedGoals,
      badges: updatedBadges,
      transactions: [newTx, ...kid.transactions],
    });

    setQuickDepositAmount('');
    setShowQuickDeposit(false);

    if (newPercent >= 100) {
      playVictorySound();
      setShowRocketLaunchModal(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
      sendKidNotification(
        '🏆 GOAL ACHIEVED! 100% SAVED!',
        `Congratulations ${kid.name}! You've saved all $${targetCost.toFixed(2)} for your ${primaryGoal.title}! Ready to purchase!`,
        'milestone'
      );
    } else if (unlockedMilestoneMessage) {
      playMilestoneFanfare();
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
      sendKidNotification(
        '🎉 Milestone Reached!',
        `${kid.name}, ${unlockedMilestoneMessage} ($${newSaved.toFixed(2)} / $${targetCost.toFixed(2)})!`,
        'milestone'
      );
    } else {
      playCoinSound();
      sendKidNotification(
        '💰 Money Added to Goal!',
        `Added +$${amt.toFixed(2)} toward ${primaryGoal.title}. Only $${Math.max(0, targetCost - newSaved).toFixed(2)} remaining!`,
        'chore'
      );
    }
  };

  const gradientClass = themeConfig
    ? themeConfig.progressBarGradient
    : 'from-amber-400 via-orange-500 to-emerald-500';

  return (
    <section id="goal-tracker-card" className="w-full relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs transition-all p-0 m-0">
      <div className="w-full p-3 sm:p-4">
        
        {/* Header with Title, Verified Badge & Switch Goal button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0 shadow-xs">
              <GoalIcon icon={primaryGoal.icon} className="w-5 h-5 text-amber-700 dark:text-amber-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {primaryGoal.title}
                </h2>
                {primaryGoal.isVerified && (
                  <span 
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-xs"
                    title={`Verified Retail Cost: $${primaryGoal.targetCost.toFixed(2)}`}
                  >
                    <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    Verified MSRP
                  </span>
                )}
                {primaryGoal.retailer && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    🏪 {primaryGoal.retailer}
                  </span>
                )}
                {primaryGoal.sku && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    SKU: {primaryGoal.sku}
                  </span>
                )}
                {primaryGoal.barcode && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hidden sm:inline-flex">
                    UPC: {primaryGoal.barcode}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 flex flex-wrap items-center gap-1.5">
                <span>{primaryGoal.category}</span>
                <span>•</span>
                <span>Target Cost: <strong className="text-slate-800 dark:text-slate-200">${primaryGoal.targetCost.toFixed(2)}</strong></span>
                {primaryGoal.verifiedSource && !primaryGoal.retailer && (
                  <>
                    <span>•</span>
                    <span className="hidden sm:inline">{primaryGoal.verifiedSource}</span>
                  </>
                )}
                {primaryGoal.itemNumber && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-[10px]">{primaryGoal.itemNumber}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              id="switch-goal-btn"
              onClick={onOpenNewGoalModal}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors min-h-[44px] cursor-pointer"
            >
              <span>Change Goal</span>
            </button>
            <button
              id="delete-goal-btn"
              onClick={() => setShowDeleteModal(true)}
              className="flex-none flex items-center justify-center gap-1 px-2.5 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs font-bold transition-colors min-h-[44px] cursor-pointer"
              title="Remove or delete this goal"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Remove</span>
            </button>
            <button
              id="open-deposit-form-btn"
              onClick={() => setShowQuickDeposit(!showQuickDeposit)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold shadow-xs transition-all min-h-[44px] cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add Money</span>
            </button>
          </div>
        </div>

        {/* Goal Switcher Strip (if multiple goals exist) */}
        {kid.goals.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-800 mb-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <span className="text-[11px] font-bold text-slate-400 uppercase shrink-0">Switch Goal:</span>
            {kid.goals.map((g) => (
              <button
                key={g.id}
                onClick={() => {
                  if (g.id !== primaryGoal.id) {
                    const updated = kid.goals.map((item) => ({
                      ...item,
                      priority: item.id === g.id ? ('primary' as const) : ('secondary' as const),
                    }));
                    onUpdateKid({ ...kid, goals: updated });
                  }
                }}
                className={`text-xs px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 border ${
                  g.id === primaryGoal.id
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                }`}
              >
                <GoalIcon icon={g.icon} className="w-3.5 h-3.5 shrink-0" />
                <span>{g.title}</span>
                <span className="text-[10px] opacity-80">(${g.currentSaved.toFixed(0)}/${g.targetCost.toFixed(0)})</span>
              </button>
            ))}
          </div>
        )}

        {/* Quick Deposit Form Drawer */}
        {showQuickDeposit && (
          <div className="mt-3 p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 animate-in fade-in slide-in-from-top-2">
            <div className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider mb-2">
              Deposit Money Into Your Goal Countdown
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[5, 10, 20, 50].map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleDepositToGoal(chip)}
                  className="min-h-[44px] px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 border border-amber-200 dark:border-slate-700 rounded-xl text-xs font-bold text-amber-900 dark:text-amber-200 shadow-xs cursor-pointer transition-colors"
                >
                  +${chip}
                </button>
              ))}
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="Custom amount"
                    value={quickDepositAmount}
                    onChange={(e) => setQuickDepositAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 text-xs bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-bold focus:outline-hidden focus:ring-2 focus:ring-amber-500 min-h-[44px]"
                  />
                </div>
                <button
                  onClick={() => handleDepositToGoal(parseFloat(quickDepositAmount))}
                  disabled={!quickDepositAmount || parseFloat(quickDepositAmount) <= 0}
                  className="min-h-[44px] px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Deposit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* The Core Countdown & Amount Displays */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 my-3">
          {/* Amount Saved */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Banked So Far
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 tracking-tight">
              ${currentSaved.toFixed(2)}
            </div>
            <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-0.5">
              Secure in offline vault
            </p>
          </div>

          {/* Amount Remaining Countdown */}
          <div className="p-3 rounded-2xl bg-orange-50/80 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-800/50">
            <span className="text-[11px] font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wider flex items-center justify-between">
              <span>Remaining Until Purchase</span>
              <Flame className="w-3.5 h-3.5 text-orange-500" />
            </span>
            <div className="text-xl sm:text-2xl font-black text-orange-600 dark:text-orange-400 mt-0.5 tracking-tight">
              ${remaining.toFixed(2)}
            </div>
            <p className="text-[10px] text-orange-700 dark:text-orange-300 mt-0.5">
              {isGoalCompleted ? 'Goal reached!' : 'Every penny counts!'}
            </p>
          </div>

          {/* Pace & ETA */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Countdown ETA</span>
              <Clock className="w-3.5 h-3.5 text-sky-500" />
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5 tracking-tight">
              {isGoalCompleted ? '0 Weeks!' : `~${weeksLeft} Weeks`}
            </div>
            <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-0.5">
              At ${weeklyRate}/wk allowance
            </p>
          </div>
        </div>

        {/* Rocket Ship Cosmic Goal Flight Tracker */}
        <RocketGoalTrack 
          goal={primaryGoal} 
          kid={kid} 
          onLaunchRocket={() => setShowRocketLaunchModal(true)} 
        />

        {/* Rocket Blastoff Celebration Modal */}
        <RocketTakeoffModal
          isOpen={showRocketLaunchModal}
          goal={primaryGoal}
          kid={kid}
          onClose={() => setShowRocketLaunchModal(false)}
        />

        {/* Flagship Countdown Progress Bar with Re-Coloring */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs font-extrabold mb-1.5">
            <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px] uppercase tracking-wider">SAVINGS PROGRESS COUNTDOWN</span>
            </div>
            <span className="text-xs font-black text-amber-600 dark:text-amber-400">
              {percentage.toFixed(1)}% Completed
            </span>
          </div>

          {/* Animated Bar with milestone notches */}
          <div className="relative w-full h-6 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
            {/* Filled portion */}
            <div
              className={`h-full rounded-full bg-gradient-to-r ${gradientClass} transition-all duration-700 ease-out shadow-xs relative`}
              style={{ width: `${Math.max(2, percentage)}%` }}
            >
              <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse pointer-events-none" />
            </div>

            {/* Milestone Notches at 25%, 50%, 75% */}
            {[25, 50, 75].map((notch) => (
              <div
                key={notch}
                className="absolute top-0 bottom-0 w-0.5 bg-white/70 dark:bg-slate-900/80 z-10"
                style={{ left: `${notch}%` }}
                title={`${notch}% Milestone Checkpoint`}
              />
            ))}
          </div>

          {/* Milestone Checkpoints Row */}
          <div className="grid grid-cols-4 gap-1.5 mt-2">
            {primaryGoal.milestones.map((milestone) => {
              const milestoneCost = (targetCost * (milestone.percent / 100)).toFixed(2);
              const isReached = currentSaved >= targetCost * (milestone.percent / 100);

              return (
                <div
                  key={milestone.percent}
                  className={`p-1.5 sm:p-2 rounded-xl border text-center transition-all ${
                    isReached
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 text-[10px] font-bold">
                    {isReached ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                    ) : (
                      <Trophy className="w-3 h-3 text-slate-400 shrink-0" />
                    )}
                    <span>{milestone.percent}%</span>
                  </div>
                  <div className="text-[11px] font-black mt-0.5 truncate">
                    ${milestoneCost}
                  </div>
                  <div className="text-[9px] text-amber-600 dark:text-amber-400 font-bold">
                    +{milestone.rewardXP} XP
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Delete Goal Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-center font-black text-lg text-slate-900 dark:text-white">
              Remove Savings Goal?
            </h3>
            
            <p className="text-center text-xs text-slate-600 dark:text-slate-300 mt-1">
              Are you sure you want to remove <strong className="text-slate-900 dark:text-white">"{primaryGoal.title}"</strong>?
            </p>

            {/* Fund Protection Notice */}
            <div className="my-4 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-black text-emerald-800 dark:text-emerald-300">
                <span>🛡️ Banked Funds Protected</span>
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                Your accumulated savings of <strong className="font-black text-emerald-900 dark:text-emerald-200">${primaryGoal.currentSaved.toFixed(2)}</strong> will <strong>NOT</strong> be lost. It stays safe in {kid.name}'s vault balance and will be automatically reallocated when you pick or create a new goal!
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer min-h-[44px]"
              >
                Keep Goal
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  onDeleteGoal?.(primaryGoal.id);
                }}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer min-h-[44px]"
              >
                Yes, Remove Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
