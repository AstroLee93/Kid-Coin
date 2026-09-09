import { playMilestoneFanfare, playCoinSound } from './sound';

export type NotificationType = 'milestone' | 'badge' | 'avatar' | 'allowance' | 'chore' | 'security';

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
}

type NotificationListener = (notification: ToastNotification) => void;
const listeners: Set<NotificationListener> = new Set();

export function subscribeNotifications(callback: NotificationListener) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

/**
 * Check if the browser supports standard Web Push Notifications
 */
export function isPushNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current browser notification permission
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isPushNotificationSupported()) return 'denied';
  return Notification.permission;
}

/**
 * Request notification permissions from the user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isPushNotificationSupported()) return false;
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return false;
  }
}

/**
 * Trigger a push notification and in-app toast for kids
 */
export function sendKidNotification(
  title: string,
  message: string,
  type: NotificationType = 'milestone'
) {
  const toast: ToastNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    message,
    type,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  // 1. Play audio cue
  if (type === 'milestone' || type === 'badge' || type === 'avatar') {
    playMilestoneFanfare();
  } else {
    playCoinSound();
  }

  // 2. Dispatch to active in-app toast listeners
  listeners.forEach((listener) => listener(toast));

  // 3. Trigger native Web Push Notification if permission granted
  if (isPushNotificationSupported() && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'kidcoin-milestone',
      });
    } catch (e) {
      console.warn('Native notification dispatch error:', e);
    }
  }

  return toast;
}
