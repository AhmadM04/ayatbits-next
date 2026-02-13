'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useTheme } from '@/lib/theme-context';
import { Sun, Moon, Monitor, Bell, BellOff, Mail } from 'lucide-react';

interface UserPreferencesProps {
  initialTheme?: 'light' | 'dark' | 'system';
  initialEmailNotifications?: boolean;
  initialInAppNotifications?: boolean;
}

export default function UserPreferences({
  initialTheme = 'dark',
  initialEmailNotifications = true,
  initialInAppNotifications = true,
}: UserPreferencesProps) {
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();
  const [emailNotifications, setEmailNotifications] = useState(initialEmailNotifications);
  const [inAppNotifications, setInAppNotifications] = useState(initialInAppNotifications);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    await updatePreference('theme', newTheme);
  };

  const handleEmailNotificationsToggle = async () => {
    const newValue = !emailNotifications;
    setEmailNotifications(newValue);
    await updatePreference('emailNotifications', newValue);
  };

  const handleInAppNotificationsToggle = async () => {
    const newValue = !inAppNotifications;
    setInAppNotifications(newValue);
    await updatePreference('inAppNotifications', newValue);
  };

  const updatePreference = async (key: string, value: any) => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });

      if (!response.ok) {
        throw new Error('Failed to update preference');
      }
    } catch (error) {
      console.error('Failed to update preference:', error);
      // Optionally show an error toast/notification
    } finally {
      setIsUpdating(false);
    }
  };

  const themeOptions = [
    { value: 'light' as const, label: t('preferences.lightMode'), icon: Sun },
    { value: 'dark' as const, label: t('preferences.darkMode'), icon: Moon },
    { value: 'system' as const, label: t('preferences.systemMode'), icon: Monitor },
  ];

  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <div className="bg-white dark:bg-[#111] border border-[#E5E7EB] dark:border-white/10 rounded-2xl p-6 transition-colors hover:border-gray-300 dark:hover:border-white/20 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-[#4A3728] dark:text-white mb-1">{t('preferences.appearance')}</h3>
          <p className="text-sm text-[#8E7F71] dark:text-gray-400">{t('preferences.appearanceDescription')}</p>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = theme === option.value;
            
            return (
              <button
                key={option.value}
                onClick={() => handleThemeChange(option.value)}
                disabled={isUpdating}
                className={`
                  relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all
                  ${isSelected 
                    ? 'border-[#059669] dark:border-green-500 bg-emerald-50/50 dark:bg-green-500/20' 
                    : 'border-[#E5E7EB] dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-100 dark:hover:bg-white/10'
                  }
                  ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <Icon className={`w-6 h-6 ${isSelected ? 'text-[#059669] dark:text-green-400' : 'text-[#8E7F71] dark:text-gray-400'}`} />
                <span className={`text-sm font-medium ${isSelected ? 'text-[#4A3728] dark:text-white' : 'text-[#8E7F71] dark:text-gray-400'}`}>
                  {option.label}
                </span>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-[#059669] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white dark:bg-[#111] border border-[#E5E7EB] dark:border-white/10 rounded-2xl p-6 transition-colors hover:border-gray-300 dark:hover:border-white/20 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-[#4A3728] dark:text-white mb-1">{t('preferences.notifications')}</h3>
          <p className="text-sm text-[#8E7F71] dark:text-gray-400">{t('preferences.notificationsDescription')}</p>
        </div>
        
        <div className="space-y-4">
          {/* Email Notifications */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-[#E5E7EB] dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50/50 rounded-lg border border-[#059669]/30">
                <Mail className="w-5 h-5 text-[#059669]" />
              </div>
              <div>
                <p className="font-medium text-[#4A3728] dark:text-white">{t('preferences.emailNotifications')}</p>
                <p className="text-xs text-[#8E7F71] dark:text-gray-400">{t('preferences.emailNotificationsDesc')}</p>
              </div>
            </div>
            
            <button
              onClick={handleEmailNotificationsToggle}
              disabled={isUpdating}
              className={`
                relative w-14 h-8 rounded-full transition-colors
                ${emailNotifications ? 'bg-[#059669] dark:bg-green-600' : 'bg-gray-200 dark:bg-gray-700'}
                ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
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

          {/* In-App Notifications */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-[#E5E7EB] dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50/50 rounded-lg border border-blue-200">
                {inAppNotifications ? (
                  <Bell className="w-5 h-5 text-blue-600" />
                ) : (
                  <BellOff className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-[#4A3728] dark:text-white">{t('preferences.inAppNotifications')}</p>
                  <span className="text-xs px-2 py-0.5 bg-blue-50/50 text-blue-600 border border-blue-200 rounded-md">
                    {t('preferences.comingSoon')}
                  </span>
                </div>
                <p className="text-xs text-[#8E7F71] dark:text-gray-400">{t('preferences.inAppNotificationsDesc')}</p>
              </div>
            </div>
            
            <button
              onClick={handleInAppNotificationsToggle}
              disabled={isUpdating}
              className={`
                relative w-14 h-8 rounded-full transition-colors
                ${inAppNotifications ? 'bg-[#059669] dark:bg-green-600' : 'bg-gray-200 dark:bg-gray-700'}
                ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div
                className={`
                  absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform
                  ${inAppNotifications ? 'translate-x-7' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

