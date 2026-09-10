import React from 'react';
import { KidProfile } from '../types';
import { INITIAL_AVATARS } from '../lib/storage';
import { ThemeOption } from '../lib/theme';
import { 
  X, 
  Sparkles, 
  SlidersHorizontal, 
  Sun, 
  Moon, 
  Palette, 
  Volume2, 
  VolumeX, 
  Bell, 
  Server, 
  Lock, 
  UserPlus, 
  Flame, 
  Check, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface AppMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  kids: KidProfile[];
  activeKid: KidProfile;
  themeConfig: ThemeOption;
  isDarkMode: boolean;
  viewMode: 'simple' | 'advanced';
  soundOn: boolean;
  isParentAdmin?: boolean;
  onOpenParentAdmin: () => void;
  onToggleSound: () => void;
  onToggleDarkMode: () => void;
  onViewModeChange: (mode: 'simple' | 'advanced') => void;
  onSelectKid: (id: string) => void;
  onOpenAddKid: () => void;
  onOpenPiModal: () => void;
  onOpenThemeModal: () => void;
  onLockVault: () => void;
  onTestNotification: () => void;
}

export const AppMenuDrawer: React.FC<AppMenuDrawerProps> = ({
  isOpen,
  onClose,
  kids,
  activeKid,
  themeConfig,
  isDarkMode,
  viewMode,
  soundOn,
  isParentAdmin,
  onOpenParentAdmin,
  onToggleSound,
  onToggleDarkMode,
  onViewModeChange,
  onSelectKid,
  onOpenAddKid,
  onOpenPiModal,
  onOpenThemeModal,
  onLockVault,
  onTestNotification,
}) => {
  if (!isOpen) return null;

  const currentAvatar = INITIAL_AVATARS.find((a) => a.id === activeKid.avatarId) || INITIAL_AVATARS[0];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Slide-over Drawer */}
      <aside className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm sm:max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-250">
          
          {/* Drawer Top Header */}
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/90">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-slate-800 dark:text-white select-none">≡</span>
              <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                Vault Menu
              </h2>
            </div>
            <button
              id="close-menu-drawer-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200/70 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Close Menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {/* 1. Active Account Summary & Kid Switcher */}
            <div className="space-y-2.5">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Active Kid Account
              </div>

              {/* Kid Card */}
              <div 
                className="p-3.5 rounded-2xl border flex items-center justify-between transition-colors"
                style={{
                  backgroundColor: isDarkMode ? themeConfig.cssVars.darkCard : themeConfig.cssVars.softLight,
                  borderColor: isDarkMode ? themeConfig.cssVars.darkBorder : themeConfig.cssVars.lightBorder,
                }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-2xl border flex items-center justify-center text-2xl shadow-xs shrink-0"
                    style={{
                      backgroundColor: isDarkMode ? themeConfig.cssVars.softDark : '#ffffff',
                      borderColor: isDarkMode ? themeConfig.cssVars.darkBorder : themeConfig.cssVars.lightBorder,
                    }}
                  >
                    {currentAvatar.emoji}
                  </div>
                  <div>
                    <div className="font-extrabold text-base text-slate-900 dark:text-white">
                      {activeKid.name}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mt-0.5">
                      <span>Age {activeKid.age}</span>
                      <span>•</span>
                      <span className="font-bold" style={{ color: themeConfig.primaryColor }}>
                        ${activeKid.totalSaved.toFixed(2)} saved
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-100 dark:bg-orange-950/70 rounded-full text-[11px] font-bold text-orange-700 dark:text-orange-400">
                    <Flame className="w-3 h-3 fill-orange-500 text-orange-500" />
                    <span>{activeKid.savingsStreakDays}d</span>
                  </div>
                  <div className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                    Lvl {activeKid.level}
                  </div>
                </div>
              </div>

              {/* Sibling Accounts & Add Kid */}
              {kids.length > 1 && (
                <div className="pt-1 space-y-1">
                  <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    Switch Sibling:
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {kids.map((k) => {
                      const av = INITIAL_AVATARS.find((a) => a.id === k.avatarId) || INITIAL_AVATARS[0];
                      const isCurrent = k.id === activeKid.id;
                      return (
                        <button
                          key={k.id}
                          onClick={() => {
                            if (!isCurrent) {
                              onSelectKid(k.id);
                              onClose();
                            }
                          }}
                          className={`px-3 py-2 rounded-xl text-left text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="text-base">{av.emoji}</span>
                          <span className="truncate">{k.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Parental Admin Portal Access Button */}
              <button
                id="drawer-parent-admin-portal-btn"
                onClick={() => {
                  onClose();
                  onOpenParentAdmin();
                }}
                className="w-full mt-2 px-3.5 py-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-black flex items-center justify-between hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🛡️</span>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span>Parental Admin Portal</span>
                      {isParentAdmin && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-600 text-white uppercase font-bold">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-normal text-indigo-600/80 dark:text-indigo-400/80">
                      Create, delete, suspend accounts & allowance
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-indigo-400" />
              </button>

              <button
                id="drawer-add-kid-btn"
                onClick={() => {
                  onClose();
                  onOpenAddKid();
                }}
                className="w-full mt-1.5 px-3 py-2 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Create Account (Parent Admin)</span>
              </button>
            </div>

            {/* 2. View Mode (Simple vs Advanced) */}
            <div className="space-y-2">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Dashboard Mode
              </div>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700">
                <button
                  id="drawer-view-simple-btn"
                  onClick={() => onViewModeChange('simple')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    viewMode === 'simple'
                      ? 'text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  style={{
                    backgroundColor: viewMode === 'simple' ? themeConfig.primaryColor : undefined,
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Kid-Friendly</span>
                  <span className="text-[10px] font-normal opacity-90">Ages 8–13</span>
                </button>

                <button
                  id="drawer-view-advanced-btn"
                  onClick={() => onViewModeChange('advanced')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    viewMode === 'advanced'
                      ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Advanced</span>
                  <span className="text-[10px] font-normal opacity-90">Graphs & Ledger</span>
                </button>
              </div>
            </div>

            {/* 3. Appearance Controls (Light/Dark & Theme Color) */}
            <div className="space-y-2">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Display & Theme
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Light/Dark Toggle */}
                <button
                  id="drawer-darkmode-toggle-btn"
                  onClick={onToggleDarkMode}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left transition-colors cursor-pointer flex flex-col justify-between h-20"
                >
                  <div className="flex items-center justify-between w-full">
                    {isDarkMode ? (
                      <Moon className="w-5 h-5" style={{ color: themeConfig.primaryColor }} />
                    ) : (
                      <Sun className="w-5 h-5" style={{ color: themeConfig.primaryColor }} />
                    )}
                    <span 
                      className="text-[10px] font-black uppercase"
                      style={{ color: themeConfig.primaryColor }}
                    >
                      {isDarkMode ? 'Dark' : 'Light'}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Color Mode</div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-300">
                      {isDarkMode ? 'Switch to Light' : 'Switch to Dark'}
                    </div>
                  </div>
                </button>

                {/* Color Palette Modal Trigger */}
                <button
                  id="drawer-theme-palette-btn"
                  onClick={() => {
                    onClose();
                    onOpenThemeModal();
                  }}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left transition-colors cursor-pointer flex flex-col justify-between h-20"
                >
                  <div className="flex items-center justify-between w-full">
                    <Palette className="w-5 h-5" style={{ color: themeConfig.primaryColor }} />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white shadow-xs"
                      style={{ backgroundColor: themeConfig.primaryColor }}
                    />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Theme & Atmosphere</div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-300 capitalize truncate">
                      {themeConfig.name}
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* 4. Preferences: Audio & Alerts */}
            <div className="space-y-2">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Preferences & Audio
              </div>

              <div className="space-y-2">
                {/* Sound Toggle */}
                <button
                  id="drawer-sound-toggle-btn"
                  onClick={onToggleSound}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      soundOn 
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                    }`}>
                      {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Sound Effects</div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300">
                        {soundOn ? 'Coin sounds & milestone fanfare enabled' : 'Muted'}
                      </div>
                    </div>
                  </div>
                  <div className={`text-xs font-black px-2 py-0.5 rounded-md ${
                    soundOn 
                      ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300' 
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {soundOn ? 'ON' : 'OFF'}
                  </div>
                </button>

                {/* Milestone Push Alert Test */}
                <button
                  id="drawer-test-notification-btn"
                  onClick={() => {
                    onTestNotification();
                    onClose();
                  }}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Test Milestone Alert</div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300">
                        Trigger sample milestone push notification
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* 5. System, Pi & Portainer */}
            <div className="space-y-2">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Offline Hardware & Sync
              </div>

              <button
                id="drawer-pi-modal-btn"
                onClick={() => {
                  onClose();
                  onOpenPiModal();
                }}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <Server className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Raspberry Pi & Portainer
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300">
                      C++ SQLCipher & Chore-Quest Compose
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

          </div>

          {/* Drawer Bottom Action: Lock Screen Vault */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <button
              id="drawer-lock-vault-btn"
              onClick={() => {
                onClose();
                onLockVault();
              }}
              className={`w-full py-3 px-4 rounded-2xl ${themeConfig.btnClass} font-black text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer`}
            >
              <Lock className="w-4 h-4" />
              <span>Lock Vault Screen (PIN Required)</span>
            </button>
            <p className="text-[10px] text-center text-slate-600 dark:text-slate-400 mt-2">
              Guards kid records with AES-256 local encrypted protection.
            </p>
          </div>

        </div>
      </aside>
    </div>
  );
};
