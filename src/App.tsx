import React, { useState, useEffect } from 'react';
import { KidProfile, SavingsGoal, ParentAdminConfig } from './types';
import { 
  loadKidsFromStorage, 
  saveKidsToStorage, 
  getActiveKidId, 
  setActiveKidId,
  loadParentAdminFromStorage,
  saveParentAdminToStorage
} from './lib/storage';
import { getSavedTheme, saveTheme, getThemeConfig, ThemeColor, applyThemeToDocument } from './lib/theme';
import { Header } from './components/Header';
import { QuickActionsBar } from './components/QuickActionsBar';
import { PinLockScreen } from './components/PinLockScreen';
import { ThemeColorModal } from './components/ThemeColorModal';
import { GoalTracker } from './components/GoalTracker';
import { CoachTips } from './components/CoachTips';
import { ChoreBountyBoard } from './components/ChoreBountyBoard';
import { TransactionLedger } from './components/TransactionLedger';
import { DataVisualization } from './components/DataVisualization';
import { BadgesAndAvatars } from './components/BadgesAndAvatars';
import { NotificationCenter } from './components/NotificationCenter';
import { AddKidModal } from './components/AddKidModal';
import { NewGoalModal } from './components/NewGoalModal';
import { PiDeploymentModal } from './components/PiDeploymentModal';
import { SimpleKidView } from './components/SimpleKidView';
import { ParentAdminPortal } from './components/ParentAdminPortal';
import { ParentPinAuthModal } from './components/ParentPinAuthModal';
import { ShieldCheck, HardDrive, Cpu, Lock } from 'lucide-react';

export default function App() {
  const [kids, setKids] = useState<KidProfile[]>(() => loadKidsFromStorage());
  const [activeKidId, setActiveKidIdState] = useState<string>(() => getActiveKidId());
  
  // Parental Admin configuration & session state
  const [parentAdmin, setParentAdmin] = useState<ParentAdminConfig>(() => loadParentAdminFromStorage());
  const [isParentAdminSessionActive, setIsParentAdminSessionActive] = useState<boolean>(false);
  const [isParentAdminPortalOpen, setIsParentAdminPortalOpen] = useState<boolean>(false);
  const [isParentAuthModalOpen, setIsParentAuthModalOpen] = useState<boolean>(false);
  const [parentAuthPurpose, setParentAuthPurpose] = useState<'portal' | 'addKid'>('portal');

  // PIN lock authentication state (required to access user's financial records)
  const [isLocked, setIsLocked] = useState<boolean>(true);

  // View mode: 'simple' (kid-friendly 8-13 focus) vs 'advanced' (parent / comprehensive)
  const [viewMode, setViewMode] = useState<'simple' | 'advanced'>(() => {
    if (typeof window === 'undefined') return 'simple';
    const saved = localStorage.getItem('kidcoin_view_mode');
    return saved === 'advanced' ? 'advanced' : 'simple';
  });

  const handleViewModeChange = (mode: 'simple' | 'advanced') => {
    setViewMode(mode);
    try {
      localStorage.setItem('kidcoin_view_mode', mode);
    } catch {
      // ignore
    }
  };

  // User-selected re-coloring theme state
  const [activeTheme, setActiveTheme] = useState<ThemeColor>(() => getSavedTheme());

  // Light / Dark mode state (defaults to bright, crisp Light Mode)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('kidcoin_dark_mode') === 'true';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('kidcoin_dark_mode', String(isDarkMode));
    } catch {
      // ignore
    }
  }, [isDarkMode]);

  // Modal controls
  const [isAddKidOpen, setIsAddKidOpen] = useState(false);
  const [isNewGoalOpen, setIsNewGoalOpen] = useState(false);
  const [isPiModalOpen, setIsPiModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    saveKidsToStorage(kids);
  }, [kids]);

  const activeKid = kids.find((k) => k.id === activeKidId) || kids[0];
  const themeConfig = getThemeConfig(activeTheme);

  // Apply theme-specific background color and CSS custom properties
  useEffect(() => {
    applyThemeToDocument(themeConfig, isDarkMode);
  }, [themeConfig, isDarkMode]);

  const handleSelectKid = (id: string) => {
    setActiveKidIdState(id);
    setActiveKidId(id);
    // Lock vault upon profile switch for privacy between siblings
    setIsLocked(true);
  };

  const handleUpdateActiveKid = (updatedKid: KidProfile) => {
    setKids((prev) => prev.map((k) => (k.id === updatedKid.id ? updatedKid : k)));
  };

  const handleUpdateKids = (newKids: KidProfile[]) => {
    setKids(newKids);
    if (!newKids.some((k) => k.id === activeKidId) && newKids.length > 0) {
      setActiveKidIdState(newKids[0].id);
      setActiveKidId(newKids[0].id);
    }
  };

  const handleUpdateKidPin = (kidId: string, newPin: string) => {
    setKids((prev) =>
      prev.map((k) => (k.id === kidId ? { ...k, pin: newPin } : k))
    );
  };

  const handleAddKid = (newKid: KidProfile) => {
    setKids((prev) => [...prev, newKid]);
    setActiveKidIdState(newKid.id);
    setActiveKidId(newKid.id);
    setIsLocked(false);
  };

  // Parental Admin Handlers
  const handleUpdateParentAdmin = (updatedConfig: ParentAdminConfig) => {
    setParentAdmin(updatedConfig);
    saveParentAdminToStorage(updatedConfig);
  };

  const handleOpenParentAdmin = () => {
    if (isParentAdminSessionActive) {
      setIsParentAdminPortalOpen(true);
    } else {
      setParentAuthPurpose('portal');
      setIsParentAuthModalOpen(true);
    }
  };

  const handleRequestAddKid = () => {
    if (isParentAdminSessionActive) {
      setIsAddKidOpen(true);
    } else {
      setParentAuthPurpose('addKid');
      setIsParentAuthModalOpen(true);
    }
  };

  const handleParentAuthSuccess = () => {
    setIsParentAdminSessionActive(true);
    setIsParentAuthModalOpen(false);
    if (parentAuthPurpose === 'portal') {
      setIsParentAdminPortalOpen(true);
    } else if (parentAuthPurpose === 'addKid') {
      setIsAddKidOpen(true);
    }
  };

  const handleDeleteKid = (kidId: string) => {
    if (kids.length <= 1) return;
    const remaining = kids.filter((k) => k.id !== kidId);
    setKids(remaining);
    if (activeKidId === kidId) {
      const nextActive = remaining[0].id;
      setActiveKidIdState(nextActive);
      setActiveKidId(nextActive);
    }
  };

  const handleToggleSuspendKid = (kidId: string, reason?: string) => {
    setKids((prev) =>
      prev.map((k) => {
        if (k.id !== kidId) return k;
        const newStatus = k.status === 'suspended' ? 'active' : 'suspended';
        return {
          ...k,
          status: newStatus,
          suspendedReason: newStatus === 'suspended' ? (reason || 'Account suspended by parent') : undefined,
        };
      })
    );
  };

  const handleSelectNewGoal = (newGoal: SavingsGoal) => {
    const updatedGoals = [newGoal, ...activeKid.goals.filter((g) => g.id !== newGoal.id)];
    handleUpdateActiveKid({
      ...activeKid,
      goals: updatedGoals,
    });
  };

  const handleImportKids = (importedKids: KidProfile[]) => {
    setKids(importedKids);
    if (importedKids.length > 0) {
      setActiveKidIdState(importedKids[0].id);
      setActiveKidId(importedKids[0].id);
      setIsLocked(true);
    }
  };

  const handleSelectTheme = (theme: ThemeColor) => {
    setActiveTheme(theme);
    saveTheme(theme);
  };

  return (
    <div 
      className={`min-h-screen ${themeConfig.pageBgClass} text-slate-900 dark:text-slate-100 font-sans antialiased p-0 m-0 w-full pb-20 lg:pb-4 transition-colors duration-300 relative`}
      style={{
        backgroundColor: isDarkMode ? themeConfig.darkBg : themeConfig.lightBg,
        backgroundImage: isDarkMode ? themeConfig.glowGradient : undefined,
      }}
    >
      {/* Toast Notification Manager & Permission Banner */}
      <NotificationCenter />

      {/* Mandatory PIN Lock Screen: guards user's personal financial information */}
      {isLocked && (
        <PinLockScreen
          kid={activeKid}
          allKids={kids}
          parentAdminPin={parentAdmin.pin}
          onUnlock={() => setIsLocked(false)}
          onUnlockParentAdmin={() => {
            setIsParentAdminSessionActive(true);
            setIsLocked(false);
            setIsParentAdminPortalOpen(true);
          }}
          onSwitchKid={(id) => {
            setActiveKidIdState(id);
            setActiveKidId(id);
          }}
          onUpdateKidPin={handleUpdateKidPin}
        />
      )}

      {/* Main App Navigation Bar (Flush layout, zero outer padding) */}
      <Header
        kids={kids}
        activeKid={activeKid}
        themeConfig={themeConfig}
        isDarkMode={isDarkMode}
        viewMode={viewMode}
        isParentAdmin={isParentAdminSessionActive}
        onOpenParentAdmin={handleOpenParentAdmin}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        onViewModeChange={handleViewModeChange}
        onSelectKid={handleSelectKid}
        onOpenAddKid={handleRequestAddKid}
        onOpenPiModal={() => setIsPiModalOpen(true)}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onLockVault={() => setIsLocked(true)}
      />

      {/* Main Content Dashboard or Parental Admin Portal */}
      {isParentAdminPortalOpen ? (
        <ParentAdminPortal
          kids={kids}
          activeKidId={activeKidId}
          parentAdmin={parentAdmin}
          themeConfig={themeConfig}
          isDarkMode={isDarkMode}
          onClose={() => setIsParentAdminPortalOpen(false)}
          onExitAdmin={() => setIsParentAdminPortalOpen(false)}
          onUpdateKids={handleUpdateKids}
          onUpdateParentAdmin={handleUpdateParentAdmin}
          onSelectKidView={(id) => {
            handleSelectKid(id);
            setIsParentAdminPortalOpen(false);
          }}
          onOpenAddKid={handleRequestAddKid}
          onDeleteKid={handleDeleteKid}
          onToggleSuspendKid={handleToggleSuspendKid}
        />
      ) : (
        <>
          {/* Quick Actions Bar (1-tap deposit, chore complete, spend, new goal) */}
          <QuickActionsBar
            kid={activeKid}
            themeConfig={themeConfig}
            onUpdateKid={handleUpdateActiveKid}
            onOpenNewGoalModal={() => setIsNewGoalOpen(true)}
          />

          {/* Main Content Dashboard */}
          <main className="w-full p-0 m-0 space-y-0">
            {viewMode === 'simple' ? (
              /* Simpler, Kid-Friendly View (ages 8-13 focus) */
              <SimpleKidView
                kid={activeKid}
                themeConfig={themeConfig}
                onUpdateKid={handleUpdateActiveKid}
                onSwitchToAdvanced={() => handleViewModeChange('advanced')}
                onOpenNewGoalModal={() => setIsNewGoalOpen(true)}
              />
            ) : (
              /* Advanced View (Graphs, Detailed Multi-Column Ledger, Portainer & Technical Analytics) */
              <>
                {/* Flagship Centerpiece: Goal Tracker with Verified MSRP & Countdown Progress Bar */}
                <GoalTracker
                  kid={activeKid}
                  themeConfig={themeConfig}
                  onUpdateKid={handleUpdateActiveKid}
                  onOpenNewGoalModal={() => setIsNewGoalOpen(true)}
                />

                {/* 2-Column Responsive Operational Grid (Zero padding, flush borders) */}
                <div className="w-full grid grid-cols-1 lg:grid-cols-12 p-0 m-0">
                  
                  {/* Left Column: Personalized Coach Tips & Chore Bounty Board (7 cols) */}
                  <div className="w-full lg:col-span-7 p-0 m-0 border-r-0 lg:border-r border-slate-200 dark:border-slate-800">
                    {/* Personalized Financial Coaching & Milestones */}
                    <CoachTips kid={activeKid} />

                    {/* Interactive Chore Bounty Board */}
                    <ChoreBountyBoard
                      kid={activeKid}
                      onUpdateKid={handleUpdateActiveKid}
                    />
                  </div>

                  {/* Right Column: Visual Progress Analytics & Encrypted Ledger (5 cols) */}
                  <div className="w-full lg:col-span-5 p-0 m-0">
                    {/* Low-Latency Data Visualizations */}
                    <DataVisualization kid={activeKid} />

                    {/* Encrypted Transaction History & Money In/Out */}
                    <TransactionLedger
                      kid={activeKid}
                      onUpdateKid={handleUpdateActiveKid}
                    />
                  </div>

                </div>

                {/* Full-Width Bottom Section: Trophy Room (Virtual Badges) & Avatar Wardrobe */}
                <BadgesAndAvatars
                  kid={activeKid}
                  onUpdateKid={handleUpdateActiveKid}
                />

                {/* Status Banner for Raspberry Pi & Encrypted Offline Mode */}
                <footer className="w-full py-3 px-2 border-t border-slate-200/80 dark:border-slate-800/80 text-center bg-white dark:bg-slate-900 m-0">
                  <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>AES-256 SQLCipher Vault</span>
                    </span>
                    <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
                    <span className="flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-amber-500" />
                      <span>PIN Security Enabled</span>
                    </span>
                    <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
                    <span className="flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5 text-sky-500" />
                      <span>Raspberry Pi Localhost</span>
                    </span>
                  </div>
                </footer>
              </>
            )}
          </main>
        </>
      )}

      {/* Modals */}
      <ThemeColorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        activeTheme={activeTheme}
        onSelectTheme={handleSelectTheme}
      />

      <AddKidModal
        isOpen={isAddKidOpen}
        onClose={() => setIsAddKidOpen(false)}
        onAddKid={handleAddKid}
      />

      <NewGoalModal
        isOpen={isNewGoalOpen}
        onClose={() => setIsNewGoalOpen(false)}
        onSelectGoal={handleSelectNewGoal}
      />

      <PiDeploymentModal
        isOpen={isPiModalOpen}
        onClose={() => setIsPiModalOpen(false)}
        kids={kids}
        onImportKids={handleImportKids}
      />

      {/* Parent Master PIN Authentication Modal */}
      <ParentPinAuthModal
        isOpen={isParentAuthModalOpen}
        parentPin={parentAdmin.pin}
        actionLabel={parentAuthPurpose === 'addKid' ? 'Create New Account' : 'Parental Admin Portal'}
        onClose={() => setIsParentAuthModalOpen(false)}
        onSuccess={handleParentAuthSuccess}
      />
    </div>
  );
}
