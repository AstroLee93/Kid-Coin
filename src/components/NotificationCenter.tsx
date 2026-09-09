import React, { useEffect, useState } from 'react';
import { subscribeNotifications, ToastNotification, requestNotificationPermission, getNotificationPermission, sendKidNotification } from '../lib/notifications';
import { Bell, CheckCircle2, Trophy, Award, DollarSign, X, Shield, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const NotificationCenter: React.FC = () => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    setPermission(getNotificationPermission());

    const unsubscribe = subscribeNotifications((newToast) => {
      setToasts((prev) => [newToast, ...prev.slice(0, 4)]);
      // Auto-dismiss after 6 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 6000);
    });

    return unsubscribe;
  }, []);

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermission(granted ? 'granted' : 'denied');
    if (granted) {
      sendKidNotification(
        '🔔 Push Notifications Activated!',
        'You will now get instant alerts when you reach savings milestones!',
        'security'
      );
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'milestone':
        return <Trophy className="w-5 h-5 text-amber-500" />;
      case 'badge':
        return <Award className="w-5 h-5 text-indigo-500" />;
      case 'avatar':
        return <Sparkles className="w-5 h-5 text-purple-500" />;
      case 'allowance':
      case 'chore':
        return <DollarSign className="w-5 h-5 text-emerald-500" />;
      case 'security':
        return <Shield className="w-5 h-5 text-cyan-500" />;
      default:
        return <Bell className="w-5 h-5 text-sky-500" />;
    }
  };

  return (
    <>
      {/* Toast Notification Container (Top Right) */}
      <div id="toast-container" className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="pointer-events-auto flex items-start gap-3 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
            >
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                {getIcon(toast.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {toast.title}
                  </h4>
                  <span className="text-[11px] text-slate-600 dark:text-slate-300 shrink-0">
                    {toast.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200 mt-0.5 leading-relaxed">
                  {toast.message}
                </p>
              </div>
              <button
                id={`dismiss-${toast.id}`}
                onClick={() => removeToast(toast.id)}
                className="text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100 p-1"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Permission banner prompt if not yet granted */}
      {permission === 'default' && (
        <div id="push-permission-prompt" className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 rounded-xl p-3 px-4 flex flex-wrap items-center justify-between gap-3 text-sm text-sky-900 dark:text-sky-200 mb-6">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 animate-bounce" />
            <p>
              <strong>Turn on Milestone Push Alerts:</strong> Get alerted the second you hit 25%, 50%, 75%, or reach your goal!
            </p>
          </div>
          <button
            id="enable-notifications-btn"
            onClick={handleRequestPermission}
            className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Enable Push Alerts
          </button>
        </div>
      )}
    </>
  );
};
