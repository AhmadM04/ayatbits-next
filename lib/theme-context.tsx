'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'dark'; // Only dark theme for this app

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Always ensure dark mode is set
    const root = document.documentElement;
    root.classList.remove('light');
    root.classList.add('dark');
    
    // Set dark theme in localStorage to prevent any flash
    localStorage.setItem('theme', 'dark');
  }, []);

  // Always dark theme
  const value: ThemeContextType = {
    theme: 'dark',
    resolvedTheme: 'dark',
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
    };
  }
  return context;
}
