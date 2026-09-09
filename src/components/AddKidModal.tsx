import React, { useState } from 'react';
import { KidProfile } from '../types';
import { INITIAL_AVATARS, INITIAL_BADGES } from '../lib/storage';
import { UserPlus, X, Sparkles } from 'lucide-react';

interface AddKidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddKid: (kid: KidProfile) => void;
}

export const AddKidModal: React.FC<AddKidModalProps> = ({
  isOpen,
  onClose,
  onAddKid,
}) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('9');
  const [allowance, setAllowance] = useState('10.00');
  const [startingBalance, setStartingBalance] = useState('20.00');
  const [selectedAvatarId, setSelectedAvatarId] = useState('piggy');
  const [colorTheme, setColorTheme] = useState('sky');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedAge = parseInt(age, 10) || 8;
    const parsedAllowance = parseFloat(allowance) || 10;
    const parsedStarting = parseFloat(startingBalance) || 0;

    const newKid: KidProfile = {
      id: `kid-${Date.now()}`,
      name: name.trim(),
      age: parsedAge,
      avatarId: selectedAvatarId,
      colorTheme,
      totalSaved: parsedStarting,
      availableCash: parsedStarting > 0 ? 10 : 0,
      weeklyAllowance: parsedAllowance,
      allowanceDay: 'Sunday',
      xp: 100,
      level: 1,
      savingsStreakDays: 1,
      lastActivityDate: new Date().toISOString().split('T')[0],
      goals: [
        {
          id: `goal-${Date.now()}`,
          title: 'PlayStation 5 Slim Console',
          category: 'Gaming',
          targetCost: 499.99,
          isVerified: true,
          verifiedSource: 'Official MSRP (Sony / Best Buy)',
          currentSaved: parsedStarting,
          priority: 'primary',
          icon: 'Gamepad2',
          createdAt: new Date().toISOString().split('T')[0],
          milestones: [
            { percent: 25, label: 'Bronze 25% ($125.00)', rewardXP: 100, reached: parsedStarting >= 125 },
            { percent: 50, label: 'Silver 50% ($250.00)', rewardXP: 250, reached: parsedStarting >= 250 },
            { percent: 75, label: 'Gold 75% ($375.00)', rewardXP: 350, reached: parsedStarting >= 375 },
            { percent: 100, label: 'Platinum 100% ($499.99)', rewardXP: 500, reached: parsedStarting >= 499.99 },
          ],
        },
      ],
      badges: INITIAL_BADGES,
      chores: [
        { id: `c-clean-${Date.now()}`, kidId: `kid-${Date.now()}`, title: 'Clean bedroom and make bed', rewardAmount: 5.0, category: 'cleaning', icon: 'Sparkles', completed: false, isRepeatingWeekly: true },
        { id: `c-pets-${Date.now()}`, kidId: `kid-${Date.now()}`, title: 'Feed family pets & fill water', rewardAmount: 3.0, category: 'pets', icon: 'Footprints', completed: false, isRepeatingWeekly: true },
        { id: `c-dishes-${Date.now()}`, kidId: `kid-${Date.now()}`, title: 'Help with family dinner dishes', rewardAmount: 4.0, category: 'cleaning', icon: 'Utensils', completed: false, isRepeatingWeekly: true },
      ],
      transactions: [
        {
          id: `tx-init-${Date.now()}`,
          kidId: `kid-${Date.now()}`,
          type: 'deposit',
          amount: parsedStarting,
          category: 'gift',
          description: 'Starting vault balance setup',
          date: new Date().toISOString().split('T')[0],
        },
      ],
    };

    onAddKid(newKid);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                Add Kid Account
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Create a dedicated, private finance vault for another child
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Kid's Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sam"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Age
              </label>
              <input
                type="number"
                min="4"
                max="18"
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Weekly Allowance ($)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={allowance}
                onChange={(e) => setAllowance(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Starting Saved ($)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={startingBalance}
                onChange={(e) => setStartingBalance(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
              Select Starting Avatar
            </label>
            <div className="grid grid-cols-4 gap-2">
              {INITIAL_AVATARS.slice(0, 4).map((av) => (
                <button
                  type="button"
                  key={av.id}
                  onClick={() => setSelectedAvatarId(av.id)}
                  className={`p-2 rounded-2xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    selectedAvatarId === av.id
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="text-2xl">{av.emoji}</span>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 truncate w-full text-center">
                    {av.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
