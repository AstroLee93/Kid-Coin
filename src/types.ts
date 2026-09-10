export type Category = 
  | 'allowance' 
  | 'chore' 
  | 'gift' 
  | 'lemonade_stand' 
  | 'game' 
  | 'snack' 
  | 'toy' 
  | 'other';

export interface Transaction {
  id: string;
  kidId: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  category: Category;
  description: string;
  date: string;
  goalContribution?: string; // Goal ID if contributed directly
}

export interface SavingsMilestone {
  percent: number;
  label: string;
  rewardXP: number;
  reached: boolean;
  reachedAt?: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  category: string;
  targetCost: number;
  isVerified: boolean;
  verifiedSource?: string;
  currentSaved: number;
  priority: 'primary' | 'secondary';
  icon: string;
  createdAt: string;
  deadline?: string;
  milestones: SavingsMilestone[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpValue: number;
  category: 'saving' | 'chores' | 'streak' | 'milestone';
  unlocked: boolean;
  unlockedAt?: string;
}

export interface AvatarItem {
  id: string;
  name: string;
  emoji: string;
  role: string;
  unlockThreshold: number; // Dollars saved or XP needed
  unlockType: 'saved_amount' | 'milestone_percent' | 'level';
  isUnlocked: boolean;
  colorBg: string;
  flavorText: string;
}

export interface Chore {
  id: string;
  kidId: string;
  title: string;
  rewardAmount: number;
  category: 'cleaning' | 'pets' | 'school' | 'yard' | 'quest';
  icon: string;
  completed: boolean;
  isRepeatingWeekly: boolean;
  source?: 'local' | 'chore-quest';
  choreQuestPoints?: number;
  questId?: string | number;
}

export interface ChoreQuestConfig {
  endpoint: string; // e.g. http://localhost:5000 or http://raspberrypi.local:5000
  pointRatio: number; // Dollars per point (e.g. 0.10 = 10 pts per dollar)
  apiKey?: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}

export interface KidProfile {
  id: string;
  name: string;
  age: number;
  avatarId: string;
  colorTheme: string; // e.g. emerald, sky, violet, amber
  totalSaved: number;
  availableCash: number;
  weeklyAllowance: number;
  allowanceDay: string; // e.g. Sunday
  xp: number;
  level: number;
  savingsStreakDays: number;
  lastActivityDate: string;
  goals: SavingsGoal[];
  badges: Badge[];
  transactions: Transaction[];
  chores: Chore[];
  pin?: string;
  status: 'active' | 'suspended';
  suspendedReason?: string;
  suspendedAt?: string;
  spendingLimitPerWeek?: number;
  requireParentApproval?: boolean;
  parentNotes?: string;
}

export interface ParentAdminConfig {
  id: string; // 'parent-admin'
  name: string; // 'Parent / Guardian'
  pin: string; // Master 4-digit PIN (default '9999')
  recoveryHint?: string;
  familyAllowanceBudget: number;
  interestRateMonthlyPercent: number; // e.g. 5% monthly "Bank of Mom & Dad" interest
  autoApproveChores: boolean;
  requirePinForKidSwitch: boolean;
  lastLoginAt?: string;
}

export interface CoachAdvice {
  headline: string;
  milestoneTip: string;
  fastTrackIdeas: string[];
  spendingTradeoff: string;
  estimatedPace: string;
}

export interface AppNotification {
  id: string;
  kidId: string;
  title: string;
  message: string;
  type: 'milestone' | 'badge' | 'avatar' | 'allowance' | 'chore' | 'security';
  timestamp: string;
  read: boolean;
}
