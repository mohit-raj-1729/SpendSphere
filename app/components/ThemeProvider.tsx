'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check localStorage or system preference
    const savedTheme = localStorage.getItem('theme') as Theme;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    // Ensure DOM is in sync (script should have set it, but double-check)
    const root = document.documentElement;
    const hasDarkClass = root.classList.contains('dark');
    
    if (initialTheme === 'dark' && !hasDarkClass) {
      root.classList.add('dark');
    } else if (initialTheme === 'light' && hasDarkClass) {
      root.classList.remove('dark');
    }
    
    setTheme(initialTheme);
    setMounted(true);
  }, []);

  // Sync theme with DOM whenever theme changes (backup sync)
  useEffect(() => {
    if (mounted) {
      const root = document.documentElement;
      // Remove all theme classes first to ensure clean state
      root.classList.remove('dark');
      
      // Then add if needed
      if (theme === 'dark') {
        root.classList.add('dark');
      }
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      
      // Immediately update DOM to prevent delay
      const root = document.documentElement;
      if (newTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      
      return newTheme;
    });
  };

  // Always provide the context, even before mounting
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

