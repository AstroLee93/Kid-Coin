import React from 'react';
import { KidProfile } from '../types';
import { TrendingUp, PieChart, Activity, ShieldCheck, Flame } from 'lucide-react';

interface DataVisualizationProps {
  kid: KidProfile;
}

export const DataVisualization: React.FC<DataVisualizationProps> = ({ kid }) => {
  const primaryGoal = kid.goals.find((g) => g.priority === 'primary') || kid.goals[0];
  const targetCost = primaryGoal ? primaryGoal.targetCost : 500;
  const currentSaved = primaryGoal ? primaryGoal.currentSaved : kid.totalSaved;

  // Compute category breakdown from transactions
  const categoryTotals: Record<string, number> = {};
  let totalIn = 0;
  let totalOut = 0;

  kid.transactions.forEach((tx) => {
    if (tx.type === 'deposit') {
      totalIn += tx.amount;
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
    } else {
      totalOut += tx.amount;
    }
  });

  // Calculate cumulative points for SVG trend chart
  const trendPoints: { date: string; cumulative: number }[] = [];
  let runningTotal = 0;
  
  // Sort ascending by date
  const sortedTx = [...kid.transactions].sort((a, b) => a.date.localeCompare(b.date));
  sortedTx.forEach((tx) => {
    if (tx.type === 'deposit') {
      runningTotal += tx.amount;
      trendPoints.push({ date: tx.date.slice(5), cumulative: runningTotal });
    }
  });

  if (trendPoints.length === 0) {
    trendPoints.push({ date: 'Start', cumulative: currentSaved });
  }

  // SVG Chart sizing
  const width = 360;
  const height = 140;
  const padding = 25;
  const maxVal = Math.max(targetCost, ...trendPoints.map((p) => p.cumulative));

  const pointsString = trendPoints
    .map((p, idx) => {
      const x = padding + (idx / Math.max(1, trendPoints.length - 1)) * (width - 2 * padding);
      const y = height - padding - (p.cumulative / maxVal) * (height - 2 * padding);
      return `${x},${y}`;
    })
    .join(' ');

  const targetLineY = height - padding - (targetCost / maxVal) * (height - 2 * padding);

  return (
    <div id="data-visualization-card" className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-xs m-0">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span>Visual Progress Analytics</span>
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded-full">
              Low-Latency
            </span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Real-time savings trajectory toward {primaryGoal?.title || 'your goal'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        {/* 1. Growth Trajectory Chart */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
            <span className="flex items-center gap-1.5 uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              Savings Trajectory Curve
            </span>
            <span className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold">
              Goal: ${targetCost.toFixed(2)}
            </span>
          </div>

          {/* SVG Sparkline */}
          <div className="relative w-full h-36">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
              {/* Target Line */}
              <line
                x1={padding}
                y1={targetLineY}
                x2={width - padding}
                y2={targetLineY}
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <text
                x={width - padding}
                y={targetLineY - 4}
                textAnchor="end"
                className="fill-amber-500 text-[9px] font-bold"
              >
                Target: ${targetCost.toFixed(0)}
              </text>

              {/* Gradient Area Fill */}
              <defs>
                <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area polygon */}
              {trendPoints.length > 1 && (
                <polygon
                  points={`${padding},${height - padding} ${pointsString} ${width - padding},${height - padding}`}
                  fill="url(#curveGradient)"
                />
              )}

              {/* Trend Polyline */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsString}
              />

              {/* Points */}
              {trendPoints.map((p, idx) => {
                const x = padding + (idx / Math.max(1, trendPoints.length - 1)) * (width - 2 * padding);
                const y = height - padding - (p.cumulative / maxVal) * (height - 2 * padding);
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r={idx === trendPoints.length - 1 ? 5 : 3.5}
                    className="fill-white stroke-emerald-600 dark:fill-slate-900"
                    strokeWidth="2.5"
                  />
                );
              })}
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 mt-1 px-1">
            <span>Started</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              Current: ${currentSaved.toFixed(2)}
            </span>
          </div>
        </div>

        {/* 2. Earning Streams & Discipline Breakdown */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 mb-3">
            <span className="flex items-center gap-1.5 uppercase tracking-wider">
              <PieChart className="w-3.5 h-3.5 text-sky-500" />
              Where Did Your Savings Come From?
            </span>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              +${totalIn.toFixed(2)} total
            </span>
          </div>

          {/* Income Source Bars */}
          <div className="space-y-2.5 my-auto">
            {Object.entries(categoryTotals).map(([cat, amt]) => {
              const pct = totalIn > 0 ? Math.round((amt / totalIn) * 100) : 0;
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold capitalize text-slate-700 dark:text-slate-300">
                      {cat.replace('_', ' ')}
                    </span>
                    <span className="text-slate-600 dark:text-slate-300 font-bold">
                      ${amt.toFixed(2)} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Savings Ratio Badge */}
          <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-300">Discipline Score:</span>
            <span className="font-black text-emerald-600 dark:text-emerald-400">
              {totalIn > 0 ? Math.round(((totalIn - totalOut) / totalIn) * 100) : 100}% Kept & Saved
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
