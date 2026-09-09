import React, { useState } from 'react';
import { KidProfile } from '../types';
import { INITIAL_AVATARS } from '../lib/storage';
import { isSoundEnabled, setSoundEnabled } from '../lib/sound';
import { sendKidNotification } from '../lib/notifications';
import { ThemeOption } from '../lib/theme';
import { AppMenuDrawer } from './AppMenuDrawer';
import { 
  Flame, 
  ChevronDown,
  UserPlus,
  Menu
} from 'lucide-react';

interface HeaderProps {
  kids: KidProfile[];
  activeKid: KidProfile;
  themeConfig: ThemeOption;
  isDarkMode: boolean;
  viewMode: 'simple' | 'advanced';
  onToggleDarkMode: () => void;
  onViewModeChange: (mode: 'simple' | 'advanced') => void;
  onSelectKid: (id: string) => void;
  onOpenAddKid: () => void;
  onOpenPiModal: () => void;
  onOpenThemeModal: () => void;
  onLockVault: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  kids,
  activeKid,
  themeConfig,
  isDarkMode,
  viewMode,
  onToggleDarkMode,
  onViewModeChange,
  onSelectKid,
  onOpenAddKid,
  onOpenPiModal,
  onOpenThemeModal,
  onLockVault,
}) => {
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };

  const currentAvatar = INITIAL_AVATARS.find((a) => a.id === activeKid.avatarId) || INITIAL_AVATARS[0];

  const handleTestNotification = () => {
    sendKidNotification(
      '🎉 Milestone Alert: $250 Saved!',
      `Great job ${activeKid.name}! You just crossed 50% toward your ${activeKid.goals[0]?.title || 'goal'}!`,
      'milestone'
    );
  };

  return (
    <>
      <header className={`w-full ${themeConfig.headerBgClass} backdrop-blur-md sticky top-0 z-30 shadow-xs p-0 m-0 transition-colors duration-250`}>
        <div className="w-full px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3">
          
          {/* Left: Logo & Offline Indicator */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs font-black text-lg tracking-tight shrink-0"
              style={{ backgroundColor: themeConfig.primaryColor }}
            >
              🪙
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">
                  KidCoin Vault
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  Offline
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 hidden sm:block">
                Encrypted Kid Finance • Raspberry Pi
              </p>
            </div>
          </div>

          {/* Center: Kid Account Display & Quick Switcher */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                id="kid-selector-dropdown-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                <span className="text-base">{currentAvatar.emoji}</span>
                <span className="truncate max-w-[100px] sm:max-w-none">{activeKid.name}'s Vault</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
              </button>

              {dropdownOpen && (
                <div 
                  id="kid-selector-menu" 
                  className="absolute left-1/2 -translate-x-1/2 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-40"
                >
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Switch Kid Account
                  </div>
                  {kids.map((k) => {
                    const av = INITIAL_AVATARS.find((a) => a.id === k.avatarId) || INITIAL_AVATARS[0];
                    const isCurrent = k.id === activeKid.id;
                    return (
                      <button
                        key={k.id}
                        id={`switch-kid-${k.id}`}
                        onClick={() => {
                          onSelectKid(k.id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left flex items-center justify-between text-sm transition-colors ${
                          isCurrent 
                            ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-semibold' 
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{av.emoji}</span>
                          <div>
                            <div>{k.name}</div>
                            <div className="text-[11px] text-slate-600 dark:text-slate-300 font-normal">
                              ${k.totalSaved.toFixed(2)} saved
                            </div>
                          </div>
                        </div>
                        {isCurrent && <span className="text-xs bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 px-1.5 py-0.5 rounded-md font-bold">Active</span>}
                      </button>
                    );
                  })}
                  <div className="border-t border-slate-100 dark:border-slate-700/80 my-1 pt-1">
                    <button
                      id="add-kid-btn"
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenAddKid();
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Add New Kid Account</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Savings Streak Badge */}
            <div 
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/60 rounded-full text-xs font-bold text-orange-700 dark:text-orange-300"
              title={`${activeKid.savingsStreakDays}-day savings streak!`}
            >
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
              <span>{activeKid.savingsStreakDays}d Streak</span>
            </div>
          </div>

          {/* Right: The Single "≡" Menu Button (Replaces all stand-alone icons) */}
          <div className="flex items-center">
            <button
              id="main-app-menu-btn"
              onClick={() => setMenuDrawerOpen(true)}
              className={`flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2 rounded-2xl ${themeConfig.btnClass} font-extrabold text-sm shadow-xs transition-all cursor-pointer select-none`}
              title="Open Vault Menu (≡)"
              aria-label="Open Menu"
            >
              <span className="text-xl font-black leading-none select-none">≡</span>
              <span className="hidden sm:inline text-xs font-black tracking-wider uppercase">Menu</span>
            </button>
          </div>

        </div>
      </header>

      {/* Slide-out Menu Drawer with all individual functionalities organized cleanly */}
      <AppMenuDrawer
        isOpen={menuDrawerOpen}
        onClose={() => setMenuDrawerOpen(false)}
        kids={kids}
        activeKid={activeKid}
        themeConfig={themeConfig}
        isDarkMode={isDarkMode}
        viewMode={viewMode}
        soundOn={soundOn}
        onToggleSound={toggleSound}
        onToggleDarkMode={onToggleDarkMode}
        onViewModeChange={onViewModeChange}
        onSelectKid={onSelectKid}
        onOpenAddKid={onOpenAddKid}
        onOpenPiModal={onOpenPiModal}
        onOpenThemeModal={onOpenThemeModal}
        onLockVault={onLockVault}
        onTestNotification={handleTestNotification}
      />
    </>
  );
};
