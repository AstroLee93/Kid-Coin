export type ThemeColor = 'amber' | 'emerald' | 'sky' | 'purple' | 'rose' | 'teal' | 'coral';

export interface ThemeOption {
  id: ThemeColor;
  name: string;
  emoji: string;
  tagline: string;
  primaryColor: string;
  primaryHoverColor: string;

  // App Page Backgrounds
  lightBg: string;
  darkBg: string;
  pageBgClass: string;

  // Surfaces & Cards
  lightCardBg: string;
  darkCardBg: string;
  cardClass: string;
  cardBorderClass: string;

  // Header & Bar styling
  headerBgClass: string;

  // Subtle Chip & Icon Container background
  subtleBgClass: string;

  // Accents & Badges
  accentBg: string;
  accentHoverBg: string;
  accentText: string;
  accentBorder: string;
  badgeBg: string;
  badgeText: string;

  // Gradients
  progressBarGradient: string;
  glowGradient: string;

  // Buttons & Focus rings
  btnClass: string;
  ringClass: string;

  // Color values for CSS variables
  cssVars: {
    primary: string;
    primaryHover: string;
    lightBg: string;
    darkBg: string;
    lightCard: string;
    darkCard: string;
    lightBorder: string;
    darkBorder: string;
    softLight: string;
    softDark: string;
    textLight: string;
    textDark: string;
  };
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'amber',
    name: 'Treasure Gold',
    emoji: '🪙',
    tagline: 'Warm Gold & Honey Ivory',
    primaryColor: '#f59e0b',
    primaryHoverColor: '#d97706',
    lightBg: '#fefcf6',
    darkBg: '#15110a',
    pageBgClass: 'bg-[#fefcf6] dark:bg-[#15110a]',
    lightCardBg: '#ffffff',
    darkCardBg: '#1f1911',
    cardClass: 'bg-white dark:bg-[#1f1911]',
    cardBorderClass: 'border-amber-200/80 dark:border-amber-950/80',
    headerBgClass: 'bg-[#fefcf6]/90 dark:bg-[#15110a]/90 border-amber-200/80 dark:border-amber-950/80',
    subtleBgClass: 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/40',
    accentBg: 'bg-amber-500',
    accentHoverBg: 'hover:bg-amber-600',
    accentText: 'text-amber-600 dark:text-amber-400',
    accentBorder: 'border-amber-300 dark:border-amber-700',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/70',
    badgeText: 'text-amber-900 dark:text-amber-300',
    progressBarGradient: 'from-amber-400 via-yellow-500 to-orange-500',
    glowGradient: 'radial-gradient(circle at 50% 0%, rgba(245, 158, 11, 0.16) 0%, transparent 65%)',
    btnClass: 'bg-amber-500 hover:bg-amber-600 active:scale-95 text-white shadow-xs',
    ringClass: 'ring-amber-500',
    cssVars: {
      primary: '#f59e0b',
      primaryHover: '#d97706',
      lightBg: '#fefcf6',
      darkBg: '#15110a',
      lightCard: '#ffffff',
      darkCard: '#1f1911',
      lightBorder: '#fde68a',
      darkBorder: '#451a03',
      softLight: '#fef3c7',
      softDark: '#3b1d06',
      textLight: '#b45309',
      textDark: '#fcd34d',
    },
  },
  {
    id: 'emerald',
    name: 'Mint Vault',
    emoji: '🌲',
    tagline: 'Crisp Mint & Pine Forest',
    primaryColor: '#10b981',
    primaryHoverColor: '#059669',
    lightBg: '#f1fbf5',
    darkBg: '#061611',
    pageBgClass: 'bg-[#f1fbf5] dark:bg-[#061611]',
    lightCardBg: '#ffffff',
    darkCardBg: '#0b241c',
    cardClass: 'bg-white dark:bg-[#0b241c]',
    cardBorderClass: 'border-emerald-200/80 dark:border-emerald-950/80',
    headerBgClass: 'bg-[#f1fbf5]/90 dark:bg-[#061611]/90 border-emerald-200/80 dark:border-emerald-950/80',
    subtleBgClass: 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/40',
    accentBg: 'bg-emerald-600',
    accentHoverBg: 'hover:bg-emerald-700',
    accentText: 'text-emerald-600 dark:text-emerald-400',
    accentBorder: 'border-emerald-300 dark:border-emerald-700',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/70',
    badgeText: 'text-emerald-900 dark:text-emerald-300',
    progressBarGradient: 'from-emerald-400 via-teal-500 to-green-600',
    glowGradient: 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.16) 0%, transparent 65%)',
    btnClass: 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-xs',
    ringClass: 'ring-emerald-500',
    cssVars: {
      primary: '#10b981',
      primaryHover: '#059669',
      lightBg: '#f1fbf5',
      darkBg: '#061611',
      lightCard: '#ffffff',
      darkCard: '#0b241c',
      lightBorder: '#a7f3d0',
      darkBorder: '#064e3b',
      softLight: '#d1fae5',
      softDark: '#063325',
      textLight: '#047857',
      textDark: '#6ee7b7',
    },
  },
  {
    id: 'sky',
    name: 'Ocean Blue',
    emoji: '🌊',
    tagline: 'Glacier Ice & Deep Ocean',
    primaryColor: '#0284c7',
    primaryHoverColor: '#0369a1',
    lightBg: '#f0f7fd',
    darkBg: '#071524',
    pageBgClass: 'bg-[#f0f7fd] dark:bg-[#071524]',
    lightCardBg: '#ffffff',
    darkCardBg: '#0d2138',
    cardClass: 'bg-white dark:bg-[#0d2138]',
    cardBorderClass: 'border-sky-200/80 dark:border-sky-950/80',
    headerBgClass: 'bg-[#f0f7fd]/90 dark:bg-[#071524]/90 border-sky-200/80 dark:border-sky-950/80',
    subtleBgClass: 'bg-sky-50 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-900/40',
    accentBg: 'bg-sky-600',
    accentHoverBg: 'hover:bg-sky-700',
    accentText: 'text-sky-600 dark:text-sky-400',
    accentBorder: 'border-sky-300 dark:border-sky-700',
    badgeBg: 'bg-sky-100 dark:bg-sky-950/70',
    badgeText: 'text-sky-900 dark:text-sky-300',
    progressBarGradient: 'from-sky-400 via-blue-500 to-indigo-600',
    glowGradient: 'radial-gradient(circle at 50% 0%, rgba(2, 132, 199, 0.16) 0%, transparent 65%)',
    btnClass: 'bg-sky-600 hover:bg-sky-700 active:scale-95 text-white shadow-xs',
    ringClass: 'ring-sky-500',
    cssVars: {
      primary: '#0284c7',
      primaryHover: '#0369a1',
      lightBg: '#f0f7fd',
      darkBg: '#071524',
      lightCard: '#ffffff',
      darkCard: '#0d2138',
      lightBorder: '#bae6fd',
      darkBorder: '#0c4a6e',
      softLight: '#e0f2fe',
      softDark: '#082f49',
      textLight: '#0369a1',
      textDark: '#7dd3fc',
    },
  },
  {
    id: 'purple',
    name: 'Cosmic Violet',
    emoji: '🔮',
    tagline: 'Starlight Lilac & Galactic Nebula',
    primaryColor: '#9333ea',
    primaryHoverColor: '#7e22ce',
    lightBg: '#f8f4fe',
    darkBg: '#120921',
    pageBgClass: 'bg-[#f8f4fe] dark:bg-[#120921]',
    lightCardBg: '#ffffff',
    darkCardBg: '#1d1133',
    cardClass: 'bg-white dark:bg-[#1d1133]',
    cardBorderClass: 'border-purple-200/80 dark:border-purple-950/80',
    headerBgClass: 'bg-[#f8f4fe]/90 dark:bg-[#120921]/90 border-purple-200/80 dark:border-purple-950/80',
    subtleBgClass: 'bg-purple-50 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-900/40',
    accentBg: 'bg-purple-600',
    accentHoverBg: 'hover:bg-purple-700',
    accentText: 'text-purple-600 dark:text-purple-400',
    accentBorder: 'border-purple-300 dark:border-purple-700',
    badgeBg: 'bg-purple-100 dark:bg-purple-950/70',
    badgeText: 'text-purple-900 dark:text-purple-300',
    progressBarGradient: 'from-purple-400 via-violet-500 to-fuchsia-600',
    glowGradient: 'radial-gradient(circle at 50% 0%, rgba(147, 51, 234, 0.16) 0%, transparent 65%)',
    btnClass: 'bg-purple-600 hover:bg-purple-700 active:scale-95 text-white shadow-xs',
    ringClass: 'ring-purple-500',
    cssVars: {
      primary: '#9333ea',
      primaryHover: '#7e22ce',
      lightBg: '#f8f4fe',
      darkBg: '#120921',
      lightCard: '#ffffff',
      darkCard: '#1d1133',
      lightBorder: '#e9d5ff',
      darkBorder: '#581c87',
      softLight: '#f3e8ff',
      softDark: '#3b0764',
      textLight: '#7e22ce',
      textDark: '#d8b4fe',
    },
  },
  {
    id: 'rose',
    name: 'Ruby Rose',
    emoji: '💖',
    tagline: 'Velvet Blush & Deep Ruby',
    primaryColor: '#e11d48',
    primaryHoverColor: '#be123c',
    lightBg: '#fef3f5',
    darkBg: '#1c0a12',
    pageBgClass: 'bg-[#fef3f5] dark:bg-[#1c0a12]',
    lightCardBg: '#ffffff',
    darkCardBg: '#2b111e',
    cardClass: 'bg-white dark:bg-[#2b111e]',
    cardBorderClass: 'border-rose-200/80 dark:border-rose-950/80',
    headerBgClass: 'bg-[#fef3f5]/90 dark:bg-[#1c0a12]/90 border-rose-200/80 dark:border-rose-950/80',
    subtleBgClass: 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/40',
    accentBg: 'bg-rose-600',
    accentHoverBg: 'hover:bg-rose-700',
    accentText: 'text-rose-600 dark:text-rose-400',
    accentBorder: 'border-rose-300 dark:border-rose-700',
    badgeBg: 'bg-rose-100 dark:bg-rose-950/70',
    badgeText: 'text-rose-900 dark:text-rose-300',
    progressBarGradient: 'from-rose-400 via-pink-500 to-red-600',
    glowGradient: 'radial-gradient(circle at 50% 0%, rgba(225, 29, 72, 0.16) 0%, transparent 65%)',
    btnClass: 'bg-rose-600 hover:bg-rose-700 active:scale-95 text-white shadow-xs',
    ringClass: 'ring-rose-500',
    cssVars: {
      primary: '#e11d48',
      primaryHover: '#be123c',
      lightBg: '#fef3f5',
      darkBg: '#1c0a12',
      lightCard: '#ffffff',
      darkCard: '#2b111e',
      lightBorder: '#fecdd3',
      darkBorder: '#881337',
      softLight: '#ffe4e6',
      softDark: '#4c0519',
      textLight: '#be123c',
      textDark: '#fda4af',
    },
  },
  {
    id: 'teal',
    name: 'Cyber Teal',
    emoji: '⚡',
    tagline: 'Seafoam Lagoon & Deep Mariana',
    primaryColor: '#0d9488',
    primaryHoverColor: '#0f766e',
    lightBg: '#f0faf8',
    darkBg: '#051817',
    pageBgClass: 'bg-[#f0faf8] dark:bg-[#051817]',
    lightCardBg: '#ffffff',
    darkCardBg: '#0a2927',
    cardClass: 'bg-white dark:bg-[#0a2927]',
    cardBorderClass: 'border-teal-200/80 dark:border-teal-950/80',
    headerBgClass: 'bg-[#f0faf8]/90 dark:bg-[#051817]/90 border-teal-200/80 dark:border-teal-950/80',
    subtleBgClass: 'bg-teal-50 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-900/40',
    accentBg: 'bg-teal-600',
    accentHoverBg: 'hover:bg-teal-700',
    accentText: 'text-teal-600 dark:text-teal-400',
    accentBorder: 'border-teal-300 dark:border-teal-700',
    badgeBg: 'bg-teal-100 dark:bg-teal-950/70',
    badgeText: 'text-teal-900 dark:text-teal-300',
    progressBarGradient: 'from-teal-400 via-cyan-500 to-emerald-500',
    glowGradient: 'radial-gradient(circle at 50% 0%, rgba(13, 148, 136, 0.16) 0%, transparent 65%)',
    btnClass: 'bg-teal-600 hover:bg-teal-700 active:scale-95 text-white shadow-xs',
    ringClass: 'ring-teal-500',
    cssVars: {
      primary: '#0d9488',
      primaryHover: '#0f766e',
      lightBg: '#f0faf8',
      darkBg: '#051817',
      lightCard: '#ffffff',
      darkCard: '#0a2927',
      lightBorder: '#99f6e4',
      darkBorder: '#134e4a',
      softLight: '#ccfbf1',
      softDark: '#042f2e',
      textLight: '#0f766e',
      textDark: '#5eead4',
    },
  },
  {
    id: 'coral',
    name: 'Coral Sunset',
    emoji: '🪸',
    tagline: 'Tropical Peach & Volcanic Ember',
    primaryColor: '#f97316',
    primaryHoverColor: '#ea580c',
    lightBg: '#fef6f0',
    darkBg: '#1a0f07',
    pageBgClass: 'bg-[#fef6f0] dark:bg-[#1a0f07]',
    lightCardBg: '#ffffff',
    darkCardBg: '#29180c',
    cardClass: 'bg-white dark:bg-[#29180c]',
    cardBorderClass: 'border-orange-200/80 dark:border-orange-950/80',
    headerBgClass: 'bg-[#fef6f0]/90 dark:bg-[#1a0f07]/90 border-orange-200/80 dark:border-orange-950/80',
    subtleBgClass: 'bg-orange-50 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-900/40',
    accentBg: 'bg-orange-500',
    accentHoverBg: 'hover:bg-orange-600',
    accentText: 'text-orange-600 dark:text-orange-400',
    accentBorder: 'border-orange-300 dark:border-orange-700',
    badgeBg: 'bg-orange-100 dark:bg-orange-950/70',
    badgeText: 'text-orange-900 dark:text-orange-300',
    progressBarGradient: 'from-amber-400 via-orange-500 to-rose-500',
    glowGradient: 'radial-gradient(circle at 50% 0%, rgba(249, 115, 22, 0.16) 0%, transparent 65%)',
    btnClass: 'bg-orange-500 hover:bg-orange-600 active:scale-95 text-white shadow-xs',
    ringClass: 'ring-orange-500',
    cssVars: {
      primary: '#f97316',
      primaryHover: '#ea580c',
      lightBg: '#fef6f0',
      darkBg: '#1a0f07',
      lightCard: '#ffffff',
      darkCard: '#29180c',
      lightBorder: '#fed7aa',
      darkBorder: '#7c2d12',
      softLight: '#ffedd5',
      softDark: '#431407',
      textLight: '#ea580c',
      textDark: '#fdba74',
    },
  },
];

const THEME_STORAGE_KEY = 'kidcoin_active_theme_color';

export function getSavedTheme(): ThemeColor {
  if (typeof window === 'undefined') return 'amber';
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeColor;
    return saved && THEME_OPTIONS.some((t) => t.id === saved) ? saved : 'amber';
  } catch {
    return 'amber';
  }
}

export function saveTheme(theme: ThemeColor) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (e) {
    console.error('Failed to save theme color:', e);
  }
}

export function getThemeConfig(themeId: ThemeColor): ThemeOption {
  return THEME_OPTIONS.find((t) => t.id === themeId) || THEME_OPTIONS[0];
}

/**
 * Injects CSS variables and sets background styles on the html and body elements
 * so the entire browser canvas transforms into the chosen theme and mode.
 */
export function applyThemeToDocument(theme: ThemeOption, isDark: boolean) {
  if (typeof window === 'undefined' || !document || !document.documentElement) return;

  const bg = isDark ? theme.darkBg : theme.lightBg;
  const cardBg = isDark ? theme.darkCardBg : theme.lightCardBg;
  const borderColor = isDark ? theme.cssVars.darkBorder : theme.cssVars.lightBorder;
  const softBg = isDark ? theme.cssVars.softDark : theme.cssVars.softLight;
  const accentText = isDark ? theme.cssVars.textDark : theme.cssVars.textLight;

  // Apply to document background
  document.documentElement.style.backgroundColor = bg;
  document.body.style.backgroundColor = bg;

  // Set CSS custom variables
  const root = document.documentElement;
  root.style.setProperty('--app-bg', bg);
  root.style.setProperty('--app-card-bg', cardBg);
  root.style.setProperty('--app-card-border', borderColor);
  root.style.setProperty('--app-primary', theme.primaryColor);
  root.style.setProperty('--app-primary-hover', theme.primaryHoverColor);
  root.style.setProperty('--app-soft-bg', softBg);
  root.style.setProperty('--app-accent-text', accentText);
}
