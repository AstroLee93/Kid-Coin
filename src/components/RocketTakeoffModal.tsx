import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SavingsGoal, KidProfile } from '../types';
import { playRocketLaunchSound, playVictorySound } from '../lib/sound';
import confetti from 'canvas-confetti';
import { 
  Rocket, 
  Sparkles, 
  Flame, 
  RotateCcw, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Trophy, 
  Star, 
  Volume2, 
  VolumeX 
} from 'lucide-react';
import { GoalIcon } from './IconRenderer';

interface RocketTakeoffModalProps {
  isOpen: boolean;
  goal: SavingsGoal;
  kid: KidProfile;
  onClose: () => void;
}

type LaunchPhase = 'countdown' | 'launching' | 'orbit' | 'landed';

export const RocketTakeoffModal: React.FC<RocketTakeoffModalProps> = ({
  isOpen,
  goal,
  kid,
  onClose,
}) => {
  const [phase, setPhase] = useState<LaunchPhase>('countdown');
  const [count, setCount] = useState<number>(3);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);

  // Start launch sequence when modal opens
  useEffect(() => {
    if (!isOpen) {
      setPhase('countdown');
      setCount(3);
      return;
    }

    // Sequence start
    setPhase('countdown');
    setCount(3);

    const timer1 = setTimeout(() => setCount(2), 900);
    const timer2 = setTimeout(() => setCount(1), 1800);
    const timer3 = setTimeout(() => {
      setCount(0);
      setPhase('launching');
      if (!soundMuted) {
        playRocketLaunchSound();
      }
    }, 2700);

    const timer4 = setTimeout(() => {
      setPhase('orbit');
    }, 4500);

    const timer5 = setTimeout(() => {
      setPhase('landed');
      if (!soundMuted) {
        playVictorySound();
      }
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
      });
      // Second burst
      setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 70,
          origin: { x: 0.2, y: 0.6 },
        });
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 70,
          origin: { x: 0.8, y: 0.6 },
        });
      }, 400);
    }, 6200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [isOpen, soundMuted]);

  const handleReplay = () => {
    setPhase('countdown');
    setCount(3);
    const timer1 = setTimeout(() => setCount(2), 900);
    const timer2 = setTimeout(() => setCount(1), 1800);
    const timer3 = setTimeout(() => {
      setCount(0);
      setPhase('launching');
      if (!soundMuted) {
        playRocketLaunchSound();
      }
    }, 2700);

    const timer4 = setTimeout(() => {
      setPhase('orbit');
    }, 4500);

    const timer5 = setTimeout(() => {
      setPhase('landed');
      if (!soundMuted) {
        playVictorySound();
      }
      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.55 },
      });
    }, 6200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-hidden">
      {/* Background Starfield */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 45 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white transition-opacity"
            style={{
              width: `${(i % 3) + 1.5}px`,
              height: `${(i % 3) + 1.5}px`,
              top: `${(i * 19) % 100}%`,
              left: `${(i * 23) % 100}%`,
              opacity: (i % 5) * 0.2 + 0.2,
              animation: `pulse ${(i % 3) + 2}s infinite ease-in-out`,
            }}
          />
        ))}

        {/* Nebula Glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Mission Window */}
      <div className="relative w-full max-w-xl bg-slate-900/95 border border-indigo-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col items-center text-center p-4 sm:p-6 text-white max-h-[92vh] overflow-y-auto">
        
        {/* Top Header Bar */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-black tracking-wider uppercase text-indigo-300">
              KidCoin Space Mission Control
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundMuted(!soundMuted)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title={soundMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Launch Stage Theater */}
        <div className="relative w-full h-72 sm:h-80 my-3 rounded-2xl bg-gradient-to-b from-indigo-950/80 via-slate-950 to-slate-900 border border-indigo-900/60 flex flex-col items-center justify-end overflow-hidden">
          
          {/* Warp Streaks during launching/orbit */}
          {(phase === 'launching' || phase === 'orbit') && (
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 18 }).map((_, idx) => (
                <motion.div
                  key={idx}
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 350, opacity: [0, 0.9, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.5 + (idx % 4) * 0.15,
                    delay: (idx * 0.08),
                    ease: 'linear',
                  }}
                  className="absolute w-0.5 bg-gradient-to-b from-cyan-300 via-white to-transparent"
                  style={{
                    left: `${(idx * 6) + 4}%`,
                    height: `${40 + (idx % 3) * 30}px`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Destination Planet / Target Goal in Orbit */}
          <motion.div
            animate={{
              y: phase === 'landed' ? [0, -6, 0] : 0,
              scale: phase === 'landed' ? 1.05 : 1,
            }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            className={`absolute top-4 sm:top-6 z-10 flex flex-col items-center transition-all duration-700 ${
              phase === 'countdown' ? 'opacity-40 scale-90' : 'opacity-100 scale-100'
            }`}
          >
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 p-0.5 shadow-lg shadow-amber-500/30 flex items-center justify-center">
                <div className="w-full h-full rounded-[14px] bg-slate-900/90 flex items-center justify-center text-amber-400">
                  <GoalIcon icon={goal.icon} className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
                </div>
              </div>

              {/* Orbiting Satellite / Star */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
                className="absolute -inset-3 pointer-events-none flex items-start justify-end"
              >
                <div className="w-3.5 h-3.5 rounded-full bg-amber-300 shadow-md shadow-amber-300" />
              </motion.div>
            </div>

            <span className="mt-1.5 px-3 py-0.5 rounded-full bg-slate-900/90 border border-amber-500/50 text-[11px] font-black text-amber-300 shadow-sm">
              {goal.title}
            </span>
          </motion.div>

          {/* Rocket Vessel */}
          <motion.div
            initial={{ y: 0 }}
            animate={{
              y:
                phase === 'countdown'
                  ? [0, -3, 0]
                  : phase === 'launching'
                  ? -140
                  : phase === 'orbit'
                  ? -185
                  : -175,
              scale:
                phase === 'launching'
                  ? 1.15
                  : phase === 'orbit'
                  ? 1.05
                  : 1,
              rotate:
                phase === 'countdown'
                  ? count === 1 ? [-1, 1, -1] : 0
                  : phase === 'launching'
                  ? [-1.5, 1.5, -1.5]
                  : 0,
            }}
            transition={{
              duration: phase === 'countdown' ? 0.6 : phase === 'launching' ? 1.4 : 0.8,
              repeat: phase === 'countdown' ? Infinity : 0,
              ease: phase === 'launching' ? 'easeIn' : 'easeInOut',
            }}
            className="relative z-20 flex flex-col items-center mb-6"
          >
            {/* Custom SVG Rocket */}
            <div className="relative w-16 h-28 sm:w-20 sm:h-32 filter drop-shadow-[0_0_12px_rgba(249,115,22,0.6)]">
              <svg viewBox="0 0 80 130" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Rocket Nose Cone */}
                <path d="M40 5C32 20 22 40 22 65H58C58 40 48 20 40 5Z" fill="#EF4444" />
                <path d="M40 5C45 20 54 40 58 65H40V5Z" fill="#DC2626" />

                {/* Main Fuselage Body */}
                <path d="M22 65C22 85 24 100 24 108H56C56 100 58 85 58 65H22Z" fill="#F8FAFC" />
                <path d="M40 65H58C58 85 56 100 56 108H40V65Z" fill="#E2E8F0" />

                {/* Body Stripes */}
                <rect x="23" y="75" width="34" height="6" fill="#3B82F6" />
                <rect x="23.5" y="87" width="33" height="4" fill="#EF4444" />

                {/* Porthole Window */}
                <circle cx="40" cy="52" r="11" fill="#0284C7" stroke="#38BDF8" strokeWidth="2.5" />
                <circle cx="37" cy="49" r="4" fill="#BAE6FD" opacity="0.8" />
                <text x="40" y="55" fontSize="8" textAnchor="middle" fill="#FFFFFF" fontWeight="bold">
                  ★
                </text>

                {/* Left Fin */}
                <path d="M22 80L8 108C7 110 9 112 11 112H24L22 80Z" fill="#EF4444" />
                <path d="M22 80L13 108H24L22 80Z" fill="#DC2626" />

                {/* Right Fin */}
                <path d="M58 80L72 108C73 110 71 112 69 112H56L58 80Z" fill="#EF4444" />
                <path d="M58 80L67 108H56L58 80Z" fill="#B91C1C" />

                {/* Center Engine Nozzle */}
                <path d="M30 108H50L46 116H34L30 108Z" fill="#475569" />
                <path d="M40 108H50L46 116H40V108Z" fill="#334155" />
              </svg>

              {/* Pilot Label */}
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-indigo-900/90 text-indigo-200 border border-indigo-400 text-[9px] font-black px-1.5 py-0.2 rounded-full whitespace-nowrap">
                Cmdr. {kid.name}
              </div>
            </div>

            {/* Thruster Flames (Animated) */}
            <motion.div
              animate={{
                scaleY:
                  phase === 'countdown' && count > 0
                    ? [0.2, 0.5, 0.2]
                    : [1, 1.4, 0.9, 1.3],
                scaleX:
                  phase === 'countdown' && count > 0
                    ? 0.5
                    : [0.9, 1.1, 0.95],
                opacity: phase === 'countdown' && count > 1 ? 0.3 : 1,
              }}
              transition={{ repeat: Infinity, duration: 0.15 }}
              className="relative -mt-1 flex flex-col items-center"
            >
              {/* Outer Orange Fire */}
              <div className="w-7 h-16 bg-gradient-to-b from-amber-400 via-orange-500 to-transparent rounded-b-full blur-xs" />
              {/* Inner Yellow Core */}
              <div className="absolute top-0 w-3.5 h-10 bg-gradient-to-b from-yellow-200 via-amber-300 to-transparent rounded-b-full" />
              {/* Blue Plasma Tip */}
              <div className="absolute top-0 w-2 h-4 bg-cyan-300 rounded-b-full opacity-90" />
            </motion.div>

            {/* Smoke / Steam Clouds at launchpad */}
            {phase === 'countdown' && (
              <div className="absolute -bottom-6 w-36 h-8 flex items-center justify-center gap-1 opacity-70 pointer-events-none">
                <div className="w-10 h-7 rounded-full bg-slate-300/40 blur-sm animate-ping" />
                <div className="w-12 h-8 rounded-full bg-slate-200/50 blur-sm" />
                <div className="w-10 h-7 rounded-full bg-slate-300/40 blur-sm animate-ping" />
              </div>
            )}
          </motion.div>

          {/* Launchpad Ground Base */}
          {phase === 'countdown' && (
            <div className="w-full h-5 bg-gradient-to-t from-slate-900 to-slate-800 border-t-2 border-slate-700 flex items-center justify-center gap-4 text-[10px] font-mono text-slate-400">
              <span>PAD-01</span>
              <span>EARTH STATION</span>
              <span>FUEL: 100%</span>
            </div>
          )}

          {/* Countdown Digit Overlay */}
          {phase === 'countdown' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
              <motion.div
                key={count}
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.4, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="text-6xl sm:text-7xl font-black text-amber-400 drop-shadow-[0_0_25px_rgba(251,191,36,0.8)]"
              >
                {count > 0 ? count : 'BLASTOFF!'}
              </motion.div>
            </div>
          )}
        </div>

        {/* Mission Status Report Card */}
        <div className="w-full p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-left space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Mission Status</span>
                <span className="text-sm font-black text-emerald-400">
                  {phase === 'landed'
                    ? 'TOUCHDOWN ACCOMPLISHED! 🚀'
                    : phase === 'orbit'
                    ? 'ORBITAL INSERTION COMPLETE'
                    : phase === 'launching'
                    ? 'ASCENDING THROUGH THE STARS...'
                    : 'FINAL COUNTDOWN IN PROGRESS'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Goal Reached</span>
              <span className="text-sm font-black text-white">
                ${goal.targetCost.toFixed(2)}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {phase === 'landed' ? (
              <span>
                Incredible work, <strong>{kid.name}</strong>! You worked hard, completed your chores, banked every coin, and officially unlocked <strong>{goal.title}</strong>! You’re ready to celebrate and make your purchase!
              </span>
            ) : (
              <span>
                Hold onto your helmet! The savings rocket is carrying your dreams to the stars!
              </span>
            )}
          </p>

          {/* Quick Stats Pill Row */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-[9px] uppercase font-bold text-slate-400">Total Saved</div>
              <div className="text-xs font-black text-emerald-400 mt-0.5">${goal.currentSaved.toFixed(2)}</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-[9px] uppercase font-bold text-slate-400">Completion</div>
              <div className="text-xs font-black text-amber-400 mt-0.5">100% Complete</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-[9px] uppercase font-bold text-slate-400">XP Awarded</div>
              <div className="text-xs font-black text-indigo-400 mt-0.5">+500 XP</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row items-center gap-2 mt-4">
          <button
            onClick={handleReplay}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Replay Blastoff! 🚀</span>
          </button>
          
          <button
            onClick={onClose}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Return to Vault</span>
          </button>
        </div>

      </div>
    </div>
  );
};
