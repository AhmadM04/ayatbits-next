'use client';

import { useState, useEffect, useCallback } from 'react';
import { useI18n } from '@/lib/i18n';
import { Sun, Moon, Monitor, Bell, BellOff, Mail, ShieldAlert, Loader2 } from 'lucide-react';

// =============================================================================
// Types
// =============================================================================

interface UserPreferencesProps {
  initialTheme?: 'light' | 'dark' | 'system';
  initialEmailNotifications?: boolean;
  initialInAppNotifications?: boolean;
}

type PushStatus =
  | 'loading'       // Checking browser state on mount
  | 'unsupported'   // Browser / OS doesn't support push
  | 'denied'        // User permanently blocked notifications at browser level
  | 'subscribed'    // Active push subscription
  | 'unsubscribed'; // Permission granted (or default) but no subscription

// =============================================================================
// Helpers
// =============================================================================

/** VAPID public key from environment – must be set in .env */
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';

/**
 * Convert a URL-safe base64 VAPID key to a Uint8Array for
 * `pushManager.subscribe({ applicationServerKey })`.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// =============================================================================
// Component
// =============================================================================

export default function UserPreferences({
  initialTheme = 'dark',
  initialEmailNotifications = true,
  initialInAppNotifications = true,
}: UserPreferencesProps) {
  const { t } = useI18n();

  // ── Theme state ───────────────────────────────────────────────────────
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'system'>(initialTheme);

  // ── Email notifications (simple boolean) ──────────────────────────────
  const [emailNotifications, setEmailNotifications] = useState(initialEmailNotifications);

  // ── Push notification state ───────────────────────────────────────────
  const [pushStatus, setPushStatus] = useState<PushStatus>('loading');
  const [pushLoading, setPushLoading] = useState(false);

  // ====================================================================
  // Theme logic (unchanged from original)
  // ====================================================================

  useEffect(() => {
    const cookieTheme = document.cookie.match(/theme=([^;]+)/)?.[1] as 'light' | 'dark' | 'system' | null;
    const localTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    const themeToApply = cookieTheme || localTheme || initialTheme;

    setCurrentTheme(themeToApply);
    applyThemeToDom(themeToApply);

    if (cookieTheme && !localTheme) {
      localStorage.setItem('theme', cookieTheme);
    } else if (localTheme && !cookieTheme) {
      document.cookie = `theme=${localTheme}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, [initialTheme]);

  const applyThemeToDom = (theme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    let effectiveTheme: 'dark' | 'light' = 'dark';

    if (theme === 'dark') {
      effectiveTheme = 'dark';
    } else if (theme === 'light') {
      effectiveTheme = 'light';
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveTheme = isDark ? 'dark' : 'light';
    }

    root.classList.toggle('dark', effectiveTheme === 'dark');
    root.classList.toggle('light', effectiveTheme === 'light');
  };

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    applyThemeToDom(newTheme);
    setCurrentTheme(newTheme);
    document.cookie = `theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;
    localStorage.setItem('theme', newTheme);
    updatePreference('theme', newTheme).catch(() => {});
  };

  // ====================================================================
  // Email notifications toggle (unchanged)
  // ====================================================================

  const handleEmailNotificationsToggle = async () => {
    const newValue = !emailNotifications;
    setEmailNotifications(newValue);
    await updatePreference('emailNotifications', newValue);
  };

  // ====================================================================
  // Push notification lifecycle
  // ====================================================================

  /**
   * On mount, determine the actual browser permission + subscription state
   * so the toggle accurately reflects reality.
   */
  useEffect(() => {
    detectPushStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const detectPushStatus = useCallback(async () => {
    try {
      // ── 1. Environment checks ─────────────────────────────────────
      // SSR guard
      if (typeof window === 'undefined') {
        setPushStatus('unsupported');
        return;
      }

      // Service Worker + Push + Notification API must all be present.
      // They are absent on insecure HTTP contexts, older browsers, and
      // some in-app webviews.
      if (
        !('serviceWorker' in navigator) ||
        !('PushManager' in window) ||
        !('Notification' in window)
      ) {
        setPushStatus('unsupported');
        return;
      }

      // ── 2. Handle "denied" permission ─────────────────────────────
      if (Notification.permission === 'denied') {
        setPushStatus('denied');
        return;
      }

      // ── 3. Check for an *existing* SW registration ────────────────
      // `navigator.serviceWorker.ready` hangs forever when no SW is
      // registered (e.g. in dev mode where next-pwa disables itself).
      // `getRegistration()` resolves immediately to `undefined` instead.
      const registration = await navigator.serviceWorker.getRegistration();

      if (!registration) {
        // No service worker registered → push is unsupported at runtime
        setPushStatus('unsupported');
        return;
      }

      // ── 4. Check for an existing push subscription ────────────────
      const existingSub = await registration.pushManager.getSubscription();
      setPushStatus(existingSub ? 'subscribed' : 'unsubscribed');
    } catch {
      // Any unexpected error → fall back to unsubscribed so the toggle
      // is still interactive (user can try subscribing).
      setPushStatus('unsubscribed');
    }
  }, []);

  // ── Subscribe ─────────────────────────────────────────────────────────
  const subscribeToPush = async () => {
    setPushLoading(true);

    try {
      // 1. Ask the user for permission
      const permission = await Notification.requestPermission();

      if (permission === 'denied') {
        setPushStatus('denied');
        return;
      }

      if (permission !== 'granted') {
        // User dismissed the prompt – stay unsubscribed
        setPushStatus('unsubscribed');
        return;
      }

      // 2. Subscribe via the PushManager
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        setPushStatus('unsupported');
        return;
      }

      const subscribeOptions: PushSubscriptionOptionsInit = {
        userVisibleOnly: true,
      };
      if (VAPID_PUBLIC_KEY) {
        subscribeOptions.applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer;
      }
      const subscription = await registration.pushManager.subscribe(subscribeOptions);

      // 3. Send the subscription to our backend
      const subJSON = subscription.toJSON();

      await fetch('/api/user/push-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subJSON.endpoint,
          keys: subJSON.keys,
        }),
      });

      setPushStatus('subscribed');
    } catch (err) {
      console.error('Push subscription failed:', err);
      // Re-detect state in case the browser changed something
      await detectPushStatus();
    } finally {
      setPushLoading(false);
    }
  };

  // ── Unsubscribe ───────────────────────────────────────────────────────
  const unsubscribeFromPush = async () => {
    setPushLoading(true);

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
          const endpoint = subscription.endpoint;

          // 1. Unsubscribe in the browser
          await subscription.unsubscribe();

          // 2. Remove from our backend
          await fetch('/api/user/push-subscription', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint }),
          });
        }
      }

      setPushStatus('unsubscribed');
    } catch (err) {
      console.error('Push unsubscription failed:', err);
      await detectPushStatus();
    } finally {
      setPushLoading(false);
    }
  };

  // ── Toggle handler ────────────────────────────────────────────────────
  const handlePushToggle = async () => {
    if (pushLoading) return;

    if (pushStatus === 'subscribed') {
      await unsubscribeFromPush();
    } else if (pushStatus === 'unsubscribed') {
      await subscribeToPush();
    }
    // 'denied', 'unsupported', 'loading' → toggle does nothing
  };

  // ====================================================================
  // Shared preference persistence helper
  // ====================================================================

  const updatePreference = async (key: string, value: any) => {
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });

      if (!response.ok) {
        throw new Error('Failed to update preference');
      }

      return response.json();
    } catch (error) {
      console.error('Failed to update preference:', error);
      throw error;
    }
  };

  // ====================================================================
  // Derived UI state for the push toggle
  // ====================================================================

  const isPushOn = pushStatus === 'subscribed';
  const isPushDisabled =
    pushStatus === 'loading' ||
    pushStatus === 'unsupported' ||
    pushStatus === 'denied' ||
    pushLoading;

  /** Small helper text shown beneath the push toggle. */
  const pushHelperText = (() => {
    switch (pushStatus) {
      case 'loading':
        return t('preferences.pushChecking');
      case 'unsupported':
        return t('preferences.pushUnsupported');
      case 'denied':
        return t('preferences.pushBlocked');
      case 'subscribed':
        return t('preferences.pushActiveDesc');
      case 'unsubscribed':
      default:
        return t('preferences.pushNotificationsDesc');
    }
  })();

  // ====================================================================
  // Theme options
  // ====================================================================

  const themeOptions = [
    { value: 'light' as const, label: t('preferences.lightMode'), icon: Sun },
    { value: 'dark' as const, label: t('preferences.darkMode'), icon: Moon },
    { value: 'system' as const, label: t('preferences.systemMode'), icon: Monitor },
  ];

  // ====================================================================
  // Render
  // ====================================================================

  return (
    <div className="space-y-6">
      {/* ── Theme Selection ────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-6 transition-colors hover:border-gray-300 dark:hover:border-white/20 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-[#4A3728] dark:text-white mb-1">{t('preferences.appearance')}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('preferences.appearanceDescription')}</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = currentTheme === option.value;

            return (
              <button
                key={option.value}
                onClick={() => handleThemeChange(option.value)}
                className={`
                  relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer
                  ${isSelected
                    ? 'border-emerald-500 dark:border-emerald-500/70 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-100 dark:hover:bg-white/10'
                  }
                `}
              >
                <Icon className={`w-6 h-6 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400'}`} />
                <span className={`text-sm font-medium ${isSelected ? 'text-[#4A3728] dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                  {option.label}
                </span>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Notification Settings ──────────────────────────────────── */}
      <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-6 transition-colors hover:border-gray-300 dark:hover:border-white/20 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-[#4A3728] dark:text-white mb-1">{t('preferences.notifications')}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('preferences.notificationsDescription')}</p>
        </div>

        <div className="space-y-4">
          {/* ── Email Notifications ──────────────────────────────── */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-300 dark:border-emerald-500/30">
                <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-medium text-[#4A3728] dark:text-white">{t('preferences.emailNotifications')}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{t('preferences.emailNotificationsDesc')}</p>
              </div>
            </div>

            <button
              onClick={handleEmailNotificationsToggle}
              className={`
                relative w-14 h-8 rounded-full transition-colors cursor-pointer
                ${emailNotifications ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-gray-700'}
              `}
            >
              <div
                className={`
                  absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform
                  ${emailNotifications ? 'translate-x-7' : 'translate-x-1'}
                `}
              />
            </button>
          </div>

          {/* ── Push Notifications (wired to Web Push API) ───────── */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg border ${
                pushStatus === 'denied'
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-500/30'
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-500/30'
              }`}>
                {pushStatus === 'denied' ? (
                  <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
                ) : isPushOn ? (
                  <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <BellOff className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-[#4A3728] dark:text-white">{t('preferences.pushNotifications')}</p>
                  {pushStatus === 'denied' && (
                    <span className="text-xs px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 rounded-md">
                      {t('preferences.pushBlockedBadge')}
                    </span>
                  )}
                  {pushStatus === 'unsupported' && (
                    <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10 rounded-md">
                      {t('preferences.pushUnsupportedBadge')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{pushHelperText}</p>
              </div>
            </div>

            <button
              onClick={handlePushToggle}
              disabled={isPushDisabled}
              className={`
                relative w-14 h-8 rounded-full transition-colors flex-shrink-0
                ${isPushDisabled
                  ? 'bg-gray-200 dark:bg-gray-700 opacity-50 cursor-not-allowed'
                  : isPushOn
                    ? 'bg-emerald-600 cursor-pointer'
                    : 'bg-gray-200 dark:bg-gray-700 cursor-pointer'
                }
              `}
            >
              {pushLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-gray-500 dark:text-gray-400 animate-spin" />
                </div>
              ) : (
                <div
                  className={`
                    absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform
                    ${isPushOn ? 'translate-x-7' : 'translate-x-1'}
                  `}
                />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
