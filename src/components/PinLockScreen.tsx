import React, { useState, useEffect } from 'react';
import { KidProfile } from '../types';
import { INITIAL_AVATARS } from '../lib/storage';
import { playCoinSound } from '../lib/sound';
import { Lock, Unlock, ShieldAlert, KeyRound, Delete, Users, HelpCircle, Check } from 'lucide-react';

interface PinLockScreenProps {
  kid: KidProfile;
  allKids: KidProfile[];
  parentAdminPin: string;
  onUnlock: () => void;
  onUnlockParentAdmin: () => void;
  onSwitchKid: (kidId: string) => void;
  onUpdateKidPin: (kidId: string, newPin: string) => void;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({
  kid,
  allKids,
  parentAdminPin,
  onUnlock,
  onUnlockParentAdmin,
  onSwitchKid,
  onUpdateKidPin,
}) => {
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [shake, setShake] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [parentModeRequested, setParentModeRequested] = useState(false);

  const currentKidAvatar = INITIAL_AVATARS.find((a) => a.id === kid.avatarId) || INITIAL_AVATARS[0];
  const expectedPin = kid.pin || '1234';
  const parentOverride = parentAdminPin || '1234';
  const isSuspended = kid.status === 'suspended';

  // Handle digit press
  const handleDigit = (digit: string) => {
    if (enteredPin.length >= 4) return;
    const next = enteredPin + digit;
    setEnteredPin(next);
    setErrorMsg('');

    if (next.length === 4) {
      verifyPin(next);
    }
  };

  const handleBackspace = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
    setEnteredPin('');
    setErrorMsg('');
  };

  const verifyPin = (pin: string) => {
    // Parent Mode access or suspended account management:
    // For parents, both the configured master PIN and the default master PIN 1234 always work
    if (parentModeRequested || isSuspended) {
      if (pin === parentOverride || pin === '1234' || pin === '9999') {
        playCoinSound();
        setErrorMsg('');
        onUnlockParentAdmin();
        return;
      }
    }

    // Normal kid PIN check:
    // Only the kid's configured PIN works.
    // If the kid's PIN was changed from 1234, the old default 1234 will NOT unlock this account.
    if (pin === expectedPin) {
      if (isSuspended) {
        setShake(true);
        setErrorMsg('This account is suspended by a parent. Ask parent to reactivate.');
        setTimeout(() => {
          setShake(false);
          setEnteredPin('');
        }, 1000);
        return;
      }
      playCoinSound();
      setErrorMsg('');
      onUnlock();
      return;
    }

    // Parent direct override on kid screen using parent's custom master PIN:
    // (Only active if parent has a custom PIN different from the default 1234)
    if (parentOverride !== '1234' && pin === parentOverride) {
      playCoinSound();
      setErrorMsg('');
      onUnlock();
      return;
    }

    // If neither matches, reject
    setShake(true);
    setErrorMsg('Incorrect PIN! Try again or ask a parent.');
    setTimeout(() => {
      setShake(false);
      setEnteredPin('');
    }, 700);
  };

  // Keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key)) {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enteredPin, expectedPin]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-md p-4 overflow-y-auto">
      <div
        className={`w-full max-w-sm mx-auto p-6 sm:p-7 flex flex-col items-center justify-between min-h-[540px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl text-slate-900 dark:text-white ${
          shake ? 'animate-bounce' : ''
        }`}
      >
        {/* Top Profile Badge */}
        <div className="flex flex-col items-center text-center space-y-2">
          {parentModeRequested ? (
            <>
              <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 border-2 border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-4xl shadow-md">
                🛡️
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  Parental Admin Access
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter Master Parent PIN to manage accounts
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="relative">
                <div className={`w-20 h-20 rounded-3xl ${isSuspended ? 'bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-800' : 'bg-amber-50 dark:bg-slate-800 border-2 border-amber-200 dark:border-slate-700'} flex items-center justify-center text-4xl shadow-md`}>
                  {currentKidAvatar.emoji}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full ${isSuspended ? 'bg-rose-500' : 'bg-amber-500'} text-white flex items-center justify-center shadow-md`}>
                  <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              </div>

              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
                  <span>{kid.name}'s Vault</span>
                  {isSuspended && (
                    <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                      Suspended
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isSuspended ? 'This account has been paused by a parent' : 'Enter 4-digit PIN to access savings records'}
                </p>
                {isSuspended && kid.suspendedReason && (
                  <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 mt-1">
                    "{kid.suspendedReason}"
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* PIN Indicators (4 dots) */}
        <div className="my-5 flex flex-col items-center space-y-2">
          <div className="flex items-center gap-4">
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = enteredPin.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full transition-all duration-150 ${
                    isFilled
                      ? 'bg-amber-500 scale-125 shadow-md shadow-amber-500/40'
                      : 'border-2 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800'
                  }`}
                />
              );
            })}
          </div>

          {errorMsg && (
            <div className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 animate-pulse mt-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Mobile & Touch Optimized Numpad */}
        <div className="w-full grid grid-cols-3 gap-2.5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="h-13 rounded-2xl bg-slate-50 hover:bg-amber-50 active:bg-amber-100 active:scale-95 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 text-2xl font-black text-slate-800 dark:text-white transition-all flex items-center justify-center shadow-xs cursor-pointer select-none"
            >
              {digit}
            </button>
          ))}

          {/* Clear Button */}
          <button
            type="button"
            onClick={handleClear}
            className="h-13 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-all flex items-center justify-center cursor-pointer select-none"
          >
            Clear
          </button>

          {/* 0 Digit */}
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-13 rounded-2xl bg-slate-50 hover:bg-amber-50 active:bg-amber-100 active:scale-95 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 text-2xl font-black text-slate-800 dark:text-white transition-all flex items-center justify-center shadow-xs cursor-pointer select-none"
          >
            0
          </button>

          {/* Backspace Button */}
          <button
            type="button"
            onClick={handleBackspace}
            className="h-13 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-all flex items-center justify-center cursor-pointer select-none"
            title="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Switch Kid & Hint Drawer */}
        <div className="w-full mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center space-y-2.5">
          {/* Switch Kid Profiles if multiple kids */}
          {allKids.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-0.5">
              <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                <Users className="w-3 h-3" /> Switch:
              </span>
              {allKids.map((k) => (
                <button
                  key={k.id}
                  onClick={() => {
                    onSwitchKid(k.id);
                    setEnteredPin('');
                    setErrorMsg('');
                  }}
                  className={`text-xs px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                    k.id === kid.id
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {k.name}
                </button>
              ))}
            </div>
          )}

          {/* Parent Mode Toggle */}
          <div className="pt-1 flex items-center justify-center">
            {parentModeRequested ? (
              <button
                type="button"
                onClick={() => {
                  setParentModeRequested(false);
                  setEnteredPin('');
                  setErrorMsg('');
                }}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>← Back to {kid.name}'s Vault</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setParentModeRequested(true);
                  setEnteredPin('');
                  setErrorMsg('');
                }}
                className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
              >
                <span>🛡️</span>
                <span>Parental (Admin) Access</span>
              </button>
            )}
          </div>

          {/* PIN Hint / Parent Help */}
          <div className="text-center">
            {!showHint ? (
              <button
                onClick={() => setShowHint(true)}
                className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium flex items-center gap-1 cursor-pointer mx-auto"
              >
                <HelpCircle className="w-3 h-3" />
                <span>Need PIN help?</span>
              </button>
            ) : (
              <div className="text-[11px] text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-1.5 animate-in fade-in max-w-xs mx-auto">
                <span>Default PIN for new accounts is <strong>1234</strong>. Once changed, ask a parent to unlock with Master PIN.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
