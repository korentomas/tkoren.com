import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Theme, ThemeContextType, ThemeProviderProps } from '~/types/theme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Initialize with the server-rendered theme
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.getAttribute('data-theme') as Theme || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    // Only run on client-side after hydration
    const stored = localStorage.getItem('theme');
    if (stored && stored !== theme) {
      setTheme(stored as Theme);
    }
  }, []);

  useEffect(() => {
    // Only update DOM after initial hydration
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

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