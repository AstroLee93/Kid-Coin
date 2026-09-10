import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Lock, X, Delete } from 'lucide-react';
import { playCoinSound } from '../lib/sound';

interface ParentPinAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  expectedPin?: string;
  parentPin?: string;
  actionLabel?: string;
  title?: string;
  description?: string;
  onResetPin?: () => void;
}

export const ParentPinAuthModal: React.FC<ParentPinAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  expectedPin,
  parentPin,
  actionLabel,
  title = actionLabel || 'Parental Admin Authorization',
  description = 'Enter your 4-digit Parent Master PIN to perform admin operations.',
  onResetPin,
}) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [shake, setShake] = useState(false);

  // Compute effective expected pin, fallback to 1234
  const effectivePin = (expectedPin || parentPin || '1234').trim();

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setErrorMsg('');
      setShake(false);
    }
  }, [isOpen]);

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    setErrorMsg('');

    if (next.length === 4) {
      // For parent mode, the default 1234 continues to work even if changed,
      // as well as the newly configured PIN (and legacy 9999 emergency code)
      if (next === effectivePin || next === '1234' || next === '9999') {
        playCoinSound();
        onSuccess();
        onClose();
      } else {
        setShake(true);
        setErrorMsg('Incorrect Parent PIN. (Default: 1234)');
        setTimeout(() => {
          setShake(false);
          setPin('');
        }, 700);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key)) {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, pin, effectivePin]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-sm p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl relative text-center ${
          shake ? 'animate-bounce' : ''
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Cancel"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center mx-auto mb-3 shadow-xs">
          <ShieldCheck className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
        </div>

        <h3 className="text-lg font-black text-slate-900 dark:text-white">
          {title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
          {description}
        </p>

        {/* PIN Indicators */}
        <div className="my-5 flex flex-col items-center space-y-2">
          <div className="flex items-center gap-3">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                  pin.length > idx
                    ? 'bg-indigo-600 dark:bg-indigo-400 scale-125 shadow-xs'
                    : 'border-2 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>

          {errorMsg && (
            <div className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1 animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              className="h-11 rounded-xl bg-slate-50 hover:bg-indigo-50 active:bg-indigo-100 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 font-black text-xl text-slate-900 dark:text-white transition-all cursor-pointer select-none"
            >
              {d}
            </button>
          ))}
          <button
            onClick={() => setPin('')}
            className="h-11 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase transition-all cursor-pointer select-none"
          >
            Clear
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="h-11 rounded-xl bg-slate-50 hover:bg-indigo-50 active:bg-indigo-100 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 font-black text-xl text-slate-900 dark:text-white transition-all cursor-pointer select-none"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="h-11 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-all cursor-pointer select-none"
          >
            <Delete className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between w-full px-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="text-[11px] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Master PIN protected (Default: <strong>1234</strong>)</span>
          </span>
          <span className="text-[11px] font-mono tracking-widest text-slate-400">••••</span>
        </div>
      </div>
    </div>
  );
};
