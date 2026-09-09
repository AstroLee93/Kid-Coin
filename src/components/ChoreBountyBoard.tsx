import React, { useState } from 'react';
import { KidProfile, Chore } from '../types';
import { playCoinSound, playMilestoneFanfare } from '../lib/sound';
import { sendKidNotification } from '../lib/notifications';
import { ChoreQuestSyncModal } from './ChoreQuestSyncModal';
import { ChoreIcon } from './IconRenderer';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Sparkles, 
  DollarSign, 
  Car, 
  Utensils, 
  Footprints, 
  Trash2, 
  HeartHandshake, 
  Repeat,
  Check,
  X
} from 'lucide-react';

interface ChoreBountyBoardProps {
  kid: KidProfile;
  onUpdateKid: (updated: KidProfile) => void;
}

export const ChoreBountyBoard: React.FC<ChoreBountyBoardProps> = ({
  kid,
  onUpdateKid,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showChoreQuestModal, setShowChoreQuestModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newReward, setNewReward] = useState('5.00');
  const [newCategory, setNewCategory] = useState<'cleaning' | 'pets' | 'school' | 'yard'>('cleaning');

  const primaryGoal = kid.goals.find((g) => g.priority === 'primary') || kid.goals[0];

  const getChoreIcon = (icon: string, cat: string) => {
    switch (icon) {
      case 'Car':
        return <Car className="w-4 h-4 text-sky-500" />;
      case 'Utensils':
        return <Utensils className="w-4 h-4 text-amber-500" />;
      case 'Footprints':
        return <Footprints className="w-4 h-4 text-emerald-500" />;
      case 'Trash2':
        return <Trash2 className="w-4 h-4 text-slate-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-500" />;
    }
  };

  const handleToggleChore = (chore: Chore) => {
    if (chore.completed) {
      // If already completed, just toggle back without subtracting
      const updatedChores = kid.chores.map((c) =>
        c.id === chore.id ? { ...c, completed: false } : c
      );
      onUpdateKid({ ...kid, chores: updatedChores });
      return;
    }

    // Complete chore and deposit into savings goal countdown!
    const reward = chore.rewardAmount;
    const prevSaved = primaryGoal ? primaryGoal.currentSaved : kid.totalSaved;
    const targetCost = primaryGoal ? primaryGoal.targetCost : 500;
    const newSaved = prevSaved + reward;

    const prevPercent = (prevSaved / targetCost) * 100;
    const newPercent = (newSaved / targetCost) * 100;

    let crossedMilestone = false;
    [25, 50, 75, 100].forEach((m) => {
      if (prevPercent < m && newPercent >= m) {
        crossedMilestone = true;
      }
    });

    const updatedGoals = kid.goals.map((g) => {
      if (primaryGoal && g.id === primaryGoal.id) {
        return { ...g, currentSaved: Number(newSaved.toFixed(2)) };
      }
      return g;
    });

    const updatedChores = kid.chores.map((c) =>
      c.id === chore.id ? { ...c, completed: true } : c
    );

    const newTx = {
      id: `tx-chore-${Date.now()}`,
      kidId: kid.id,
      type: 'deposit' as const,
      amount: reward,
      category: 'chore' as const,
      description: `Chore bounty: ${chore.title}`,
      date: new Date().toISOString().split('T')[0],
      goalContribution: primaryGoal?.id,
    };

    const newTotalSaved = Number((kid.totalSaved + reward).toFixed(2));
    const newXP = kid.xp + Math.round(reward * 10);
    const newLevel = Math.floor(newXP / 250) + 1;

    onUpdateKid({
      ...kid,
      totalSaved: newTotalSaved,
      xp: newXP,
      level: newLevel,
      goals: updatedGoals,
      chores: updatedChores,
      transactions: [newTx, ...kid.transactions],
    });

    if (crossedMilestone) {
      playMilestoneFanfare();
      confetti({ particleCount: 80, spread: 70 });
      sendKidNotification(
        '🌟 Chore Milestone Unlocked!',
        `Completing "${chore.title}" (+${reward.toFixed(2)}) pushed your ${primaryGoal?.title || 'goal'} over a milestone!`,
        'milestone'
      );
    } else {
      playCoinSound();
      sendKidNotification(
        '💵 Chore Bounty Banked!',
        `Earned +$${reward.toFixed(2)} from "${chore.title}"! Directly added to your goal!`,
        'chore'
      );
    }
  };

  const handleAddChore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const reward = parseFloat(newReward) || 5.0;
    const newChore: Chore = {
      id: `chore-${Date.now()}`,
      kidId: kid.id,
      title: newTitle.trim(),
      rewardAmount: reward,
      category: newCategory,
      icon: newCategory === 'yard' ? 'Car' : newCategory === 'pets' ? 'Footprints' : 'Sparkles',
      completed: false,
      isRepeatingWeekly: true,
    };

    onUpdateKid({
      ...kid,
      chores: [...kid.chores, newChore],
    });

    setNewTitle('');
    setNewReward('5.00');
    setShowAddModal(false);
  };

  const completedCount = kid.chores.filter((c) => c.completed).length;

  return (
    <div id="chore-bounty-board" className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-xs m-0">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span>Chore Bounty Board</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              {completedCount}/{kid.chores.length} Completed
            </span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Complete tasks to instantly deposit cash toward your countdown
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="chorequest-sync-btn-advanced"
            onClick={() => setShowChoreQuestModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
            title="Sync with AstroLee93/Chore-Quest Portainer stack on Raspberry Pi"
          >
            <span>⚔️</span>
            <span>Chore-Quest Sync</span>
          </button>

          <button
            id="add-chore-btn"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Chore List */}
      <div className="mt-4 space-y-2.5">
        {kid.chores.map((chore) => (
          <div
            key={chore.id}
            onClick={() => handleToggleChore(chore)}
            className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all cursor-pointer select-none ${
              chore.completed
                ? 'bg-slate-50/70 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-800/60 opacity-70'
                : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                  chore.completed
                    ? 'bg-emerald-500 text-white'
                    : 'border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                }`}
              >
                {chore.completed && <Check className="w-4 h-4 stroke-[3]" />}
              </button>

              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                <ChoreIcon icon={chore.icon} category={chore.category} className="w-3.5 h-3.5" />
              </div>

              <div className="min-w-0">
                <span
                  className={`text-sm font-bold block truncate ${
                    chore.completed
                      ? 'line-through text-slate-600 dark:text-slate-300'
                      : 'text-slate-800 dark:text-slate-100'
                  }`}
                >
                  {chore.title}
                </span>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 flex-wrap">
                  <span className="capitalize">{chore.category}</span>
                  {chore.source === 'chore-quest' && (
                    <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950 px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                      <span>⚔️</span>
                      <span>{chore.choreQuestPoints || Math.round(chore.rewardAmount * 10)} pts</span>
                    </span>
                  )}
                  {chore.isRepeatingWeekly && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <Repeat className="w-2.5 h-2.5" /> Weekly
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <span className={`text-sm font-black px-2.5 py-1 rounded-xl ${
                chore.completed
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
              }`}>
                +${chore.rewardAmount.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Chore Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                Create New Chore Bounty
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddChore} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Chore Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rake autumn leaves in backyard"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Reward Cash ($)
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    min="0.50"
                    required
                    value={newReward}
                    onChange={(e) => setNewReward(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="cleaning">Cleaning</option>
                    <option value="pets">Pet Care</option>
                    <option value="yard">Yard / Outside</option>
                    <option value="school">Homework / School</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Create Bounty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chore-Quest Portainer Pi Integration Modal */}
      <ChoreQuestSyncModal
        isOpen={showChoreQuestModal}
        onClose={() => setShowChoreQuestModal(false)}
        kid={kid}
        onUpdateKid={onUpdateKid}
      />
    </div>
  );
};
