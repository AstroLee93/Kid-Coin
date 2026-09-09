import React from 'react';
import {
  Gamepad2,
  Headphones,
  Tv,
  Boxes,
  Bike,
  Tablet,
  Coins,
  Sparkles,
  Target,
  ShoppingBag,
  Laptop,
  Smartphone,
  Camera,
  Watch,
  Car,
  ShieldCheck,
  Flame,
  CheckCircle2,
  Zap,
  Crown,
  Trophy,
  Lock,
  Award,
  Footprints,
  Utensils,
  Trash2,
  HeartHandshake,
  BookOpen,
  Gift,
} from 'lucide-react';

const isEmoji = (str: string): boolean => {
  if (!str) return false;
  // If it contains non-ASCII characters or common emoji ranges, treat as emoji
  return /[^\u0000-\u007F]/.test(str);
};

export const GoalIcon: React.FC<{
  icon?: string;
  className?: string;
  fallback?: React.ReactNode;
}> = ({ icon, className = 'w-5 h-5', fallback = <Target className={className} /> }) => {
  if (!icon) return <>{fallback}</>;

  if (isEmoji(icon)) {
    return <span className="inline-block select-none leading-none">{icon}</span>;
  }

  const normalized = icon.trim().toLowerCase();

  switch (normalized) {
    case 'gamepad2':
    case 'gamepad':
    case 'gaming':
      return <Gamepad2 className={className} />;
    case 'headphones':
    case 'headset':
    case 'audio':
      return <Headphones className={className} />;
    case 'tv':
    case 'television':
    case 'monitor':
      return <Tv className={className} />;
    case 'boxes':
    case 'box':
    case 'lego':
      return <Boxes className={className} />;
    case 'bike':
    case 'bicycle':
      return <Bike className={className} />;
    case 'tablet':
    case 'ipad':
      return <Tablet className={className} />;
    case 'laptop':
    case 'computer':
      return <Laptop className={className} />;
    case 'smartphone':
    case 'phone':
      return <Smartphone className={className} />;
    case 'camera':
      return <Camera className={className} />;
    case 'watch':
      return <Watch className={className} />;
    case 'car':
    case 'vehicle':
      return <Car className={className} />;
    case 'coins':
    case 'money':
      return <Coins className={className} />;
    case 'gift':
      return <Gift className={className} />;
    case 'trophy':
      return <Trophy className={className} />;
    case 'sparkles':
      return <Sparkles className={className} />;
    case 'shoppingbag':
      return <ShoppingBag className={className} />;
    default:
      return <Target className={className} />;
  }
};

export const BadgeIcon: React.FC<{
  icon?: string;
  className?: string;
}> = ({ icon, className = 'w-6 h-6' }) => {
  if (!icon) return <Award className={className} />;

  if (isEmoji(icon)) {
    return <span className="inline-block select-none text-2xl leading-none">{icon}</span>;
  }

  const normalized = icon.trim().toLowerCase();

  switch (normalized) {
    case 'coins':
      return <Coins className={`${className} text-amber-500`} />;
    case 'shieldcheck':
    case 'shield':
      return <ShieldCheck className={`${className} text-emerald-500`} />;
    case 'flame':
    case 'fire':
      return <Flame className={`${className} text-orange-500 fill-orange-500`} />;
    case 'checkcircle2':
    case 'check':
      return <CheckCircle2 className={`${className} text-emerald-500`} />;
    case 'zap':
    case 'lightning':
      return <Zap className={`${className} text-yellow-500 fill-yellow-500`} />;
    case 'crown':
      return <Crown className={`${className} text-indigo-500`} />;
    case 'trophy':
      return <Trophy className={`${className} text-amber-500`} />;
    case 'lock':
      return <Lock className={`${className} text-slate-500`} />;
    default:
      return <Award className={`${className} text-purple-500`} />;
  }
};

export const ChoreIcon: React.FC<{
  icon?: string;
  category?: string;
  className?: string;
}> = ({ icon, category, className = 'w-5 h-5' }) => {
  if (icon && isEmoji(icon)) {
    return <span className="inline-block select-none text-xl leading-none">{icon}</span>;
  }

  const normalized = (icon || '').trim().toLowerCase();

  switch (normalized) {
    case 'car':
      return <Car className={`${className} text-sky-500`} />;
    case 'utensils':
    case 'dishes':
      return <Utensils className={`${className} text-amber-500`} />;
    case 'footprints':
    case 'pets':
    case 'dog':
      return <Footprints className={`${className} text-emerald-500`} />;
    case 'trash2':
    case 'trash':
    case 'recycling':
      return <Trash2 className={`${className} text-slate-500`} />;
    case 'hearthandshake':
      return <HeartHandshake className={`${className} text-pink-500`} />;
    case 'bookopen':
    case 'school':
      return <BookOpen className={`${className} text-indigo-500`} />;
    case 'sparkles':
      return <Sparkles className={`${className} text-purple-500`} />;
    default:
      if (category === 'yard') return <Car className={`${className} text-sky-500`} />;
      if (category === 'pets') return <Footprints className={`${className} text-emerald-500`} />;
      if (category === 'school') return <BookOpen className={`${className} text-indigo-500`} />;
      return <Sparkles className={`${className} text-purple-500`} />;
  }
};
