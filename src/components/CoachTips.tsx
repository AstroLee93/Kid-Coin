import React, { useState, useEffect } from 'react';
import { KidProfile, CoachAdvice } from '../types';
import { Sparkles, Lightbulb, Zap, ArrowRight, RefreshCw, Calculator, DollarSign, Award } from 'lucide-react';

interface CoachTipsProps {
  kid: KidProfile;
}

export const CoachTips: React.FC<CoachTipsProps> = ({ kid }) => {
  const [advice, setAdvice] = useState<CoachAdvice | null>(null);
  const [loading, setLoading] = useState(false);
  const [extraWeeklySlider, setExtraWeeklySlider] = useState<number>(10);

  const primaryGoal = kid.goals.find((g) => g.priority === 'primary') || kid.goals[0];

  const fetchTips = async () => {
    if (!primaryGoal) return;
    setLoading(true);

    try {
      const res = await fetch('/api/tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kidName: kid.name,
          age: kid.age,
          goalName: primaryGoal.title,
          targetCost: primaryGoal.targetCost,
          currentSaved: primaryGoal.currentSaved,
          weeklyAllowance: kid.weeklyAllowance,
          recentChores: kid.chores.filter((c) => c.completed).map((c) => c.title),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.tips) {
          setAdvice(data.tips);
          return;
        }
      }
      // Fallback if response was not ok
      setAdvice({
        headline: `Every coin saved brings you one step closer to your ${primaryGoal.title}!`,
        milestoneTip: `Aim to hit your next target checkpoint by completing chores this week!`,
        fastTrackIdeas: [
          'Offer to help tidy the living room or sweep the kitchen for a chore bonus.',
          'Sort clean laundry and put away socks for a chore reward.',
          'Save half of any chore earnings directly in your locked vault.',
        ],
        spendingTradeoff: 'Skipping small impulse snacks keeps more dollars in your pocket.',
        estimatedPace: 'Consistent saving every week adds up faster than you think!',
      });
    } catch (e) {
      console.warn('Failed to load online tips, using offline mentor algorithm', e);
      setAdvice({
        headline: `Every coin saved brings you one step closer to your ${primaryGoal.title}!`,
        milestoneTip: `Aim to hit your next target checkpoint by completing chores this week!`,
        fastTrackIdeas: [
          'Offer to help tidy the living room or sweep the kitchen for a chore bonus.',
          'Sort clean laundry and put away socks for a chore reward.',
          'Save half of any chore earnings directly in your locked vault.',
        ],
        spendingTradeoff: 'Skipping small impulse snacks keeps more dollars in your pocket.',
        estimatedPace: 'Consistent saving every week adds up faster than you think!',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTips();
  }, [kid.id, primaryGoal?.id, primaryGoal?.currentSaved]);

  if (!primaryGoal) return null;

  const remaining = Math.max(0, primaryGoal.targetCost - primaryGoal.currentSaved);
  const baseAllowance = kid.weeklyAllowance > 0 ? kid.weeklyAllowance : 10;
  const currentWeeks = Math.ceil(remaining / baseAllowance);
  const acceleratedWeeks = Math.ceil(remaining / (baseAllowance + extraWeeklySlider));
  const weeksSaved = Math.max(0, currentWeeks - acceleratedWeeks);

  return (
    <div id="coach-tips-section" className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-xs m-0">
      {/* Mentor Header */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-xl">
            🧭
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Captain Penny's Milestone Coach</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                Personalized
              </span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Smart strategies to accelerate your {primaryGoal.title} countdown
            </p>
          </div>
        </div>

        <button
          id="refresh-tips-btn"
          onClick={fetchTips}
          disabled={loading}
          className="p-2 text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Refresh coaching advice"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
        </button>
      </div>

      {/* Main Mentor Advice Content */}
      <div className="mt-4 space-y-4">
        {/* Headline Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/20 border border-indigo-100 dark:border-indigo-900/40 text-indigo-950 dark:text-indigo-200 text-xs sm:text-sm font-semibold flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <span>
            {advice?.headline ||
              `Every single dollar brings you closer to your ${primaryGoal.title}! Keep consistent!`}
          </span>
        </div>

        {/* Milestone Next Target & Fast Track ideas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Milestone Next Action */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Next Milestone Challenge</span>
            </div>
            <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {advice?.milestoneTip ||
                `Next Target: Push toward your next 25% checkpoint by completing 2 extra chore bounties this week!`}
            </p>

            <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
              <span>Goal Cost: ${primaryGoal.targetCost.toFixed(2)}</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                ${remaining.toFixed(2)} remaining
              </span>
            </div>
          </div>

          {/* Tradeoff Wisdom */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-sky-500" />
              <span>Smart Tradeoff Tip</span>
            </div>
            <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
              {advice?.spendingTradeoff ||
                `Skipping a $5 candy snack or impulse toy shaves a whole week off your countdown clock!`}
            </p>
            <div className="mt-2 text-[11px] text-sky-600 dark:text-sky-400 font-semibold">
              💡 Tip: Put 50% of gift money directly into your vault!
            </div>
          </div>
        </div>

        {/* Fast-Forward Goal Simulator */}
        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                Interactive Fast-Forward Simulator
              </span>
            </div>
            <span className="text-xs font-extrabold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 px-2.5 py-0.5 rounded-full">
              +${extraWeeklySlider}/wk Extra from Chores
            </span>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="30"
              step="5"
              value={extraWeeklySlider}
              onChange={(e) => setExtraWeeklySlider(Number(e.target.value))}
              className="flex-1 accent-amber-500 cursor-pointer"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 text-xs text-amber-950 dark:text-amber-100">
            <span>
              Standard Allowance pace: <strong>{currentWeeks} weeks</strong>
            </span>
            <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Accelerated pace: {acceleratedWeeks} weeks</span>
              {weeksSaved > 0 && (
                <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md font-black">
                  🎉 Saves {weeksSaved} weeks!
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
