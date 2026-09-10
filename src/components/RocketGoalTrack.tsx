import React from 'react';
import { motion } from 'motion/react';
import { SavingsGoal, KidProfile } from '../types';
import { GoalIcon } from './IconRenderer';
import { 
  Rocket, 
  Sparkles, 
  Flame, 
  Trophy, 
  CheckCircle2, 
  Star,
  Play
} from 'lucide-react';

interface RocketGoalTrackProps {
  goal: SavingsGoal;
  kid: KidProfile;
  onLaunchRocket: () => void;
}

export const RocketGoalTrack: React.FC<RocketGoalTrackProps> = ({
  goal,
  kid,
  onLaunchRocket,
}) => {
  const targetCost = goal.targetCost;
  const currentSaved = goal.currentSaved;
  const percentage = Math.min(100, Math.max(0, (currentSaved / targetCost) * 100));
  const isComplete = percentage >= 100;

  // Clamped percentage for rocket position so it doesn't overflow outside track
  // Rocket width is ~48px, so clamp between 2% and 93%
  const rocketLeftPercent = Math.min(92, Math.max(3, percentage));

  return (
    <div className="w-full my-4">
      {/* Flight Deck Header */}
      <div className="flex items-center justify-between text-xs font-black mb-2">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
          <span className="p-1 rounded-lg bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            <Rocket className="w-3.5 h-3.5" />
          </span>
          <span className="text-[11px] uppercase tracking-wider font-extrabold">
            ROCKET FLIGHT TRAJECTORY
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isComplete ? (
            <button
              onClick={onLaunchRocket}
              className="px-3 py-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white text-xs font-black rounded-full shadow-md shadow-orange-500/30 flex items-center gap-1.5 animate-bounce cursor-pointer transition-transform active:scale-95"
            >
              <Flame className="w-3.5 h-3.5 fill-white" />
              <span>🚀 BLAST OFF NOW!</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                {percentage.toFixed(1)}% Altitude
              </span>
              <button
                onClick={onLaunchRocket}
                title="Preview rocket takeoff animation"
                className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <Play className="w-2.5 h-2.5 fill-current" />
                <span>Launch Test</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Cosmic Flight Corridor Container */}
      <div className="relative w-full h-32 sm:h-36 rounded-3xl bg-gradient-to-r from-sky-900 via-indigo-950 to-slate-950 border-2 border-indigo-500/30 dark:border-indigo-500/40 p-3 shadow-inner overflow-hidden select-none">
        
        {/* Subtle Background Starfield Grid */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 26 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white transition-opacity"
              style={{
                width: `${(i % 2) + 1}px`,
                height: `${(i % 2) + 1}px`,
                top: `${(i * 17) % 85 + 5}%`,
                left: `${(i * 23) % 95 + 2}%`,
                opacity: (i % 4) * 0.2 + 0.3,
                animation: `pulse ${(i % 3) + 2}s infinite ease-in-out`,
              }}
            />
          ))}

          {/* Atmospheric Layer Gradients */}
          <div className="absolute left-0 top-0 bottom-0 w-1/4 bg-cyan-500/10 pointer-events-none" />
          <div className="absolute left-1/4 top-0 bottom-0 w-1/4 bg-indigo-500/10 pointer-events-none" />
          <div className="absolute left-2/4 top-0 bottom-0 w-1/4 bg-purple-500/10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-amber-500/10 pointer-events-none" />
        </div>

        {/* Flight Track Guide Line */}
        <div className="absolute left-4 right-16 top-1/2 -translate-y-1/2 h-2.5 bg-slate-800/80 rounded-full border border-indigo-500/30 overflow-hidden shadow-inner">
          {/* Glowing Fuel Progress Beam */}
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-amber-400 shadow-md transition-all duration-700 ease-out relative"
            style={{ width: `${Math.max(2, percentage)}%` }}
          >
            <div className="absolute inset-0 bg-white/25 animate-pulse rounded-full" />
          </div>
        </div>

        {/* Milestone Checkpoint Nodes on Track (0%, 25%, 50%, 75%, 100%) */}
        {/* 0% Earth Launchpad */}
        <div className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 flex flex-col items-center z-10">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-sky-500/20 border-2 border-sky-400 flex items-center justify-center text-sm shadow-sm backdrop-blur-xs">
            🌍
          </div>
          <span className="text-[9px] font-black text-sky-300 mt-1 uppercase tracking-tighter">
            Earth
          </span>
        </div>

        {/* 25% Atmosphere Entry */}
        <div className="absolute left-[25%] top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center z-10">
          <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] shadow-sm backdrop-blur-xs transition-colors ${
            percentage >= 25 
              ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300' 
              : 'bg-slate-800/80 border-slate-700 text-slate-500'
          }`}>
            ☁️
          </div>
          <span className={`text-[8px] font-bold mt-1 tracking-tighter ${
            percentage >= 25 ? 'text-emerald-300' : 'text-slate-500'
          }`}>
            25%
          </span>
        </div>

        {/* 50% Sub-Orbit / Satellite */}
        <div className="absolute left-[50%] top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center z-10">
          <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] shadow-sm backdrop-blur-xs transition-colors ${
            percentage >= 50 
              ? 'bg-indigo-500/30 border-indigo-400 text-indigo-300' 
              : 'bg-slate-800/80 border-slate-700 text-slate-500'
          }`}>
            🛰️
          </div>
          <span className={`text-[8px] font-bold mt-1 tracking-tighter ${
            percentage >= 50 ? 'text-indigo-300' : 'text-slate-500'
          }`}>
            50%
          </span>
        </div>

        {/* 75% Deep Space */}
        <div className="absolute left-[75%] top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center z-10">
          <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] shadow-sm backdrop-blur-xs transition-colors ${
            percentage >= 75 
              ? 'bg-purple-500/30 border-purple-400 text-purple-300' 
              : 'bg-slate-800/80 border-slate-700 text-slate-500'
          }`}>
            🪐
          </div>
          <span className={`text-[8px] font-bold mt-1 tracking-tighter ${
            percentage >= 75 ? 'text-purple-300' : 'text-slate-500'
          }`}>
            75%
          </span>
        </div>

        {/* 100% Target Destination Goal Orb */}
        <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex flex-col items-center z-10">
          <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border-2 flex items-center justify-center shadow-lg transition-all ${
            isComplete
              ? 'bg-gradient-to-tr from-amber-500 to-orange-400 border-amber-300 shadow-amber-500/50 animate-pulse'
              : 'bg-slate-900/90 border-amber-500/50 text-amber-400'
          }`}>
            <GoalIcon icon={goal.icon} className={`w-5 h-5 sm:w-6 sm:h-6 ${isComplete ? 'text-white' : 'text-amber-400'}`} />
          </div>
          <span className={`text-[9px] font-black mt-1 uppercase tracking-tighter ${
            isComplete ? 'text-amber-300 font-extrabold' : 'text-slate-400'
          }`}>
            100% Prize
          </span>
        </div>

        {/* Animated Flying Rocket Vessel */}
        <motion.div
          animate={{
            left: `${rocketLeftPercent}%`,
            y: [-2, 2, -2],
          }}
          transition={{
            left: { duration: 0.8, ease: 'easeOut' },
            y: { repeat: Infinity, duration: 1.8, ease: 'easeInOut' },
          }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 flex items-center pointer-events-none"
        >
          {/* Thruster exhaust flame behind the rocket (firing leftward) */}
          <div className="relative -mr-1 flex items-center">
            {/* Flickering Plasma Flame */}
            <motion.div
              animate={{
                scaleX: [0.8, 1.4, 0.9, 1.3],
                scaleY: [0.8, 1.1, 0.9],
                opacity: [0.8, 1, 0.7],
              }}
              transition={{ repeat: Infinity, duration: 0.18 }}
              className="w-7 sm:w-9 h-3.5 bg-gradient-to-l from-amber-400 via-orange-500 to-transparent rounded-l-full blur-xs"
            />
            {/* Core Yellow Spike */}
            <motion.div
              animate={{ scaleX: [1, 1.5, 1] }}
              transition={{ repeat: Infinity, duration: 0.12 }}
              className="absolute right-0 w-4 h-1.5 bg-yellow-200 rounded-l-full"
            />
          </div>

          {/* Detailed Horizontal SVG Rocket */}
          <div className="relative w-12 h-8 sm:w-14 sm:h-9 filter drop-shadow-[0_0_8px_rgba(251,146,60,0.8)]">
            <svg viewBox="0 0 70 45" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              {/* Nose Cone pointing RIGHT */}
              <path d="M68 22.5C55 18 42 12 28 12V33C42 33 55 27 68 22.5Z" fill="#EF4444" />
              <path d="M68 22.5C55 20 42 18 28 18V33C42 33 55 27 68 22.5Z" fill="#DC2626" />

              {/* Main Fuselage Body */}
              <path d="M28 12C18 12 10 13 6 14V31C10 32 18 33 28 33V12Z" fill="#F8FAFC" />
              <path d="M28 18H6V27H28V18Z" fill="#3B82F6" />

              {/* Porthole */}
              <circle cx="36" cy="22.5" r="5" fill="#0284C7" stroke="#38BDF8" strokeWidth="1.5" />
              <circle cx="34.5" cy="21" r="1.5" fill="#BAE6FD" />

              {/* Upper Fin */}
              <path d="M20 12L6 3H16L24 12H20Z" fill="#EF4444" />
              
              {/* Lower Fin */}
              <path d="M20 33L6 42H16L24 33H20Z" fill="#EF4444" />

              {/* Engine Exhaust Nozzle */}
              <path d="M6 16H1L3 29H6V16Z" fill="#475569" />
            </svg>

            {/* Altitude & Pilot Tag Floating Above Rocket */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900/90 text-amber-300 border border-amber-400/60 text-[9px] font-black px-1.5 py-0.5 rounded-md whitespace-nowrap shadow-sm">
              ${currentSaved.toFixed(0)} / ${targetCost.toFixed(0)}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Atmospheric Stage Labels Beneath Corridor */}
      <div className="grid grid-cols-4 text-center text-[10px] font-bold mt-1.5 text-slate-500 dark:text-slate-400">
        <span className={percentage >= 25 ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : ''}>
          ☁️ Troposphere
        </span>
        <span className={percentage >= 50 ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : ''}>
          🛰️ Low Orbit
        </span>
        <span className={percentage >= 75 ? 'text-purple-600 dark:text-purple-400 font-extrabold' : ''}>
          🪐 Deep Space
        </span>
        <span className={isComplete ? 'text-amber-600 dark:text-amber-400 font-black' : ''}>
          🏆 Goal Target
        </span>
      </div>
    </div>
  );
};
