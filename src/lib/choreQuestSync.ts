import { 
  Chore, 
  ChoreQuestConfig, 
  KidProfile, 
  SavingsGoal, 
  Transaction, 
  ParentAdminConfig,
  ChoreQuestFamilyDatabase,
  ChoreQuestKidProfile,
  ChoreQuestChoreItem,
  ChoreQuestAppSettings
} from '../types';
import { INITIAL_AVATARS, INITIAL_BADGES } from './storage';

const STORAGE_KEY = 'kidcoin_chorequest_config_v2';

export const DEFAULT_CHOREQUEST_CONFIG: ChoreQuestConfig = {
  endpoint: 'http://localhost:5000',
  pointRatio: 0.10, // 10 stars = $1.00 (e.g. 50 pts chore = $5.00 reward)
  autoSync: false,
};

export function getTodayMonthString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Authentic Chore-Quest FamilyDatabase sample based on AstroLee93/Chore-Quest
export const SAMPLE_CHOREQUEST_FAMILY_DB: ChoreQuestFamilyDatabase = {
  version: 1,
  _rev: 42,
  _updatedAt: Date.now(),
  settings: {
    parentPin: '1234',
    soundEnabled: true,
    streakBonusStars: 5,
    requireParentApprovalForRewards: false,
    kioskTimeout: '5m',
    kidCoinEnabled: true,
    kidCoinRatio: 0.10,
    bankInterestRateMonthlyPercent: 5,
    autoDepositChoresToGoal: true,
    familyName: 'Quest Family',
  },
  kids: [
    {
      id: 'kid-1',
      name: 'Leo',
      avatar: '🦁',
      color: '#f59e0b',
      stars: 45,
      lifetimeStars: 180,
      streakDays: 4,
      lastActiveDate: getTodayDateString(),
      kidCoinBalance: 12.50,
      totalSaved: 245.00,
      weeklyAllowance: 12.00,
      savingsStreakDays: 14,
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
      ],
      transactions: [
        { id: 'tx-cq-1', kidId: 'kid-1', type: 'deposit', amount: 5.0, category: 'chore', description: 'Chore: Clean and vacuum bedroom', date: '2025-02-10' },
        { id: 'tx-cq-2', kidId: 'kid-1', type: 'deposit', amount: 12.0, category: 'allowance', description: 'Weekly allowance payout', date: '2025-02-07' },
      ],
    },
    {
      id: 'kid-2',
      name: 'Maya',
      avatar: '🦄',
      color: '#ec4899',
      stars: 62,
      lifetimeStars: 220,
      streakDays: 6,
      lastActiveDate: getTodayDateString(),
      kidCoinBalance: 18.00,
      totalSaved: 95.00,
      weeklyAllowance: 8.00,
      savingsStreakDays: 9,
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
      transactions: [
        { id: 'tx-cq-3', kidId: 'kid-2', type: 'deposit', amount: 4.0, category: 'chore', description: 'Chore: Organize arts & craft station', date: '2025-02-11' },
      ],
    },
    {
      id: 'kid-3',
      name: 'Sam',
      avatar: '🚀',
      color: '#3b82f6',
      stars: 28,
      lifetimeStars: 95,
      streakDays: 2,
      lastActiveDate: getTodayDateString(),
      kidCoinBalance: 8.00,
      totalSaved: 47.50,
      weeklyAllowance: 4.00,
      savingsStreakDays: 2,
      goals: [
        {
          id: 'goal-lego',
          title: 'LEGO Star Wars Millennium Falcon',
          category: 'Toys & LEGO',
          targetCost: 169.99,
          isVerified: true,
          verifiedSource: 'LEGO Store MSRP',
          currentSaved: 47.50,
          priority: 'primary',
          icon: 'Boxes',
          createdAt: '2025-01-10',
          milestones: [
            { percent: 25, label: '25% ($42.50)', rewardXP: 100, reached: true, reachedAt: '2025-02-01' },
            { percent: 50, label: '50% ($85.00)', rewardXP: 250, reached: false },
            { percent: 75, label: '75% ($127.50)', rewardXP: 350, reached: false },
            { percent: 100, label: '100% ($169.99)', rewardXP: 500, reached: false },
          ],
        },
      ],
      transactions: [
        { id: 'tx-cq-4', kidId: 'kid-3', type: 'deposit', amount: 4.0, category: 'allowance', description: 'Weekly allowance payout', date: '2025-02-08' },
      ],
    },
  ],
  categories: [
    { id: 'cat-morning', name: 'Morning Routine', icon: 'Sun', color: '#f59e0b' },
    { id: 'cat-evening', name: 'Evening Routine', icon: 'Moon', color: '#8b5cf6' },
    { id: 'cat-cleaning', name: 'Household Chores', icon: 'Sparkles', color: '#10b981' },
    { id: 'cat-yard', name: 'Yard & Outdoor Missions', icon: 'Trees', color: '#059669' },
    { id: 'cat-school', name: 'Homework & Learning', icon: 'BookOpen', color: '#3b82f6' },
  ],
  chores: [
    {
      id: 'chore-1',
      categoryId: 'cat-cleaning',
      title: 'Wash Dinner Dishes & Wipe Counter',
      description: 'Scrape plates, load dishwasher, and wipe down countertops',
      icon: 'Utensils',
      stars: 30,
      assignedKidIds: ['all'],
      isActive: true,
      requiresParentVerification: true,
      isBounty: false,
    },
    {
      id: 'chore-2',
      categoryId: 'cat-yard',
      title: 'Mow & Edge Backyard Lawn (Super Bounty)',
      description: 'Mow lawn, empty bagger, and sweep patio walkway',
      icon: 'Car',
      stars: 80,
      assignedKidIds: ['kid-1'],
      isActive: true,
      requiresParentVerification: true,
      isBounty: true,
      bountyBonusStars: 20,
    },
    {
      id: 'chore-3',
      categoryId: 'cat-cleaning',
      title: 'Clean and vacuum bedroom',
      description: 'Make bed, pick up toys/clothes, and run vacuum',
      icon: 'Sparkles',
      stars: 25,
      assignedKidIds: ['kid-1', 'kid-2', 'kid-3'],
      isActive: true,
      requiresParentVerification: false,
      isBounty: false,
    },
    {
      id: 'chore-4',
      categoryId: 'cat-school',
      title: 'Finish Weekend Math Homework Quest',
      description: 'Complete 30 minutes of math practice questions',
      icon: 'Footprints',
      stars: 40,
      assignedKidIds: ['all'],
      isActive: true,
      requiresParentVerification: true,
      isBounty: false,
    },
    {
      id: 'chore-5',
      categoryId: 'cat-yard',
      title: 'Take Out Recycling & Compost Bins',
      description: 'Take blue bin and compost cart to curb',
      icon: 'Trash2',
      stars: 20,
      assignedKidIds: ['all'],
      isActive: true,
      requiresParentVerification: false,
      isBounty: false,
    },
  ],
};

export const SAMPLE_CHOREQUEST_DATA = SAMPLE_CHOREQUEST_FAMILY_DB.chores.map((c) => ({
  id: c.id,
  task: c.title,
  points: c.stars + (c.isBounty ? (c.bountyBonusStars || 0) : 0),
  category: c.categoryId.includes('yard') ? 'yard' : c.categoryId.includes('school') ? 'school' : 'cleaning',
  completed: false,
}));

export function getChoreQuestConfig(): ChoreQuestConfig {
  if (typeof window === 'undefined') return DEFAULT_CHOREQUEST_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CHOREQUEST_CONFIG;
    return { ...DEFAULT_CHOREQUEST_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CHOREQUEST_CONFIG;
  }
}

export function saveChoreQuestConfig(config: ChoreQuestConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // ignore
  }
}

export interface ParseResult {
  chores: Chore[];
  errors: string[];
  totalParsed: number;
}

/**
 * Parses raw Chore-Quest payload into KidCoin Chore format
 */
export function parseChoreQuestPayload(
  rawData: any,
  kidId: string,
  pointRatio: number
): ParseResult {
  const result: ParseResult = {
    chores: [],
    errors: [],
    totalParsed: 0,
  };

  let items: any[] = [];

  if (Array.isArray(rawData)) {
    items = rawData;
  } else if (rawData && typeof rawData === 'object') {
    if (Array.isArray(rawData.chores)) {
      items = rawData.chores;
    } else if (Array.isArray(rawData.tasks)) {
      items = rawData.tasks;
    } else if (Array.isArray(rawData.quests)) {
      items = rawData.quests;
    } else if (Array.isArray(rawData.data)) {
      items = rawData.data;
    } else {
      items = Object.values(rawData).filter((v) => typeof v === 'object' && v !== null);
    }
  }

  if (!items || items.length === 0) {
    result.errors.push('No chore quest list found in provided payload.');
    return result;
  }

  items.forEach((item, index) => {
    if (!item || typeof item !== 'object') return;

    const title = item.title || item.task || item.name || item.description || `Chore Quest #${index + 1}`;
    const rawStars = item.stars ?? item.points ?? item.pointValue ?? item.reward ?? 10;
    const baseStars = typeof rawStars === 'number' ? rawStars : parseFloat(rawStars) || 10;
    const isBounty = Boolean(item.isBounty);
    const bonusStars = isBounty ? (item.bountyBonusStars || 0) : 0;
    const totalStars = baseStars + bonusStars;

    // Calculate dollar bounty from point ratio
    const rewardAmount = Math.max(0.25, Number((totalStars * pointRatio).toFixed(2)));

    // Category mapping
    const rawCat = String(item.categoryId || item.category || item.type || '').toLowerCase();
    let category: 'cleaning' | 'pets' | 'school' | 'yard' | 'quest' | 'routine' = 'quest';
    if (rawCat.includes('clean') || rawCat.includes('dish') || rawCat.includes('room')) category = 'cleaning';
    else if (rawCat.includes('pet') || rawCat.includes('dog') || rawCat.includes('cat')) category = 'pets';
    else if (rawCat.includes('school') || rawCat.includes('homework') || rawCat.includes('math')) category = 'school';
    else if (rawCat.includes('yard') || rawCat.includes('lawn') || rawCat.includes('garden') || rawCat.includes('trash')) category = 'yard';
    else if (rawCat.includes('routine') || rawCat.includes('morning') || rawCat.includes('evening')) category = 'routine';

    let icon = item.icon || 'Sparkles';
    if (category === 'cleaning') icon = 'Sparkles';
    else if (category === 'pets') icon = 'Footprints';
    else if (category === 'school') icon = 'Footprints';
    else if (category === 'yard') icon = 'Car';

    const completed = Boolean(item.completed || item.isCompleted || item.done);
    const choreId = item.id ? `cq-${item.id}` : `cq-${Date.now()}-${index}`;

    result.chores.push({
      id: choreId,
      kidId,
      title: String(title),
      rewardAmount,
      category,
      icon,
      completed,
      isRepeatingWeekly: Boolean(item.isRepeating || (item.frequency === 'weekly') || true),
      source: 'chore-quest',
      choreQuestPoints: totalStars,
      stars: baseStars,
      isBounty,
      bountyBonusStars: bonusStars,
      assignedKidIds: item.assignedKidIds || ['all'],
      requiresParentVerification: Boolean(item.requiresParentVerification),
      questId: item.id || index,
    });
  });

  result.totalParsed = result.chores.length;
  return result;
}

/**
 * Bi-directionally merges a Chore-Quest FamilyDatabase into KidCoin Vault state
 */
export function mergeChoreQuestDatabaseIntoVault(
  db: ChoreQuestFamilyDatabase,
  existingKids: KidProfile[],
  existingConfig: ParentAdminConfig
): {
  updatedKids: KidProfile[];
  updatedConfig: ParentAdminConfig;
  importedKidCount: number;
  importedChoreCount: number;
} {
  const ratio = db.settings?.kidCoinRatio ?? existingConfig.kidCoinRatio ?? 0.10;
  const interestRate = db.settings?.bankInterestRateMonthlyPercent ?? existingConfig.bankInterestRateMonthlyPercent ?? 5;
  const autoDeposit = db.settings?.autoDepositChoresToGoal ?? existingConfig.autoDepositChoresToGoal ?? true;

  const updatedConfig: ParentAdminConfig = {
    ...existingConfig,
    kidCoinRatio: ratio,
    bankInterestRateMonthlyPercent: interestRate,
    autoDepositChoresToGoal: autoDeposit,
    lastInterestCalculatedMonth: db.settings?.lastInterestCalculatedMonth || existingConfig.lastInterestCalculatedMonth,
    lastChoreQuestSyncAt: new Date().toLocaleTimeString(),
  };

  const remoteKids = db.kids || [];
  const remoteChores = db.chores || [];

  const updatedKids = [...existingKids];

  remoteKids.forEach((rk) => {
    // Match by Chore-Quest ID or Name (case-insensitive)
    const existingIndex = updatedKids.findIndex(
      (k) => k.choreQuestKidId === rk.id || k.id === rk.id || k.name.toLowerCase() === rk.name.toLowerCase()
    );

    // Chores for this kid (assigned specifically or to 'all')
    const assignedChores: Chore[] = remoteChores
      .filter((c) => !c.assignedKidIds || c.assignedKidIds.includes('all') || c.assignedKidIds.includes(rk.id))
      .map((c, idx) => {
        const totalStars = c.stars + (c.isBounty ? (c.bountyBonusStars || 0) : 0);
        const rewardAmount = Math.max(0.25, Number((totalStars * ratio).toFixed(2)));
        return {
          id: `cq-${c.id}`,
          kidId: existingIndex >= 0 ? updatedKids[existingIndex].id : `kid-${rk.id}`,
          title: c.title,
          rewardAmount,
          category: (c.categoryId.includes('yard') ? 'yard' : c.categoryId.includes('school') ? 'school' : 'cleaning') as any,
          icon: c.icon || 'Sparkles',
          completed: false,
          isRepeatingWeekly: true,
          source: 'chore-quest',
          choreQuestPoints: totalStars,
          stars: c.stars,
          isBounty: c.isBounty,
          bountyBonusStars: c.bountyBonusStars,
          assignedKidIds: c.assignedKidIds,
          requiresParentVerification: c.requiresParentVerification,
          questId: c.id,
        };
      });

    if (existingIndex >= 0) {
      // Merge with existing kid
      const cur = updatedKids[existingIndex];
      const mergedGoals = (rk.goals && rk.goals.length > 0) ? rk.goals : cur.goals;
      const mergedTx = (rk.transactions && rk.transactions.length > 0) ? rk.transactions : cur.transactions;

      // Merge chores without removing manually completed or custom chores
      const existingChoreMap = new Map(cur.chores.map((c) => [c.id, c]));
      assignedChores.forEach((ac) => {
        if (!existingChoreMap.has(ac.id)) {
          existingChoreMap.set(ac.id, ac);
        }
      });

      updatedKids[existingIndex] = {
        ...cur,
        name: rk.name || cur.name,
        avatar: rk.avatar || cur.avatar,
        color: rk.color || cur.color,
        stars: rk.stars ?? cur.stars ?? 0,
        lifetimeStars: rk.lifetimeStars ?? cur.lifetimeStars ?? 0,
        choreQuestKidId: rk.id,
        totalSaved: rk.totalSaved ?? cur.totalSaved,
        availableCash: rk.kidCoinBalance ?? cur.availableCash,
        weeklyAllowance: rk.weeklyAllowance ?? cur.weeklyAllowance,
        savingsStreakDays: rk.savingsStreakDays ?? rk.streakDays ?? cur.savingsStreakDays,
        goals: mergedGoals,
        transactions: mergedTx,
        chores: Array.from(existingChoreMap.values()),
      };
    } else {
      // Create new kid from Chore-Quest
      const newKidId = `kid-${rk.id}`;
      const avItem = INITIAL_AVATARS[updatedKids.length % INITIAL_AVATARS.length];

      const newKid: KidProfile = {
        id: newKidId,
        choreQuestKidId: rk.id,
        name: rk.name,
        age: 10,
        avatarId: avItem.id,
        avatar: rk.avatar,
        color: rk.color,
        colorTheme: rk.name.toLowerCase().includes('leo') ? 'sky' : rk.name.toLowerCase().includes('maya') ? 'emerald' : 'violet',
        pin: '1234',
        totalSaved: rk.totalSaved ?? (rk.goals ? rk.goals.reduce((a, g) => a + g.currentSaved, 0) : 50),
        availableCash: rk.kidCoinBalance ?? 10.0,
        weeklyAllowance: rk.weeklyAllowance ?? 5.0,
        allowanceDay: 'Sunday',
        xp: (rk.lifetimeStars || 50) * 5,
        level: Math.max(1, Math.floor(((rk.lifetimeStars || 50) * 5) / 250) + 1),
        savingsStreakDays: rk.savingsStreakDays ?? rk.streakDays ?? 3,
        status: 'active',
        lastActivityDate: rk.lastActiveDate || getTodayDateString(),
        stars: rk.stars || 0,
        lifetimeStars: rk.lifetimeStars || 0,
        goals: rk.goals || [],
        badges: INITIAL_BADGES,
        chores: assignedChores,
        transactions: rk.transactions || [],
      };

      updatedKids.push(newKid);
    }
  });

  return {
    updatedKids,
    updatedConfig,
    importedKidCount: remoteKids.length,
    importedChoreCount: remoteChores.length,
  };
}

/**
 * Converts KidCoin Vault data into a complete Chore-Quest FamilyDatabase structure
 */
export function exportVaultToChoreQuestDatabase(
  kids: KidProfile[],
  config: ParentAdminConfig
): ChoreQuestFamilyDatabase {
  const ratio = config.kidCoinRatio ?? 0.10;
  const interestRate = config.bankInterestRateMonthlyPercent ?? 5;
  const autoDeposit = config.autoDepositChoresToGoal !== false;

  const cqKids: ChoreQuestKidProfile[] = kids.map((k, idx) => ({
    id: k.choreQuestKidId || `kid-${idx + 1}`,
    name: k.name,
    avatar: k.avatar || (k.name.toLowerCase().includes('leo') ? '🦁' : k.name.toLowerCase().includes('maya') ? '🦄' : '🚀'),
    color: k.color || (idx === 0 ? '#f59e0b' : idx === 1 ? '#ec4899' : '#3b82f6'),
    stars: k.stars ?? Math.round(k.availableCash / ratio),
    lifetimeStars: k.lifetimeStars ?? Math.round((k.totalSaved + k.availableCash) / ratio),
    streakDays: k.savingsStreakDays || 1,
    lastActiveDate: k.lastActivityDate || getTodayDateString(),
    kidCoinBalance: Number(k.availableCash.toFixed(2)),
    totalSaved: Number(k.totalSaved.toFixed(2)),
    weeklyAllowance: Number(k.weeklyAllowance.toFixed(2)),
    savingsStreakDays: k.savingsStreakDays,
    goals: k.goals,
    transactions: k.transactions,
  }));

  // Aggregate chores across kids
  const choreMap = new Map<string, ChoreQuestChoreItem>();
  kids.forEach((k) => {
    k.chores.forEach((c) => {
      const choreKey = c.title.toLowerCase().trim();
      const stars = c.stars || c.choreQuestPoints || Math.max(10, Math.round(c.rewardAmount / ratio));
      if (!choreMap.has(choreKey)) {
        choreMap.set(choreKey, {
          id: c.questId ? String(c.questId) : c.id.replace(/^cq-/, ''),
          categoryId: c.category === 'yard' ? 'cat-yard' : c.category === 'school' ? 'cat-school' : 'cat-cleaning',
          title: c.title,
          description: `Chore reward: $${c.rewardAmount.toFixed(2)}`,
          icon: c.icon,
          stars,
          assignedKidIds: c.assignedKidIds || [k.choreQuestKidId || k.id],
          requiresParentVerification: c.requiresParentVerification ?? false,
          isActive: true,
          isBounty: c.isBounty,
          bountyBonusStars: c.bountyBonusStars,
        });
      } else {
        const existing = choreMap.get(choreKey)!;
        const kidRef = k.choreQuestKidId || k.id;
        if (!existing.assignedKidIds.includes(kidRef) && !existing.assignedKidIds.includes('all')) {
          existing.assignedKidIds.push(kidRef);
        }
      }
    });
  });

  return {
    version: 1,
    _rev: Date.now(),
    _updatedAt: Date.now(),
    settings: {
      parentPin: config.pin || '1234',
      soundEnabled: true,
      streakBonusStars: 5,
      requireParentApprovalForRewards: false,
      kioskTimeout: '5m',
      kidCoinEnabled: true,
      kidCoinRatio: ratio,
      bankInterestRateMonthlyPercent: interestRate,
      autoDepositChoresToGoal: autoDeposit,
      lastInterestCalculatedMonth: config.lastInterestCalculatedMonth,
      familyName: config.name || 'Quest Family',
    },
    kids: cqKids,
    categories: SAMPLE_CHOREQUEST_FAMILY_DB.categories,
    chores: Array.from(choreMap.values()),
  };
}

/**
 * Runs the official Chore-Quest "Bank of Mom & Dad" monthly interest booster
 * Algorithm matches AstroLee93/Chore-Quest utils/kidCoin.ts applyMonthlyInterest
 */
export function applyChoreQuestMonthlyInterest(
  kids: KidProfile[],
  config: ParentAdminConfig
): {
  updatedKids: KidProfile[];
  updatedConfig: ParentAdminConfig;
  totalInterestPaid: number;
  message: string;
} {
  const ratePercent = config.bankInterestRateMonthlyPercent ?? 5;
  const rateDecimal = ratePercent / 100;
  const currentMonthStr = getTodayMonthString();

  let totalInterestPaid = 0;

  const updatedKids = kids.map((kid) => {
    if (kid.status === 'suspended') return kid;

    const goalsTotal = (kid.goals || []).reduce((acc, g) => acc + (g.currentSaved || 0), 0);
    const balance = kid.availableCash || 0;
    const combinedTotal = goalsTotal + balance;

    if (combinedTotal <= 0) return kid;

    const interestEarned = Number((combinedTotal * rateDecimal).toFixed(2));
    if (interestEarned <= 0) return kid;

    totalInterestPaid += interestEarned;

    let updatedGoals = kid.goals || [];
    let updatedBalance = balance;
    let targetGoalId: string | undefined;

    const primaryGoal = updatedGoals.find((g) => g.priority === 'primary') || updatedGoals[0];

    if (primaryGoal) {
      targetGoalId = primaryGoal.id;
      const spaceInGoal = Math.max(0, primaryGoal.targetCost - primaryGoal.currentSaved);
      if (interestEarned <= spaceInGoal) {
        updatedGoals = updatedGoals.map((g) =>
          g.id === primaryGoal.id
            ? { ...g, currentSaved: Number((g.currentSaved + interestEarned).toFixed(2)) }
            : g
        );
      } else {
        // Fill goal to 100%, spill remainder to available balance
        updatedGoals = updatedGoals.map((g) =>
          g.id === primaryGoal.id ? { ...g, currentSaved: g.targetCost } : g
        );
        updatedBalance = Number((updatedBalance + (interestEarned - spaceInGoal)).toFixed(2));
      }
    } else {
      updatedBalance = Number((updatedBalance + interestEarned).toFixed(2));
    }

    const tx: Transaction = {
      id: `tx-interest-${Date.now()}-${kid.id}`,
      kidId: kid.id,
      type: 'deposit',
      amount: interestEarned,
      category: 'interest',
      description: `Bank of Mom & Dad ${ratePercent}% Monthly Interest Booster (${currentMonthStr})`,
      date: getTodayDateString(),
      goalContribution: targetGoalId,
    };

    const newTotalSaved = (updatedGoals.reduce((acc, g) => acc + g.currentSaved, 0));

    return {
      ...kid,
      totalSaved: Number(newTotalSaved.toFixed(2)),
      availableCash: Number(updatedBalance.toFixed(2)),
      goals: updatedGoals,
      transactions: [tx, ...(kid.transactions || [])],
    };
  });

  const updatedConfig: ParentAdminConfig = {
    ...config,
    lastInterestCalculatedMonth: currentMonthStr,
  };

  const message = totalInterestPaid > 0
    ? `Successfully credited $${totalInterestPaid.toFixed(2)} in ${ratePercent}% interest across kid vaults for ${currentMonthStr}!`
    : `No interest was due or kids currently have $0.00 saved.`;

  return {
    updatedKids,
    updatedConfig,
    totalInterestPaid,
    message,
  };
}

/**
 * Attempts to fetch live data from Chore-Quest container (direct or via server proxy)
 */
export async function fetchFromChoreQuest(
  endpoint: string,
  kidId: string,
  pointRatio: number
): Promise<{ 
  success: boolean; 
  familyDb?: ChoreQuestFamilyDatabase;
  chores: Chore[]; 
  message: string 
}> {
  const cleanEndpoint = endpoint.replace(/\/+$/, '');

  // 1. Try server-side proxy first (bypasses browser CORS limitations completely!)
  try {
    const proxyRes = await fetch('/api/chorequest/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: cleanEndpoint,
        action: 'pull',
      }),
    });

    if (proxyRes.ok) {
      const data = await proxyRes.json();
      if (data.success && data.database) {
        const db = data.database as ChoreQuestFamilyDatabase;
        const parsed = parseChoreQuestPayload(db, kidId, pointRatio);
        return {
          success: true,
          familyDb: db,
          chores: parsed.chores,
          message: `Connected via proxy to Chore-Quest! Found ${db.kids?.length || 0} kids and ${db.chores?.length || 0} active chore quests.`,
        };
      }
    }
  } catch {
    // Continue to direct browser fetch
  }

  // 2. Direct browser fetch
  const candidateUrls = [
    `${cleanEndpoint}/api/database`,
    `${cleanEndpoint}/api/chores`,
    `${cleanEndpoint}/chores`,
    `${cleanEndpoint}/api/tasks`,
  ];

  let lastError = '';

  for (const url of candidateUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const json = await response.json();
        if (json.kids && json.chores) {
          const db = json as ChoreQuestFamilyDatabase;
          const parsed = parseChoreQuestPayload(db, kidId, pointRatio);
          return {
            success: true,
            familyDb: db,
            chores: parsed.chores,
            message: `Successfully connected to Chore-Quest Family Database at ${url}!`,
          };
        }

        const parsed = parseChoreQuestPayload(json, kidId, pointRatio);
        if (parsed.chores.length > 0) {
          return {
            success: true,
            chores: parsed.chores,
            message: `Successfully pulled ${parsed.chores.length} chore quests from ${url}!`,
          };
        }
      }
    } catch (err: any) {
      lastError = err.message || 'Network error';
    }
  }

  return {
    success: false,
    chores: [],
    message: `Could not connect to Chore-Quest endpoint at ${endpoint} (${lastError}). Ensure your Chore-Quest container is running, or paste/import your Chore-Quest JSON!`,
  };
}

/**
 * Pushes updated database to Chore-Quest container via proxy or direct POST
 */
export async function pushToChoreQuest(
  endpoint: string,
  database: ChoreQuestFamilyDatabase
): Promise<{ success: boolean; message: string }> {
  const cleanEndpoint = endpoint.replace(/\/+$/, '');

  // 1. Try server proxy
  try {
    const proxyRes = await fetch('/api/chorequest/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: cleanEndpoint,
        action: 'push',
        database,
      }),
    });

    if (proxyRes.ok) {
      const data = await proxyRes.json();
      if (data.success) {
        return {
          success: true,
          message: `Successfully pushed updated family database to Chore-Quest container!`,
        };
      }
    }
  } catch {
    // fallback
  }

  // 2. Direct fetch
  try {
    const res = await fetch(`${cleanEndpoint}/api/database`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ database, senderId: 'kidcoin-vault' }),
    });

    if (res.ok) {
      return {
        success: true,
        message: `Successfully pushed database to Chore-Quest (${res.status} OK)!`,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to push database directly to ${cleanEndpoint}/api/database: ${err.message}`,
    };
  }

  return {
    success: false,
    message: `Could not push database to Chore-Quest at ${endpoint}.`,
  };
}

/**
 * Portainer Docker Compose stack YAML snippet combining Chore-Quest + KidCoin Vault
 */
export const PORTAINER_DOCKER_COMPOSE_SNIPPET = `version: '3.8'

services:
  # AstroLee93/Chore-Quest Container (Home Gamified Chores)
  chore-quest:
    image: astrolee93/chore-quest:latest
    container_name: chore-quest
    restart: unless-stopped
    ports:
      - "5000:3000"
    environment:
      - PORT=3000
      - CORS_ORIGIN=*
    volumes:
      - chorequest-data:/app/data
    networks:
      - family-pi-net

  # KidCoin Vault Container (Encrypted Child Savings, Goals & Compound Growth)
  kidcoin-vault:
    image: kidcoin-vault:latest
    container_name: kidcoin-vault
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - CHOREQUEST_URL=http://chore-quest:3000
    volumes:
      - kidcoin-data:/app/data
    depends_on:
      - chore-quest
    networks:
      - family-pi-net

volumes:
  chorequest-data:
    driver: local
  kidcoin-data:
    driver: local

networks:
  family-pi-net:
    driver: bridge
`;
