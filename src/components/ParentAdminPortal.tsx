import React, { useState } from 'react';
import { KidProfile, ParentAdminConfig, Chore } from '../types';
import { ThemeOption } from '../lib/theme';
import { INITIAL_AVATARS, DEFAULT_PARENT_ADMIN } from '../lib/storage';
import { playCoinSound } from '../lib/sound';
import { sendKidNotification } from '../lib/notifications';
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  PauseCircle,
  PlayCircle,
  Edit3,
  DollarSign,
  Calendar,
  Sparkles,
  Award,
  KeyRound,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  Users,
  Settings,
  Download,
  ArrowRight,
  Eye,
  Plus,
  RefreshCw,
  X,
  Info
} from 'lucide-react';

interface ParentAdminPortalProps {
  kids: KidProfile[];
  parentAdmin?: ParentAdminConfig;
  adminConfig?: ParentAdminConfig;
  themeConfig: ThemeOption;
  isDarkMode?: boolean;
  activeKidId?: string;
  onUpdateKids: (kids: KidProfile[]) => void;
  onUpdateParentAdmin?: (config: ParentAdminConfig) => void;
  onUpdateAdminConfig?: (config: ParentAdminConfig) => void;
  onOpenAddKid: () => void;
  onSelectKidView?: (kidId: string) => void;
  onSelectKid?: (kidId: string) => void;
  onExitAdmin?: () => void;
  onClose?: () => void;
  onDeleteKid?: (kidId: string) => void;
  onToggleSuspendKid?: (kidId: string, reason?: string) => void;
}

export const ParentAdminPortal: React.FC<ParentAdminPortalProps> = ({
  kids,
  parentAdmin: propParentAdmin,
  adminConfig,
  themeConfig,
  isDarkMode = false,
  onUpdateKids,
  onUpdateParentAdmin: propOnUpdateParentAdmin,
  onUpdateAdminConfig,
  onOpenAddKid,
  onSelectKidView: propOnSelectKidView,
  onSelectKid,
  onExitAdmin: propOnExitAdmin,
  onClose,
}) => {
  const parentAdmin: ParentAdminConfig = {
    ...DEFAULT_PARENT_ADMIN,
    ...(propParentAdmin || adminConfig || {}),
  };
  const onExitAdmin = propOnExitAdmin || onClose || (() => {});
  const onSelectKidView = propOnSelectKidView || onSelectKid || (() => {});
  const onUpdateParentAdmin = propOnUpdateParentAdmin || onUpdateAdminConfig || (() => {});

  // Tabs: 'accounts' | 'allowance' | 'chores' | 'security'
  const [activeTab, setActiveTab] = useState<'accounts' | 'allowance' | 'chores' | 'security'>('accounts');

  // Modal states
  const [suspendKidModal, setSuspendKidModal] = useState<KidProfile | null>(null);
  const [suspendReason, setSuspendReason] = useState('Temporary parental hold');

  const [deleteKidModal, setDeleteKidModal] = useState<KidProfile | null>(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');

  const [adjustBalanceModal, setAdjustBalanceModal] = useState<KidProfile | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [adjustReason, setAdjustReason] = useState('Parent Allowance Bonus');

  const [editKidModal, setEditKidModal] = useState<KidProfile | null>(null);
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState(8);
  const [editAllowance, setEditAllowance] = useState('10.00');
  const [editAllowanceDay, setEditAllowanceDay] = useState('Sunday');
  const [editPin, setEditPin] = useState('1234');
  const [editSpendingLimit, setEditSpendingLimit] = useState('25.00');

  // Security pin change state
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Stats
  const totalFamilySaved = kids.reduce((sum, k) => sum + k.totalSaved, 0);
  const totalFamilyCash = kids.reduce((sum, k) => sum + k.availableCash, 0);
  const totalWeeklyAllowance = kids.reduce((sum, k) => (k.status !== 'suspended' ? sum + k.weeklyAllowance : sum), 0);
  const activeCount = kids.filter((k) => k.status !== 'suspended').length;
  const suspendedCount = kids.filter((k) => k.status === 'suspended').length;

  // 1. Suspend Account Handler
  const handleConfirmSuspend = () => {
    if (!suspendKidModal) return;
    const isCurrentlySuspended = suspendKidModal.status === 'suspended';
    const updatedKids = kids.map((k) => {
      if (k.id === suspendKidModal.id) {
        return {
          ...k,
          status: (isCurrentlySuspended ? 'active' : 'suspended') as 'active' | 'suspended',
          suspendedReason: isCurrentlySuspended ? undefined : suspendReason,
          suspendedAt: isCurrentlySuspended ? undefined : new Date().toISOString(),
        };
      }
      return k;
    });

    onUpdateKids(updatedKids);
    sendKidNotification(
      isCurrentlySuspended ? 'Vault Reactivated' : 'Vault Suspended',
      isCurrentlySuspended
        ? `${suspendKidModal.name}'s account has been reactivated.`
        : `${suspendKidModal.name}'s account has been suspended (${suspendReason}).`,
      'security'
    );
    setSuspendKidModal(null);
  };

  // 2. Delete Account Handler
  const handleConfirmDelete = () => {
    if (!deleteKidModal) return;
    if (deleteConfirmInput.trim().toLowerCase() !== deleteKidModal.name.trim().toLowerCase()) {
      return;
    }

    const updatedKids = kids.filter((k) => k.id !== deleteKidModal.id);
    onUpdateKids(updatedKids);
    sendKidNotification(
      'Account Deleted',
      `${deleteKidModal.name}'s vault account has been permanently removed by parent admin.`,
      'security'
    );
    setDeleteKidModal(null);
    setDeleteConfirmInput('');
  };

  // 3. Edit Kid Details Handler
  const handleSaveKidEdit = () => {
    if (!editKidModal) return;
    const parsedAge = parseInt(String(editAge), 10) || editKidModal.age;
    const parsedAllowance = parseFloat(editAllowance) || editKidModal.weeklyAllowance;
    const parsedLimit = parseFloat(editSpendingLimit) || 25;

    const updatedKids = kids.map((k) => {
      if (k.id === editKidModal.id) {
        return {
          ...k,
          name: editName.trim() || k.name,
          age: parsedAge,
          weeklyAllowance: parsedAllowance,
          allowanceDay: editAllowanceDay,
          pin: editPin.trim() || k.pin || '1234',
          spendingLimitPerWeek: parsedLimit,
        };
      }
      return k;
    });

    onUpdateKids(updatedKids);
    setEditKidModal(null);
  };

  // 4. Manual Balance Adjustment
  const handleApplyBalanceAdjustment = () => {
    if (!adjustBalanceModal) return;
    const amt = parseFloat(adjustAmount);
    if (!amt || amt <= 0) return;

    const isCredit = adjustType === 'credit';
    const delta = isCredit ? amt : -amt;

    const updatedKids = kids.map((k) => {
      if (k.id === adjustBalanceModal.id) {
        const nextSaved = Math.max(0, k.totalSaved + delta);
        const nextCash = isCredit ? k.availableCash + amt : Math.max(0, k.availableCash - amt);

        const newTx = {
          id: `tx-admin-${Date.now()}`,
          kidId: k.id,
          type: (isCredit ? 'deposit' : 'withdrawal') as 'deposit' | 'withdrawal',
          amount: amt,
          category: (isCredit ? 'gift' : 'other') as any,
          description: `[Parent Admin] ${adjustReason}`,
          date: new Date().toISOString().split('T')[0],
          goalContribution: k.goals[0]?.id,
        };

        return {
          ...k,
          totalSaved: nextSaved,
          availableCash: nextCash,
          transactions: [newTx, ...k.transactions],
        };
      }
      return k;
    });

    onUpdateKids(updatedKids);
    playCoinSound();
    sendKidNotification(
      isCredit ? 'Parent Balance Credit' : 'Parent Balance Deduction',
      `Parent admin ${isCredit ? 'added' : 'deducted'} $${amt.toFixed(2)} to ${adjustBalanceModal.name}'s vault (${adjustReason}).`,
      'allowance'
    );
    setAdjustBalanceModal(null);
    setAdjustAmount('');
  };

  // 5. Automated Weekly Allowance Payout for all Active Kids
  const handleRunFamilyAllowancePayout = () => {
    let totalPaid = 0;
    const updatedKids = kids.map((k) => {
      if (k.status === 'suspended' || k.weeklyAllowance <= 0) return k;

      totalPaid += k.weeklyAllowance;
      const newTx = {
        id: `tx-allowance-${Date.now()}-${k.id}`,
        kidId: k.id,
        type: 'deposit' as const,
        amount: k.weeklyAllowance,
        category: 'allowance' as const,
        description: `Weekly allowance automatic payout (${k.allowanceDay})`,
        date: new Date().toISOString().split('T')[0],
        goalContribution: k.goals[0]?.id,
      };

      return {
        ...k,
        totalSaved: k.totalSaved + k.weeklyAllowance,
        availableCash: k.availableCash + k.weeklyAllowance,
        transactions: [newTx, ...k.transactions],
      };
    });

    onUpdateKids(updatedKids);
    playCoinSound();
    sendKidNotification(
      'Family Allowance Payout Completed! 💸',
      `Successfully deposited weekly allowance to all ${activeCount} active kid vaults (Total paid: $${totalPaid.toFixed(2)}).`,
      'allowance'
    );
  };

  // 6. "Bank of Mom & Dad" Compound Savings Interest Bonus (e.g. 5%)
  const handleApplyMonthlyInterest = () => {
    const rate = (parentAdmin.interestRateMonthlyPercent || 5) / 100;
    let totalInterest = 0;

    const updatedKids = kids.map((k) => {
      if (k.status === 'suspended' || k.totalSaved <= 0) return k;
      const interestEarned = Math.round(k.totalSaved * rate * 100) / 100;
      if (interestEarned < 0.25) return k; // minimum 25 cents

      totalInterest += interestEarned;
      const newTx = {
        id: `tx-interest-${Date.now()}-${k.id}`,
        kidId: k.id,
        type: 'deposit' as const,
        amount: interestEarned,
        category: 'gift' as const,
        description: `Bank of Mom & Dad ${parentAdmin.interestRateMonthlyPercent}% Monthly Savings Interest!`,
        date: new Date().toISOString().split('T')[0],
        goalContribution: k.goals[0]?.id,
      };

      return {
        ...k,
        totalSaved: k.totalSaved + interestEarned,
        availableCash: k.availableCash + interestEarned,
        transactions: [newTx, ...k.transactions],
      };
    });

    onUpdateKids(updatedKids);
    playCoinSound();
    sendKidNotification(
      'Interest Bonus Paid! 📈',
      `Paid ${parentAdmin.interestRateMonthlyPercent}% interest ($${totalInterest.toFixed(2)} total) to reward kids for keeping money saved!`,
      'milestone'
    );
  };

  // 7. Update Parent Master PIN
  const handleChangeParentPin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeMsg(null);

    if (currentPinInput !== parentAdmin.pin) {
      setPinChangeMsg({ type: 'error', text: 'Current Parent PIN is incorrect.' });
      return;
    }
    if (newPinInput.length < 4 || newPinInput.length > 6) {
      setPinChangeMsg({ type: 'error', text: 'New PIN must be 4 to 6 digits.' });
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setPinChangeMsg({ type: 'error', text: 'New PIN and confirmation do not match.' });
      return;
    }

    onUpdateParentAdmin({
      ...parentAdmin,
      pin: newPinInput,
      lastLoginAt: new Date().toISOString(),
    });

    setPinChangeMsg({ type: 'success', text: 'Parent Master PIN updated successfully!' });
    setCurrentPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      
      {/* 🛡️ TOP ADMIN HERO BANNER */}
      <div 
        className="rounded-3xl p-6 sm:p-8 border shadow-lg relative overflow-hidden transition-all text-white"
        style={{
          background: isDarkMode
            ? 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)'
            : 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)',
          borderColor: isDarkMode ? '#3730a3' : '#4338ca',
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-3xl shadow-inner shrink-0">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-400/20 border border-indigo-400/30 text-[11px] font-black uppercase tracking-wider text-indigo-200">
                  Parental Admin Mode
                </span>
                <span className="text-xs text-indigo-200 font-medium">
                  Full Authority & Account Governance
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
                Parental Control & Family Command Center
              </h1>
              <p className="text-xs sm:text-sm text-indigo-200/90 mt-1 max-w-2xl">
                Only this Parental(Admin) account can create new kid accounts, delete profiles, suspend accounts, and regulate allowance payouts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              id="admin-create-account-btn"
              onClick={onOpenAddKid}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Create Kid Account</span>
            </button>

            <button
              onClick={onExitAdmin}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/20 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Return to Kid View</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Family Key Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-indigo-500/30">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-200">
              Family Total Saved
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-0.5">
              ${totalFamilySaved.toFixed(2)}
            </div>
            <div className="text-[10px] text-indigo-300 mt-0.5">
              Across {kids.length} total accounts
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-200">
              Weekly Allowance
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-300 mt-0.5">
              ${totalWeeklyAllowance.toFixed(2)}
            </div>
            <div className="text-[10px] text-indigo-300 mt-0.5">
              Scheduled weekly payout
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-200">
              Account Status
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-0.5">
              {activeCount} <span className="text-sm font-bold text-emerald-300">Active</span>
            </div>
            <div className="text-[10px] text-rose-300 mt-0.5">
              {suspendedCount > 0 ? `${suspendedCount} Suspended` : '0 Suspended'}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-200">
              Parent Master PIN
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300 mt-0.5 font-mono">
              ••••
            </div>
            <div className="text-[10px] text-indigo-300 mt-0.5">
              AES-256 protected
            </div>
          </div>
        </div>
      </div>

      {/* 🧭 NAVIGATION TABS FOR ADMIN */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'accounts'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Accounts Management ({kids.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('allowance')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'allowance'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Allowance & Interest</span>
        </button>

        <button
          onClick={() => setActiveTab('chores')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'chores'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Chore Approvals & Bounties</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Parent Security & PIN</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ACCOUNTS GOVERNANCE (CREATE, DELETE, SUSPEND, EDIT)                 */}
      {/* ========================================================================= */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Family Kid Accounts
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Grant access, suspend privileges, adjust balances, or change kid PINs.
              </p>
            </div>

            <button
              onClick={onOpenAddKid}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Create New Account</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {kids.map((kid) => {
              const av = INITIAL_AVATARS.find((a) => a.id === kid.avatarId) || INITIAL_AVATARS[0];
              const isSuspended = kid.status === 'suspended';

              return (
                <div
                  key={kid.id}
                  className={`p-5 rounded-3xl border transition-all ${
                    isSuspended
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Kid Identity & Status */}
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-3xl shrink-0 shadow-xs">
                        {av.emoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black text-slate-900 dark:text-white">
                            {kid.name}
                          </h3>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                            (Age {kid.age})
                          </span>
                          {isSuspended ? (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                              <PauseCircle className="w-3 h-3" />
                              <span>Suspended</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Active</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                          <span>
                            Vault PIN: <strong className="font-mono text-slate-800 dark:text-slate-200">{kid.pin || '1234'}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Allowance: <strong className="text-slate-800 dark:text-slate-200">${kid.weeklyAllowance.toFixed(2)}/wk ({kid.allowanceDay})</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Primary Goal: <strong className="text-slate-800 dark:text-slate-200">{kid.goals[0]?.title || 'None'}</strong>
                          </span>
                        </div>

                        {isSuspended && kid.suspendedReason && (
                          <div className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Reason: {kid.suspendedReason}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Balance summary */}
                    <div className="flex items-center gap-4 py-2 lg:py-0 border-y lg:border-y-0 border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="text-[10px] font-bold uppercase text-slate-400">Total Saved</div>
                        <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                          ${kid.totalSaved.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase text-slate-400">Cash Available</div>
                        <div className="text-xl font-black text-slate-800 dark:text-slate-200">
                          ${kid.availableCash.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase text-slate-400">Streak</div>
                        <div className="text-xl font-black text-orange-500">
                          {kid.savingsStreakDays}d
                        </div>
                      </div>
                    </div>

                    {/* Admin Action Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* View as Kid */}
                      <button
                        onClick={() => onSelectKidView(kid.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Open kid view"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>

                      {/* Adjust Balance */}
                      <button
                        onClick={() => {
                          setAdjustBalanceModal(kid);
                          setAdjustAmount('10.00');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-100 transition-colors cursor-pointer"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Adjust</span>
                      </button>

                      {/* Edit Kid Profile */}
                      <button
                        onClick={() => {
                          setEditKidModal(kid);
                          setEditName(kid.name);
                          setEditAge(kid.age);
                          setEditAllowance(kid.weeklyAllowance.toFixed(2));
                          setEditAllowanceDay(kid.allowanceDay);
                          setEditPin(kid.pin || '1234');
                          setEditSpendingLimit(String(kid.spendingLimitPerWeek || 25));
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold text-xs flex items-center gap-1.5 hover:bg-indigo-100 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {/* Suspend / Resume Button */}
                      <button
                        onClick={() => {
                          setSuspendKidModal(kid);
                          setSuspendReason(
                            isSuspended
                              ? 'Reactivating vault'
                              : 'Screen-time hold or behavioral review'
                          );
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-colors cursor-pointer ${
                          isSuspended
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100'
                        }`}
                      >
                        {isSuspended ? (
                          <>
                            <PlayCircle className="w-3.5 h-3.5" />
                            <span>Reactivate</span>
                          </>
                        ) : (
                          <>
                            <PauseCircle className="w-3.5 h-3.5" />
                            <span>Suspend</span>
                          </>
                        )}
                      </button>

                      {/* Delete Button (Only Admin) */}
                      {kids.length > 1 && (
                        <button
                          onClick={() => {
                            setDeleteKidModal(kid);
                            setDeleteConfirmInput('');
                          }}
                          className="p-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-800 transition-colors cursor-pointer"
                          title="Delete Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ALLOWANCE & COMPOUND INTEREST AUTOMATION                            */}
      {/* ========================================================================= */}
      {activeTab === 'allowance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Allowance Automation Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Family Allowance Automation
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total committed: <strong>${totalWeeklyAllowance.toFixed(2)}/week</strong>
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              When triggered, each non-suspended kid receives their scheduled allowance deposit directly into their vault, logging a transaction to their ledger.
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="font-bold text-slate-700 dark:text-slate-200">Active Recipients:</div>
              {kids.map((k) => (
                <div key={k.id} className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">
                    {k.name} ({k.allowanceDay}):
                  </span>
                  <span className={`font-mono font-bold ${k.status === 'suspended' ? 'text-slate-400 line-through' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    ${k.weeklyAllowance.toFixed(2)} {k.status === 'suspended' ? '(Suspended)' : ''}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={handleRunFamilyAllowancePayout}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>⚡ Pay Weekly Allowance to All Active Kids Now</span>
            </button>
          </div>

          {/* "Bank of Mom & Dad" Savings Interest */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  "Bank of Mom & Dad" Interest
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Teach compound growth: <strong>{parentAdmin.interestRateMonthlyPercent || 5}% Monthly Yield</strong>
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Financial experts recommend paying kids a monthly interest bonus (e.g. 5% or 10%) on their total saved balance to teach the powerful habit of delayed gratification.
            </p>

            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Monthly Yield:
              </label>
              <select
                value={parentAdmin.interestRateMonthlyPercent || 5}
                onChange={(e) => {
                  onUpdateParentAdmin({
                    ...parentAdmin,
                    interestRateMonthlyPercent: parseFloat(e.target.value) || 5,
                  });
                }}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-800 dark:text-white cursor-pointer"
              >
                <option value={3}>3% Monthly</option>
                <option value={5}>5% Monthly (Recommended)</option>
                <option value={10}>10% Monthly (High Reward)</option>
              </select>
            </div>

            <button
              onClick={handleApplyMonthlyInterest}
              className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              <span>📈 Apply Monthly Savings Interest ({parentAdmin.interestRateMonthlyPercent || 5}%)</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CHORE BOUNTIES & VERIFICATION                                      */}
      {/* ========================================================================= */}
      {activeTab === 'chores' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>🧹 Family Chore Bounties</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Review assigned chores across all children. Toggle completion or adjust rewards.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {kids.flatMap((k) =>
              k.chores.map((chore) => (
                <div
                  key={`${k.id}-${chore.id}`}
                  className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 ${
                    chore.completed
                      ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 opacity-70'
                      : 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400">
                        Assignee: {k.name}
                      </span>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                        +${chore.rewardAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                      {chore.title}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[10px] text-slate-500">
                      {chore.completed ? '✅ Completed' : '⏳ Pending completion'}
                    </span>
                    <button
                      onClick={() => {
                        const updatedKids = kids.map((kidItem) => {
                          if (kidItem.id === k.id) {
                            return {
                              ...kidItem,
                              chores: kidItem.chores.map((c) =>
                                c.id === chore.id ? { ...c, completed: !c.completed } : c
                              ),
                            };
                          }
                          return kidItem;
                        });
                        onUpdateKids(updatedKids);
                      }}
                      className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 underline cursor-pointer"
                    >
                      {chore.completed ? 'Mark Incomplete' : 'Approve & Mark Done'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PARENT SECURITY & PIN MANAGEMENT                                   */}
      {/* ========================================================================= */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Change Parent PIN Form */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <KeyRound className="w-5 h-5 text-indigo-500" />
              <span>Change Parent Master PIN</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              This master PIN unlocks the Parent Admin Command Center and authorizes account creation, deletion, and suspensions.
            </p>

            <form onSubmit={handleChangeParentPin} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Current Parent PIN
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={currentPinInput}
                  onChange={(e) => setCurrentPinInput(e.target.value)}
                  placeholder="e.g. 9999"
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-sm text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  New Parent PIN (4 to 6 digits)
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  placeholder="Enter new master PIN"
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-sm text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Confirm New Parent PIN
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={confirmPinInput}
                  onChange={(e) => setConfirmPinInput(e.target.value)}
                  placeholder="Re-enter new master PIN"
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-sm text-slate-900 dark:text-white"
                  required
                />
              </div>

              {pinChangeMsg && (
                <div
                  className={`text-xs font-bold p-2.5 rounded-xl flex items-center gap-1.5 ${
                    pinChangeMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                  }`}
                >
                  <Info className="w-4 h-4 shrink-0" />
                  <span>{pinChangeMsg.text}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Save New Master PIN
              </button>
            </form>
          </div>

          {/* Backup & Governance Info */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span>Offline Security & Encryption</span>
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              KidCoin Vault stores all ledgers locally without tracking or cloud dependency. All transactions are local to your device and your Raspberry Pi Portainer stack.
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Parent Master Account:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{parentAdmin.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Security Architecture:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Offline AES-256</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Last Parent Login:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ kids, parentAdmin }, null, 2));
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute('href', dataStr);
                downloadAnchor.setAttribute('download', `kidcoin_family_backup_${new Date().toISOString().split('T')[0]}.json`);
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
              }}
              className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Family Vault Encrypted Backup</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SUSPEND ACCOUNT DIALOG                                             */}
      {/* ========================================================================= */}
      {suspendKidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {suspendKidModal.status === 'suspended' ? 'Reactivate Account' : 'Suspend Kid Account'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {suspendKidModal.status === 'suspended'
                ? `Re-enabling ${suspendKidModal.name}'s account will restore normal vault access.`
                : `Suspending ${suspendKidModal.name}'s account will prevent them from unlocking their vault, spending, or claiming chores.`}
            </p>

            {suspendKidModal.status !== 'suspended' && (
              <div className="mt-4">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Suspension Reason:
                </label>
                <select
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="Temporary parental hold">Temporary parental hold</option>
                  <option value="Screen time / gadget limit reached">Screen time / gadget limit reached</option>
                  <option value="Unfinished schoolwork or chores">Unfinished schoolwork or chores</option>
                  <option value="Spending pause / impulse cooldown">Spending pause / impulse cooldown</option>
                </select>
              </div>
            )}

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setSuspendKidModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSuspend}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs text-white shadow-xs cursor-pointer ${
                  suspendKidModal.status === 'suspended' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {suspendKidModal.status === 'suspended' ? 'Confirm Reactivation' : 'Confirm Suspension'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE ACCOUNT CONFIRMATION (ADMIN ONLY)                           */}
      {/* ========================================================================= */}
      {deleteKidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 border border-rose-200 dark:border-rose-900/50 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Permanently Delete {deleteKidModal.name}'s Account?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              This action <strong>cannot be undone</strong>. All savings history (${deleteKidModal.totalSaved.toFixed(2)}), goals, badges, and chores will be wiped from this device.
            </p>

            <div className="mt-4">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Type <strong>{deleteKidModal.name}</strong> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmInput}
                onChange={(e) => setDeleteConfirmInput(e.target.value)}
                placeholder={deleteKidModal.name}
                className="w-full mt-1 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-slate-50 dark:bg-slate-800 text-sm font-black text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setDeleteKidModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={deleteConfirmInput.trim().toLowerCase() !== deleteKidModal.name.trim().toLowerCase()}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT KID PROFILE (ADMIN ONLY)                                      */}
      {/* ========================================================================= */}
      {editKidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl my-8">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Edit {editKidModal.name}'s Account Settings
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Parent admin controls for allowance, limits, and PIN reset.
            </p>

            <div className="space-y-3 mt-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Age</label>
                  <input
                    type="number"
                    min={4}
                    max={18}
                    value={editAge}
                    onChange={(e) => setEditAge(parseInt(e.target.value, 10) || 8)}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Vault PIN</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={editPin}
                    onChange={(e) => setEditPin(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Weekly Allowance ($)</label>
                  <input
                    type="number"
                    step="0.50"
                    value={editAllowance}
                    onChange={(e) => setEditAllowance(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Payout Day</label>
                  <select
                    value={editAllowanceDay}
                    onChange={(e) => setEditAllowanceDay(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="Sunday">Sunday</option>
                    <option value="Monday">Monday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Weekly Spending Cap ($)</label>
                <input
                  type="number"
                  step="5.00"
                  value={editSpendingLimit}
                  onChange={(e) => setEditSpendingLimit(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setEditKidModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveKidEdit}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: MANUAL BALANCE ADJUSTMENT (CREDIT / DEBIT)                         */}
      {/* ========================================================================= */}
      {adjustBalanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Adjust {adjustBalanceModal.name}'s Balance
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Current Saved: <strong>${adjustBalanceModal.totalSaved.toFixed(2)}</strong>
            </p>

            <div className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('credit')}
                  className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    adjustType === 'credit'
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  + Add Credit (Deposit)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('debit')}
                  className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    adjustType === 'debit'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  - Deduct (Debit)
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Amount ($)</label>
                <input
                  type="number"
                  step="0.50"
                  min="0.50"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="10.00"
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-black text-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Reason / Ledger Note</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Tooth fairy bonus, lemonade profits"
                  className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setAdjustBalanceModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyBalanceAdjustment}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Apply Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
