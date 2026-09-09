import React from 'react';
import { KidProfile } from '../types';
import { playCoinSound, playMilestoneFanfare } from '../lib/sound';
import { sendKidNotification } from '../lib/notifications';
import { ThemeOption } from '../lib/theme';
import confetti from 'canvas-confetti';
import { 
  Zap,
  Plus, 
  CheckCircle2, 
  Target, 
  ShoppingBag
} from 'lucide-react';

interface QuickActionsBarProps {
  kid: KidProfile;
  themeConfig: ThemeOption;
  onUpdateKid: (updated: KidProfile) => void;
  onOpenNewGoalModal: () => void;
}

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  kid,
  themeConfig,
  onUpdateKid,
  onOpenNewGoalModal,
}) => {
  const primaryGoal = kid.goals.find((g) => g.priority === 'primary') || kid.goals[0];

  // 1-Tap Deposit
  const handleQuickDeposit = (amount: number) => {
    if (!primaryGoal) return;

    const prevSaved = primaryGoal.currentSaved;
    const targetCost = primaryGoal.targetCost;
    const newSaved = Number((prevSaved + amount).toFixed(2));
    const newTotalSaved = Number((kid.totalSaved + amount).toFixed(2));

    const prevPercent = (prevSaved / targetCost) * 100;
    const newPercent = (newSaved / targetCost) * 100;

    let crossedMilestone = false;
    [25, 50, 75, 100].forEach((m) => {
      if (prevPercent < m && newPercent >= m) crossedMilestone = true;
    });

    const updatedGoals = kid.goals.map((g) =>
      g.id === primaryGoal.id ? { ...g, currentSaved: newSaved } : g
    );

    const newTx = {
      id: `tx-quick-${Date.now()}`,
      kidId: kid.id,
      type: 'deposit' as const,
      amount,
      category: 'allowance' as const,
      description: `Quick deposit into ${primaryGoal.title}`,
      date: new Date().toISOString().split('T')[0],
      goalContribution: primaryGoal.id,
    };

    onUpdateKid({
      ...kid,
      totalSaved: newTotalSaved,
      xp: kid.xp + amount * 10,
      goals: updatedGoals,
      transactions: [newTx, ...kid.transactions],
    });

    if (crossedMilestone) {
      playMilestoneFanfare();
      confetti({ particleCount: 80, spread: 70 });
      sendKidNotification(
        '🌟 Goal Milestone Reached!',
        `Quick deposit of +$${amount.toFixed(2)} pushed ${primaryGoal.title} across a milestone checkpoint!`,
        'milestone'
      );
    } else {
      playCoinSound();
      confetti({ particleCount: 30, spread: 45 });
      sendKidNotification(
        '💰 Quick Deposit Banked!',
        `Added +$${amount.toFixed(2)} toward ${primaryGoal.title}! Countdown updated.`,
        'allowance'
      );
    }
  };

  // 1-Tap Quick Chore completion
  const handleQuickChore = () => {
    const nextIncompleteChore = kid.chores.find((c) => !c.completed);
    if (!nextIncompleteChore) {
      sendKidNotification('🧹 All Chores Done!', 'You have finished all active chores on your bounty board! Great job!', 'chore');
      return;
    }

    const reward = nextIncompleteChore.rewardAmount;
    const prevSaved = primaryGoal ? primaryGoal.currentSaved : kid.totalSaved;
    const newSaved = Number((prevSaved + reward).toFixed(2));

    const updatedChores = kid.chores.map((c) =>
      c.id === nextIncompleteChore.id ? { ...c, completed: true } : c
    );

    const updatedGoals = kid.goals.map((g) => {
      if (primaryGoal && g.id === primaryGoal.id) {
        return { ...g, currentSaved: newSaved };
      }
      return g;
    });

    const newTx = {
      id: `tx-chore-quick-${Date.now()}`,
      kidId: kid.id,
      type: 'deposit' as const,
      amount: reward,
      category: 'chore' as const,
      description: `Chore bounty: ${nextIncompleteChore.title}`,
      date: new Date().toISOString().split('T')[0],
      goalContribution: primaryGoal?.id,
    };

    onUpdateKid({
      ...kid,
      totalSaved: Number((kid.totalSaved + reward).toFixed(2)),
      xp: kid.xp + Math.round(reward * 10),
      chores: updatedChores,
      goals: updatedGoals,
      transactions: [newTx, ...kid.transactions],
    });

    playCoinSound();
    confetti({ particleCount: 40, spread: 50 });
    sendKidNotification(
      '⚡ Chore Claimed!',
      `Finished "${nextIncompleteChore.title}" and banked +$${reward.toFixed(2)} directly!`,
      'chore'
    );
  };

  // 1-Tap Quick Spend
  const handleQuickSpend = (amount: number) => {
    const newCash = Math.max(0, Number((kid.availableCash - amount).toFixed(2)));
    const newTx = {
      id: `tx-spend-quick-${Date.now()}`,
      kidId: kid.id,
      type: 'withdrawal' as const,
      amount,
      category: 'snack' as const,
      description: 'Quick snack / small treat purchase',
      date: new Date().toISOString().split('T')[0],
    };

    onUpdateKid({
      ...kid,
      availableCash: newCash,
      transactions: [newTx, ...kid.transactions],
    });

    sendKidNotification(
      '🛍️ Spending Recorded',
      `Logged -$${amount.toFixed(2)} snack purchase. Keeps your records accurate!`,
      'chore'
    );
  };

  return (
    <>
      {/* Desktop / Tablet Quick Actions Bar */}
      <div id="quick-actions-bar" className="w-full bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 p-0 m-0">
        <div className="w-full px-3 py-2 flex flex-wrap items-center justify-between gap-2">
          
          {/* Label */}
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 shrink-0">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Quick Actions:</span>
          </div>

          {/* Action Pills */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            
            {/* Quick +$5 Deposit */}
            <button
              id="quick-deposit-5-btn"
              onClick={() => handleQuickDeposit(5)}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-black flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
              title="Add $5.00 directly to goal"
            >
              <Plus className="w-3 h-3" />
              <span>$5</span>
            </button>

            {/* Quick +$10 Deposit */}
            <button
              id="quick-deposit-10-btn"
              onClick={() => handleQuickDeposit(10)}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-black flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
              title="Add $10.00 directly to goal"
            >
              <Plus className="w-3 h-3" />
              <span>$10</span>
            </button>

            {/* Quick +$20 Deposit */}
            <button
              id="quick-deposit-20-btn"
              onClick={() => handleQuickDeposit(20)}
              className="hidden sm:flex px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-black items-center gap-1 transition-all active:scale-95 cursor-pointer"
              title="Add $20.00 directly to goal"
            >
              <Plus className="w-3 h-3" />
              <span>$20</span>
            </button>

            {/* Quick Complete Next Chore */}
            <button
              id="quick-chore-btn"
              onClick={handleQuickChore}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
              title="Finish next incomplete chore"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Finish Chore</span>
            </button>

            {/* Quick Spend Snack -$3 */}
            <button
              id="quick-spend-3-btn"
              onClick={() => handleQuickSpend(3)}
              className="px-2.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/60 dark:hover:bg-orange-900/80 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
              title="Record $3 snack spend"
            >
              <ShoppingBag className="w-3 h-3" />
              <span>-$3 Snack</span>
            </button>

            {/* Goal Switcher */}
            <button
              id="quick-new-goal-btn"
              onClick={onOpenNewGoalModal}
              className="hidden md:flex px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold items-center gap-1 transition-all cursor-pointer"
            >
              <Target className="w-3 h-3" />
              <span>New Goal</span>
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Touch Dock (Fixed Bottom for thumb accessibility on phones) */}
      <nav id="mobile-touch-dock" className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => handleQuickDeposit(5)}
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer min-w-[48px] min-h-[44px] justify-center"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
            <Plus className="w-4 h-4 stroke-[3]" />
          </div>
          <span>+$5</span>
        </button>

        <button
          onClick={() => handleQuickDeposit(10)}
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer min-w-[48px] min-h-[44px] justify-center"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
            <Plus className="w-4 h-4 stroke-[3]" />
          </div>
          <span>+$10</span>
        </button>

        <button
          onClick={handleQuickChore}
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer min-w-[48px] min-h-[44px] justify-center"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span>Chore</span>
        </button>

        <button
          onClick={() => handleQuickSpend(3)}
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-orange-600 dark:text-orange-400 cursor-pointer min-w-[48px] min-h-[44px] justify-center"
        >
          <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <span>-$3</span>
        </button>
      </nav>
    </>
  );
};
