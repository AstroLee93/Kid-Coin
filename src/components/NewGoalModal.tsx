import React, { useState, useEffect } from 'react';
import { SavingsGoal } from '../types';
import { ShieldCheck, Sparkles, X, Plus, Gamepad2, Tv, Boxes, Headphones, Bike, Tablet, Coins } from 'lucide-react';

interface VerifiedItem {
  id: string;
  name: string;
  category: string;
  currentCost: number;
  retailer: string;
  verifiedDate: string;
  icon: string;
  description: string;
}

interface NewGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGoal: (goal: SavingsGoal) => void;
}

export const NewGoalModal: React.FC<NewGoalModalProps> = ({
  isOpen,
  onClose,
  onSelectGoal,
}) => {
  const [catalog, setCatalog] = useState<VerifiedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Custom goal fields
  const [customTitle, setCustomTitle] = useState('');
  const [customCost, setCustomCost] = useState('');
  const [customCategory, setCustomCategory] = useState('Gaming');

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch('/api/verified-items')
      .then((res) => res.json())
      .then((data) => {
        if (data.items) setCatalog(data.items);
      })
      .catch((err) => {
        console.warn('Error loading verified items:', err);
      })
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectVerifiedItem = (item: VerifiedItem) => {
    const cost = item.currentCost;
    const newGoal: SavingsGoal = {
      id: `goal-${item.id}-${Date.now()}`,
      title: item.name,
      category: item.category,
      targetCost: cost,
      isVerified: true,
      verifiedSource: item.retailer,
      currentSaved: 0,
      priority: 'primary',
      icon: item.icon,
      createdAt: new Date().toISOString().split('T')[0],
      milestones: [
        { percent: 25, label: `Bronze 25% ($${(cost * 0.25).toFixed(2)})`, rewardXP: 100, reached: false },
        { percent: 50, label: `Silver 50% ($${(cost * 0.5).toFixed(2)})`, rewardXP: 250, reached: false },
        { percent: 75, label: `Gold 75% ($${(cost * 0.75).toFixed(2)})`, rewardXP: 350, reached: false },
        { percent: 100, label: `Platinum 100% ($${cost.toFixed(2)})`, rewardXP: 500, reached: false },
      ],
    };

    onSelectGoal(newGoal);
    onClose();
  };

  const handleCreateCustomGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = parseFloat(customCost);
    if (!customTitle.trim() || isNaN(cost) || cost <= 0) return;

    const newGoal: SavingsGoal = {
      id: `goal-custom-${Date.now()}`,
      title: customTitle.trim(),
      category: customCategory,
      targetCost: Number(cost.toFixed(2)),
      isVerified: false,
      currentSaved: 0,
      priority: 'primary',
      icon: 'Gamepad2',
      createdAt: new Date().toISOString().split('T')[0],
      milestones: [
        { percent: 25, label: `Bronze 25% ($${(cost * 0.25).toFixed(2)})`, rewardXP: 100, reached: false },
        { percent: 50, label: `Silver 50% ($${(cost * 0.5).toFixed(2)})`, rewardXP: 250, reached: false },
        { percent: 75, label: `Gold 75% ($${(cost * 0.75).toFixed(2)})`, rewardXP: 350, reached: false },
        { percent: 100, label: `Platinum 100% ($${cost.toFixed(2)})`, rewardXP: 500, reached: false },
      ],
    };

    onSelectGoal(newGoal);
    onClose();
  };

  const getItemIcon = (iconName: string) => {
    switch (iconName) {
      case 'Gamepad2':
        return <Gamepad2 className="w-5 h-5 text-indigo-500" />;
      case 'Tv':
        return <Tv className="w-5 h-5 text-red-500" />;
      case 'Boxes':
        return <Boxes className="w-5 h-5 text-yellow-500" />;
      case 'Headphones':
        return <Headphones className="w-5 h-5 text-slate-500" />;
      case 'Bike':
        return <Bike className="w-5 h-5 text-emerald-500" />;
      case 'Tablet':
        return <Tablet className="w-5 h-5 text-sky-500" />;
      case 'Coins':
        return <Coins className="w-5 h-5 text-amber-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-purple-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <span>Choose Your Dream Savings Goal</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Select an officially verified wishlist target or enter your own custom goal
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 mt-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <button
            onClick={() => setIsCustomMode(false)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              !isCustomMode
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            ⭐ Verified Wishlist Items (PS5, Switch, LEGO)
          </button>
          <button
            onClick={() => setIsCustomMode(true)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              isCustomMode
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            ✏️ Custom Goal
          </button>
        </div>

        {!isCustomMode ? (
          <div className="mt-4 space-y-3 max-h-96 overflow-y-auto pr-1">
            {catalog.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelectVerifiedItem(item)}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-all cursor-pointer flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {getItemIcon(item.icon)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {item.name}
                      </h4>
                      <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 mt-0.5">
                      {item.description}
                    </p>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                      {item.retailer} • {item.verifiedDate}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <div className="text-base font-black text-amber-600 dark:text-amber-400">
                    ${item.currentCost.toFixed(2)}
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    Select Target →
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={handleCreateCustomGoal} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Goal Name / Wishlist Target
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Hoverboard or Special Drone"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Target Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  placeholder="e.g. 149.99"
                  value={customCost}
                  onChange={(e) => setCustomCost(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Category
                </label>
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Gaming">Gaming</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Toys & LEGO">Toys & LEGO</option>
                  <option value="Sports & Outdoors">Sports & Outdoors</option>
                  <option value="Fashion & Clothes">Fashion & Clothes</option>
                </select>
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
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Set as Active Goal
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
