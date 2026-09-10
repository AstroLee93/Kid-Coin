import { KidProfile, AvatarItem, Badge, SavingsGoal, ParentAdminConfig } from '../types';

export const INITIAL_AVATARS: AvatarItem[] = [
  {
    id: 'piggy',
    name: 'Penny Piggy',
    emoji: '🐷',
    role: 'Starter Banker',
    unlockThreshold: 0,
    unlockType: 'saved_amount',
    isUnlocked: true,
    colorBg: 'bg-pink-100 border-pink-300 text-pink-700 dark:bg-pink-950/40 dark:border-pink-800 dark:text-pink-300',
    flavorText: 'Every giant fortune started in a humble piggy bank!',
  },
  {
    id: 'raccoon',
    name: 'Rocket Raccoon',
    emoji: '🦝',
    role: 'Scrappy Saver',
    unlockThreshold: 20,
    unlockType: 'saved_amount',
    isUnlocked: true,
    colorBg: 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300',
    flavorText: 'Knows how to find coins in couch cushions and never lets a penny get away.',
  },
  {
    id: 'dino',
    name: 'Cosmic Dino',
    emoji: '🦖',
    role: 'Prehistoric Investor',
    unlockThreshold: 50,
    unlockType: 'saved_amount',
    isUnlocked: true,
    colorBg: 'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300',
    flavorText: 'Stomps down impulse spending with gigantic discipline.',
  },
  {
    id: 'ninja',
    name: 'Cyber Ninja',
    emoji: '🥷',
    role: 'Milestone Striker',
    unlockThreshold: 25,
    unlockType: 'milestone_percent',
    isUnlocked: true,
    colorBg: 'bg-indigo-100 border-indigo-300 text-indigo-800 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300',
    flavorText: 'Strikes silently at the 25% milestone. Stealthy and focused.',
  },
  {
    id: 'gamer',
    name: 'Neon Gamer',
    emoji: '👾',
    role: 'Halfway Hero',
    unlockThreshold: 50,
    unlockType: 'milestone_percent',
    isUnlocked: false,
    colorBg: 'bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-300',
    flavorText: 'Unlocked at 50% milestone! Powering up for the final boss countdown.',
  },
  {
    id: 'astro',
    name: 'Robo Astro',
    emoji: '🤖',
    role: 'Orbit Captain',
    unlockThreshold: 75,
    unlockType: 'milestone_percent',
    isUnlocked: false,
    colorBg: 'bg-cyan-100 border-cyan-300 text-cyan-800 dark:bg-cyan-950/40 dark:border-cyan-800 dark:text-cyan-300',
    flavorText: 'Orbiting near the destination! 75% savings threshold achieved.',
  },
  {
    id: 'dragon',
    name: 'Golden Dragon',
    emoji: '🐲',
    role: 'Vault Sovereign',
    unlockThreshold: 100,
    unlockType: 'milestone_percent',
    isUnlocked: false,
    colorBg: 'bg-yellow-100 border-yellow-400 text-yellow-900 dark:bg-yellow-950/40 dark:border-yellow-700 dark:text-yellow-300',
    flavorText: 'The ultimate badge of honor! Unlocked upon 100% purchasing victory.',
  },
];

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'first-coin',
    title: 'First Coin',
    description: 'Made your very first savings deposit into the vault.',
    icon: 'Coins',
    xpValue: 50,
    category: 'saving',
    unlocked: true,
    unlockedAt: '2025-01-10',
  },
  {
    id: 'quarter-master',
    title: 'Quarter Master (25%)',
    description: 'Saved 25% of your dream purchase goal.',
    icon: 'ShieldCheck',
    xpValue: 100,
    category: 'milestone',
    unlocked: true,
    unlockedAt: '2025-01-28',
  },
  {
    id: 'halfway-hero',
    title: 'Halfway Hero (50%)',
    description: 'Broke through the 50% halfway mark toward your goal!',
    icon: 'Flame',
    xpValue: 250,
    category: 'milestone',
    unlocked: false,
  },
  {
    id: 'chore-champion',
    title: 'Chore Champion',
    description: 'Completed 5 chores and banked the earnings directly.',
    icon: 'CheckCircle2',
    xpValue: 150,
    category: 'chores',
    unlocked: true,
    unlockedAt: '2025-02-04',
  },
  {
    id: 'streak-master',
    title: 'Patience Padawan',
    description: 'Maintained a 7-day savings streak without unnecessary spending.',
    icon: 'Zap',
    xpValue: 200,
    category: 'streak',
    unlocked: true,
    unlockedAt: '2025-02-12',
  },
  {
    id: 'century-club',
    title: 'Century Club ($100+)',
    description: 'Banked over $100 total across all savings.',
    icon: 'Crown',
    xpValue: 300,
    category: 'saving',
    unlocked: true,
    unlockedAt: '2025-01-20',
  },
  {
    id: 'goal-crusher',
    title: 'Goal Crusher (100%)',
    description: 'Reached 100% of your target savings goal! Time to buy!',
    icon: 'Trophy',
    xpValue: 500,
    category: 'milestone',
    unlocked: false,
  },
  {
    id: 'security-sentinel',
    title: 'Pi Vault Sentinel',
    description: 'Data secured on local Raspberry Pi with encrypted SQLite.',
    icon: 'Lock',
    xpValue: 100,
    category: 'saving',
    unlocked: true,
    unlockedAt: '2025-01-01',
  },
];

export const INITIAL_KIDS: KidProfile[] = [
  {
    id: 'kid-leo',
    name: 'Leo',
    age: 11,
    avatarId: 'ninja',
    colorTheme: 'sky',
    pin: '1234',
    totalSaved: 245.0,
    availableCash: 35.0,
    weeklyAllowance: 12.0,
    allowanceDay: 'Sunday',
    xp: 650,
    level: 3,
    savingsStreakDays: 14,
    status: 'active',
    lastActivityDate: new Date().toISOString().split('T')[0],
    goals: [
      {
        id: 'goal-ps5',
        title: 'PlayStation 5 Slim Console',
        category: 'Gaming',
        targetCost: 499.99,
        isVerified: true,
        verifiedSource: 'Official MSRP (Sony / Best Buy)',
        currentSaved: 245.0,
        priority: 'primary',
        icon: 'Gamepad2',
        createdAt: '2025-01-01',
        deadline: '2025-11-20',
        milestones: [
          { percent: 25, label: 'Bronze 25% ($125.00)', rewardXP: 100, reached: true, reachedAt: '2025-01-28' },
          { percent: 50, label: 'Silver 50% ($250.00)', rewardXP: 250, reached: false },
          { percent: 75, label: 'Gold 75% ($375.00)', rewardXP: 350, reached: false },
          { percent: 100, label: 'Platinum 100% ($499.99)', rewardXP: 500, reached: false },
        ],
      },
      {
        id: 'goal-headset',
        title: 'Wireless Gaming Headset',
        category: 'Accessories',
        targetCost: 59.99,
        isVerified: true,
        verifiedSource: 'Verified Retailers',
        currentSaved: 20.0,
        priority: 'secondary',
        icon: 'Headphones',
        createdAt: '2025-01-15',
        milestones: [
          { percent: 25, label: '25% ($15.00)', rewardXP: 50, reached: true, reachedAt: '2025-01-22' },
          { percent: 50, label: '50% ($30.00)', rewardXP: 100, reached: false },
          { percent: 75, label: '75% ($45.00)', rewardXP: 150, reached: false },
          { percent: 100, label: '100% ($59.99)', rewardXP: 250, reached: false },
        ],
      },
    ],
    badges: INITIAL_BADGES,
    chores: [
      { id: 'c1', kidId: 'kid-leo', title: 'Clean and vacuum bedroom', rewardAmount: 5.0, category: 'cleaning', icon: 'Sparkles', completed: false, isRepeatingWeekly: true },
      { id: 'c2', kidId: 'kid-leo', title: 'Wash family car & wheels', rewardAmount: 12.0, category: 'yard', icon: 'Car', completed: false, isRepeatingWeekly: false },
      { id: 'c3', kidId: 'kid-leo', title: 'Walk Buster the dog (30 mins)', rewardAmount: 4.0, category: 'pets', icon: 'Footprints', completed: true, isRepeatingWeekly: true },
      { id: 'c4', kidId: 'kid-leo', title: 'Empty & reload dishwasher', rewardAmount: 3.0, category: 'cleaning', icon: 'Utensils', completed: true, isRepeatingWeekly: true },
      { id: 'c5', kidId: 'kid-leo', title: 'Sort & take out recycling bins', rewardAmount: 4.0, category: 'cleaning', icon: 'Trash2', completed: false, isRepeatingWeekly: true },
    ],
    transactions: [
      { id: 'tx-1', kidId: 'kid-leo', type: 'deposit', amount: 50.0, category: 'gift', description: 'Birthday money from Grandma', date: '2025-01-10', goalContribution: 'goal-ps5' },
      { id: 'tx-2', kidId: 'kid-leo', type: 'deposit', amount: 12.0, category: 'allowance', description: 'Weekly allowance payout', date: '2025-01-14', goalContribution: 'goal-ps5' },
      { id: 'tx-3', kidId: 'kid-leo', type: 'deposit', amount: 15.0, category: 'chore', description: 'Mowed the backyard lawn', date: '2025-01-19', goalContribution: 'goal-ps5' },
      { id: 'tx-4', kidId: 'kid-leo', type: 'deposit', amount: 12.0, category: 'allowance', description: 'Weekly allowance payout', date: '2025-01-21', goalContribution: 'goal-ps5' },
      { id: 'tx-5', kidId: 'kid-leo', type: 'withdrawal', amount: 4.5, category: 'snack', description: 'Ice cream cone with friends', date: '2025-01-25' },
      { id: 'tx-6', kidId: 'kid-leo', type: 'deposit', amount: 12.0, category: 'allowance', description: 'Weekly allowance payout', date: '2025-01-28', goalContribution: 'goal-ps5' },
      { id: 'tx-7', kidId: 'kid-leo', type: 'deposit', amount: 100.0, category: 'gift', description: 'Holiday bonus check deposited', date: '2025-02-01', goalContribution: 'goal-ps5' },
      { id: 'tx-8', kidId: 'kid-leo', type: 'deposit', amount: 7.0, category: 'chore', description: 'Walked dog and emptied dishwasher', date: '2025-02-08', goalContribution: 'goal-ps5' },
    ],
  },
  {
    id: 'kid-maya',
    name: 'Maya',
    age: 8,
    avatarId: 'dino',
    colorTheme: 'emerald',
    pin: '1234',
    totalSaved: 95.0,
    availableCash: 18.0,
    weeklyAllowance: 8.0,
    allowanceDay: 'Saturday',
    xp: 420,
    level: 2,
    savingsStreakDays: 9,
    status: 'active',
    lastActivityDate: new Date().toISOString().split('T')[0],
    goals: [
      {
        id: 'goal-switch',
        title: 'Nintendo Switch - OLED Model',
        category: 'Gaming',
        targetCost: 349.99,
        isVerified: true,
        verifiedSource: 'Official Nintendo MSRP',
        currentSaved: 95.0,
        priority: 'primary',
        icon: 'Tv',
        createdAt: '2025-01-05',
        milestones: [
          { percent: 25, label: 'Bronze 25% ($87.50)', rewardXP: 100, reached: true, reachedAt: '2025-02-02' },
          { percent: 50, label: 'Silver 50% ($175.00)', rewardXP: 250, reached: false },
          { percent: 75, label: 'Gold 75% ($262.50)', rewardXP: 350, reached: false },
          { percent: 100, label: 'Platinum 100% ($349.99)', rewardXP: 500, reached: false },
        ],
      },
    ],
    badges: INITIAL_BADGES.map((b) =>
      b.id === 'quarter-master' || b.id === 'first-coin' || b.id === 'chore-champion'
        ? { ...b, unlocked: true }
        : { ...b, unlocked: false }
    ),
    chores: [
      { id: 'cm1', kidId: 'kid-maya', title: 'Organize arts & craft station', rewardAmount: 4.0, category: 'cleaning', icon: 'Sparkles', completed: false, isRepeatingWeekly: true },
      { id: 'cm2', kidId: 'kid-maya', title: 'Feed goldfish & clean bowl', rewardAmount: 3.0, category: 'pets', icon: 'HeartHandshake', completed: true, isRepeatingWeekly: true },
      { id: 'cm3', kidId: 'kid-maya', title: 'Fold and put away school clothes', rewardAmount: 4.0, category: 'cleaning', icon: 'Sparkles', completed: false, isRepeatingWeekly: true },
    ],
    transactions: [
      { id: 'tx-m1', kidId: 'kid-maya', type: 'deposit', amount: 40.0, category: 'gift', description: 'Birthday card gift from Aunt Sarah', date: '2025-01-08', goalContribution: 'goal-switch' },
      { id: 'tx-m2', kidId: 'kid-maya', type: 'deposit', amount: 8.0, category: 'allowance', description: 'Weekly allowance payout', date: '2025-01-13', goalContribution: 'goal-switch' },
      { id: 'tx-m3', kidId: 'kid-maya', type: 'deposit', amount: 8.0, category: 'allowance', description: 'Weekly allowance payout', date: '2025-01-20', goalContribution: 'goal-switch' },
      { id: 'tx-m4', kidId: 'kid-maya', type: 'deposit', amount: 15.0, category: 'lemonade_stand', description: 'Saturday lemonade stand profits', date: '2025-01-27', goalContribution: 'goal-switch' },
      { id: 'tx-m5', kidId: 'kid-maya', type: 'deposit', amount: 8.0, category: 'allowance', description: 'Weekly allowance payout', date: '2025-02-03', goalContribution: 'goal-switch' },
      { id: 'tx-m6', kidId: 'kid-maya', type: 'withdrawal', amount: 3.0, category: 'snack', description: 'Sticker pack purchase', date: '2025-02-05' },
      { id: 'tx-m7', kidId: 'kid-maya', type: 'deposit', amount: 19.0, category: 'chore', description: 'Helpers bonus chores', date: '2025-02-09', goalContribution: 'goal-switch' },
    ],
  },
];

const STORAGE_KEY = 'kidcoin_vault_data_v2';
const ACTIVE_KID_KEY = 'kidcoin_vault_active_kid_v2';

export function loadKidsFromStorage(): KidProfile[] {
  if (typeof window === 'undefined') return INITIAL_KIDS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveKidsToStorage(INITIAL_KIDS);
      return INITIAL_KIDS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_KIDS;
    // Backfill any missing status and ensure default pin 1234
    return parsed.map((k) => ({
      ...k,
      status: k.status || 'active',
      pin: k.pin || '1234',
    }));
  } catch (e) {
    console.error('Failed to load kid profiles:', e);
    return INITIAL_KIDS;
  }
}

export const DEFAULT_PARENT_ADMIN: ParentAdminConfig = {
  id: 'parent-admin',
  name: 'Parent / Family Guardian',
  pin: '1234',
  recoveryHint: 'Default master PIN is 1234',
  familyAllowanceBudget: 50.0,
  interestRateMonthlyPercent: 5.0,
  autoApproveChores: false,
  requirePinForKidSwitch: false,
  lastLoginAt: new Date().toISOString(),
};

const PARENT_ADMIN_KEY = 'kidcoin_vault_parent_admin_v1';

export function loadParentAdminFromStorage(): ParentAdminConfig {
  if (typeof window === 'undefined') return DEFAULT_PARENT_ADMIN;
  try {
    const raw = localStorage.getItem(PARENT_ADMIN_KEY);
    if (!raw) {
      saveParentAdminToStorage(DEFAULT_PARENT_ADMIN);
      return DEFAULT_PARENT_ADMIN;
    }
    const parsed = JSON.parse(raw);
    // If previously saved with legacy 9999 or empty, normalize to default 1234
    const resolvedPin = parsed.pin === '9999' || !parsed.pin ? '1234' : parsed.pin;
    return { ...DEFAULT_PARENT_ADMIN, ...parsed, pin: resolvedPin };
  } catch (e) {
    console.error('Failed to load parent admin config:', e);
    return DEFAULT_PARENT_ADMIN;
  }
}

export function saveParentAdminToStorage(config: ParentAdminConfig) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PARENT_ADMIN_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save parent admin config:', e);
  }
}

export function saveKidsToStorage(kids: KidProfile[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(kids));
  } catch (e) {
    console.error('Failed to save kid profiles:', e);
  }
}

export function getActiveKidId(): string {
  if (typeof window === 'undefined') return INITIAL_KIDS[0].id;
  try {
    return localStorage.getItem(ACTIVE_KID_KEY) || INITIAL_KIDS[0].id;
  } catch {
    return INITIAL_KIDS[0].id;
  }
}

export function setActiveKidId(id: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACTIVE_KID_KEY, id);
  } catch (e) {
    console.error('Failed to set active kid ID:', e);
  }
}
