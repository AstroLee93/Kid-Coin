export type Category = 
  | 'allowance' 
  | 'chore' 
  | 'gift' 
  | 'lemonade_stand' 
  | 'game' 
  | 'snack' 
  | 'toy' 
  | 'interest'
  | 'goal_deposit'
  | 'match'
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
  // Retail and AI database metadata
  retailer?: string;
  sku?: string;
  barcode?: string;
  itemNumber?: string;
  modelNumber?: string;
  specs?: string[];
  productUrl?: string;
  description?: string;
  whyKidsLoveIt?: string;
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
  category: 'cleaning' | 'pets' | 'school' | 'yard' | 'quest' | 'routine' | 'other';
  icon: string;
  completed: boolean;
  isRepeatingWeekly: boolean;
  source?: 'local' | 'chore-quest';
  choreQuestPoints?: number;
  stars?: number; // Native stars in Chore-Quest
  isBounty?: boolean;
  bountyBonusStars?: number;
  assignedKidIds?: string[];
  requiresParentVerification?: boolean;
  questId?: string | number;
}

export interface ChoreQuestConfig {
  endpoint: string; // e.g. http://localhost:5000 or http://raspberrypi.local:5000
  pointRatio: number; // Dollars per point/star (e.g. 0.10 = 10 stars per dollar)
  apiKey?: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}

export interface KidProfile {
  id: string;
  name: string;
  age: number;
  avatarId: string;
  avatar?: string; // Emoji avatar from Chore-Quest (e.g. 🦁, 🦄, 🚀)
  color?: string; // Color hex from Chore-Quest (e.g. #f59e0b)
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
  stars?: number; // Current stars from Chore-Quest
  lifetimeStars?: number;
  choreQuestKidId?: string; // Original ID in Chore-Quest (e.g. kid-1)
}

export interface ParentAdminConfig {
  id: string; // 'parent-admin'
  name: string; // 'Parent / Guardian'
  pin: string; // Master 4-digit PIN (default '1234')
  recoveryHint?: string;
  familyAllowanceBudget: number;
  interestRateMonthlyPercent: number; // e.g. 5% monthly "Bank of Mom & Dad" interest
  autoApproveChores: boolean;
  requirePinForKidSwitch: boolean;
  lastLoginAt?: string;
  // Chore-Quest Integrated Settings
  choreQuestEndpoint?: string;
  kidCoinRatio?: number; // Conversion: dollars per star earned (default: 0.10)
  bankInterestRateMonthlyPercent?: number; // Bank of Mom & Dad monthly matching interest (default: 5)
  autoDepositChoresToGoal?: boolean; // Auto-deposit chore earnings into primary goal rocket (default: true)
  lastInterestCalculatedMonth?: string; // Last month interest was calculated (YYYY-MM)
  lastChoreQuestSyncAt?: string;
}

// ==========================================
// Chore-Quest Schema Definitions (AstroLee93/Chore-Quest)
// ==========================================

export interface ChoreQuestAppSettings {
  parentPin: string;
  soundEnabled: boolean;
  streakBonusStars: number;
  requireParentApprovalForRewards: boolean;
  kioskTimeout: string;
  kidCoinEnabled?: boolean;
  kidCoinRatio?: number; // default: 0.10
  bankInterestRateMonthlyPercent?: number; // default: 5
  autoDepositChoresToGoal?: boolean; // default: true
  lastInterestCalculatedMonth?: string;
  familyName?: string;
}

export interface ChoreQuestKidProfile {
  id: string;
  name: string;
  avatar: string;
  color: string;
  stars: number;
  lifetimeStars: number;
  streakDays: number;
  lastActiveDate: string;
  kidCoinBalance?: number;
  totalSaved?: number;
  weeklyAllowance?: number;
  savingsStreakDays?: number;
  goals?: SavingsGoal[];
  transactions?: Transaction[];
}

export interface ChoreQuestChoreItem {
  id: string;
  categoryId: string;
  title: string;
  description?: string;
  icon?: string;
  stars: number;
  assignedKidIds: string[];
  frequency?: string;
  requiresParentVerification?: boolean;
  isActive?: boolean;
  order?: number;
  isBounty?: boolean;
  bountyBonusStars?: number;
}

export interface ChoreQuestFamilyDatabase {
  version?: number;
  _rev?: number;
  _updatedAt?: number;
  settings: ChoreQuestAppSettings;
  kids: ChoreQuestKidProfile[];
  categories?: any[];
  chores: ChoreQuestChoreItem[];
  logs?: any[];
  rewards?: any[];
  redemptions?: any[];
  weeklyGroceryList?: any;
  weeklyMenu?: any;
  events?: any[];
  familyGoal?: any;
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
