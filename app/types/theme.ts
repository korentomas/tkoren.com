export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
}

export interface ThemeStyles {
  bgPrimary: string;
  bgSecondary: string;
  bgElement: string;
  bgHero: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  accentPrimary: string;
  accentSecondary: string;
  borderColor: string;
  shadowColor: string;
  dotColor: string;
} 