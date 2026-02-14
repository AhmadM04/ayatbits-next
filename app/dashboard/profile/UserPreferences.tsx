'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
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
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'system'>(initialTheme);
  const [emailNotifications, setEmailNotifications] = useState(initialEmailNotifications);
  const [inAppNotifications, setInAppNotifications] = useState(initialInAppNotifications);

  // Sync database preference with localStorage and apply theme on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    const themeToApply = storedTheme || initialTheme;
    
    setCurrentTheme(themeToApply);
    applyThemeToDom(themeToApply);
  }, [initialTheme]);

  // Apply theme to DOM immediately
  const applyThemeToDom = (theme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    
    console.log('🎨 Applying theme to DOM:', theme);
    console.log('📋 Current classes BEFORE:', root.className);
    
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      // System preference
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', isDark);
      root.classList.toggle('light', !isDark);
      console.log('💻 System preference detected:', isDark ? 'dark' : 'light');
    }
    
    console.log('✅ Current classes AFTER:', root.className);
  };

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    // 1. Instant State Update (Moves the button highlight)
    setCurrentTheme(newTheme);
    
    // 2. Instant DOM Update (Changes colors immediately)
    applyThemeToDom(newTheme);
    
    // 3. Update localStorage
    localStorage.setItem('theme', newTheme);
    
    // 4. Background Database Save
    try {
      await updatePreference('theme', newTheme);
      console.log(`✅ Preference 'theme' saved: ${newTheme}`);
    } catch (error) {
      console.error("Failed to save theme:", error);
      // Don't revert UI since we want optimistic updates
    }
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
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });

      if (!response.ok) {
        throw new Error('Failed to update preference');
      }
      
      // Successfully saved to database
      return response.json();
    } catch (error) {
      console.error('Failed to update preference:', error);
      throw error;
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

      {/* Notification Settings */}
      <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-6 transition-colors hover:border-gray-300 dark:hover:border-white/20 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-[#4A3728] dark:text-white mb-1">{t('preferences.notifications')}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('preferences.notificationsDescription')}</p>
        </div>
        
        <div className="space-y-4">
          {/* Email Notifications */}
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

          {/* In-App Notifications */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-500/30">
                {inAppNotifications ? (
                  <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <BellOff className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-[#4A3728] dark:text-white">{t('preferences.inAppNotifications')}</p>
                  <span className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 rounded-md">
                    {t('preferences.comingSoon')}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{t('preferences.inAppNotificationsDesc')}</p>
              </div>
            </div>
            
            <button
              onClick={handleInAppNotificationsToggle}
              className={`
                relative w-14 h-8 rounded-full transition-colors cursor-pointer
                ${inAppNotifications ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-gray-700'}
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

