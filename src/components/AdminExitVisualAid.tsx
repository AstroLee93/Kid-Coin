import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { playCoinSound } from '../lib/sound';

interface AdminExitVisualAidProps {
  isOpen: boolean;
  kidName: string;
  onDismiss: () => void;
}

export const AdminExitVisualAid: React.FC<AdminExitVisualAidProps> = ({
  isOpen,
  kidName,
  onDismiss,
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!isOpen) {
      setProgress(100);
      return;
    }

    playCoinSound();

    const duration = 3500;
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isOpen, onDismiss]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          id="admin-exit-visual-aid-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border-2 border-emerald-500/40 dark:border-emerald-500/30 overflow-hidden relative"
          >
            {/* Ambient emerald & amber glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none -ml-12 -mb-12" />

            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Animated Lock & Shield Graphic */}
              <motion.div 
                initial={{ rotate: -15, scale: 0.7 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                className="relative mb-4"
              >
                <div className="w-18 h-18 rounded-3xl bg-emerald-100 dark:bg-emerald-950/70 border-2 border-emerald-400 dark:border-emerald-600 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/20">
                  <Lock className="w-9 h-9" />
                </div>
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 500 }}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </motion.div>
              </motion.div>

              {/* Status Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Admin Mode Left • Kid-Safe Active</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Parental Admin Closed
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-sm">
                Administrative privileges and sensitive settings have been locked down. The app is now fully secured in child-safe mode.
              </p>

              {/* Visual Breakdown Cards */}
              <div className="w-full mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-left space-y-2">
                <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-200 font-semibold">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[11px] font-black shrink-0">
                    ✓
                  </span>
                  <span>Master admin settings & PIN changes locked</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-200 font-semibold">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[11px] font-black shrink-0">
                    ✓
                  </span>
                  <span>Protected kid view restored for <strong>{kidName}</strong></span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-200 font-semibold">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[11px] font-black shrink-0">
                    ✓
                  </span>
                  <span>Spending guardrails & chore quests active</span>
                </div>
              </div>

              {/* Dismiss Button */}
              <button
                id="admin-exit-dismiss-btn"
                onClick={onDismiss}
                className="w-full mt-5 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
              >
                <span>Continue to {kidName}'s Vault</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Auto-dismiss countdown bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-75 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
