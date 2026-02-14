'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'dark' | 'light';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children, initialTheme }: { children: ReactNode; initialTheme?: Theme }) {
  const [mounted, setMounted] = useState(false);
  const [theme, setThemeState] = useState<Theme>(initialTheme || 'dark');
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');

  // Apply theme to DOM
  const applyTheme = (themeToApply: Theme) => {
    if (typeof window === 'undefined') return;
    
    const root = document.documentElement;
    let effectiveTheme: 'dark' | 'light' = 'dark';

    if (themeToApply === 'system') {
      // Check system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveTheme = systemPrefersDark ? 'dark' : 'light';
    } else {
      effectiveTheme = themeToApply;
    }

    // Remove both classes first, then add the correct one
    root.classList.remove('light', 'dark');
    root.classList.add(effectiveTheme);
    setResolvedTheme(effectiveTheme);
    
    // Also update viewport theme-color meta tag
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', effectiveTheme === 'dark' ? '#0a0a0a' : '#F8F9FA');
    }
  };

  // Initialize theme
  useEffect(() => {
    setMounted(true);
    
    // Get theme from localStorage or use initialTheme
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    const themeToUse = storedTheme || initialTheme || 'dark';
    setThemeState(themeToUse);
    applyTheme(themeToUse);

    // Listen for system theme changes when in system mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const currentTheme = localStorage.getItem('theme') as Theme | null;
      if (currentTheme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [initialTheme]);

  // Update theme when it changes
  useEffect(() => {
    if (mounted) {
      applyTheme(theme);
    }
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return default dark theme if not in provider
    return {
      theme: 'dark' as const,
      resolvedTheme: 'dark' as const,
      setTheme: () => {},
    };
  }
  return context;
}
