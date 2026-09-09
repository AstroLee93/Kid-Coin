import { Chore, ChoreQuestConfig } from '../types';

const STORAGE_KEY = 'kidcoin_chorequest_config';

export const DEFAULT_CHOREQUEST_CONFIG: ChoreQuestConfig = {
  endpoint: 'http://localhost:5000',
  pointRatio: 0.10, // 10 points = $1.00 (e.g. 50 pts chore = $5.00 reward)
  autoSync: false,
};

// Sample quests representing AstroLee93/Chore-Quest Portainer stack data
export const SAMPLE_CHOREQUEST_DATA = [
  {
    id: 'cq-101',
    task: 'Wash Dinner Dishes & Wipe Counter',
    points: 30,
    category: 'cleaning',
    completed: false,
  },
  {
    id: 'cq-102',
    task: 'Feed & Brush Pets in Backyard',
    points: 20,
    category: 'pets',
    completed: false,
  },
  {
    id: 'cq-103',
    task: 'Finish Weekend Math Homework Quest',
    points: 50,
    category: 'school',
    completed: false,
  },
  {
    id: 'cq-104',
    task: 'Take Out Recycling & Compost Bins',
    points: 25,
    category: 'yard',
    completed: false,
  },
  {
    id: 'cq-105',
    task: 'Vacuum Living Room & Tidy Game Center',
    points: 40,
    category: 'cleaning',
    completed: false,
  }
];

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
 * Parses raw JSON string or object from AstroLee93/Chore-Quest
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
      // Maybe an object with keys as items
      items = Object.values(rawData).filter((v) => typeof v === 'object' && v !== null);
    }
  }

  if (!items || items.length === 0) {
    result.errors.push('No chore quest list found in provided payload.');
    return result;
  }

  items.forEach((item, index) => {
    if (!item || typeof item !== 'object') return;

    // Detect title from various common ChoreQuest keys
    const title = item.task || item.title || item.name || item.description || `Chore Quest #${index + 1}`;
    
    // Detect points/value
    const rawPoints = item.points ?? item.pointValue ?? item.value ?? item.reward ?? 10;
    const points = typeof rawPoints === 'number' ? rawPoints : parseFloat(rawPoints) || 10;
    
    // Calculate dollar bounty from point ratio
    const rewardAmount = Math.max(0.25, Number((points * pointRatio).toFixed(2)));

    // Category mapping
    const rawCat = String(item.category || item.type || '').toLowerCase();
    let category: 'cleaning' | 'pets' | 'school' | 'yard' | 'quest' = 'quest';
    if (rawCat.includes('clean') || rawCat.includes('room') || rawCat.includes('dish')) category = 'cleaning';
    else if (rawCat.includes('pet') || rawCat.includes('dog') || rawCat.includes('cat')) category = 'pets';
    else if (rawCat.includes('school') || rawCat.includes('homework') || rawCat.includes('study')) category = 'school';
    else if (rawCat.includes('yard') || rawCat.includes('garden') || rawCat.includes('lawn') || rawCat.includes('trash')) category = 'yard';

    // Appropriate icon for ChoreQuest
    let icon = '⚔️';
    if (category === 'cleaning') icon = '🧹';
    else if (category === 'pets') icon = '🐾';
    else if (category === 'school') icon = '📚';
    else if (category === 'yard') icon = '🌿';

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
      isRepeatingWeekly: Boolean(item.isRepeating || (item.weekly ?? true)),
      source: 'chore-quest',
      choreQuestPoints: points,
      questId: item.id || index,
    });
  });

  result.totalParsed = result.chores.length;
  return result;
}

/**
 * Attempts to fetch live chores from the Chore-Quest Portainer stack
 */
export async function fetchFromChoreQuest(
  endpoint: string,
  kidId: string,
  pointRatio: number
): Promise<{ success: boolean; chores: Chore[]; message: string }> {
  const cleanEndpoint = endpoint.replace(/\/+$/, '');
  
  // Try common endpoints in Chore-Quest
  const candidateUrls = [
    `${cleanEndpoint}/api/chores`,
    `${cleanEndpoint}/chores`,
    `${cleanEndpoint}/api/tasks`,
    `${cleanEndpoint}/tasks`,
  ];

  let lastError = '';

  for (const url of candidateUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const json = await response.json();
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
    message: `Could not connect to Chore-Quest endpoint at ${endpoint} (${lastError}). If your browser is blocking cross-origin local requests, use the JSON import or Portainer bridge below!`,
  };
}

/**
 * Docker Compose snippet for Portainer stack
 */
export const PORTAINER_DOCKER_COMPOSE_SNIPPET = `version: '3.8'

services:
  # Your existing Chore-Quest container on Raspberry Pi
  chore-quest:
    image: astrolee93/chore-quest:latest # or your built image
    container_name: chore-quest
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - CORS_ORIGIN=* # Allows KidCoin web app to fetch chores
    networks:
      - pi-stack-net

  # KidCoin encrypted offline child finance app
  kidcoin:
    image: kidcoin:latest
    container_name: kidcoin
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - CHOREQUEST_URL=http://chore-quest:5000
    volumes:
      - ./data:/app/data
    networks:
      - pi-stack-net

networks:
  pi-stack-net:
    driver: bridge
`;
