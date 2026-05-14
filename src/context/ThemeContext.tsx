import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

// Design tokens
export interface ThemeColors {
  // Base
  background: string;
  foreground: string;

  // Card
  card: string;
  cardForeground: string;

  // Popover/Modal
  popover: string;
  popoverForeground: string;

  // Primary
  primary: string;
  primaryForeground: string;

  // Secondary
  secondary: string;
  secondaryForeground: string;

  // Muted
  muted: string;
  mutedForeground: string;

  // Accent
  accent: string;
  accentForeground: string;

  // Destructive
  destructive: string;
  destructiveForeground: string;

  // Border & Input
  border: string;
  input: string;
  ring: string;

  // Additional
  overlay: string;
  surface: string;
  surfaceElevated: string;
  success: string;
  warning: string;
  shadow: string;
}

// Light theme
export const lightColors: ThemeColors = {
  background: '#f6f8fb',
  foreground: '#101828',

  card: '#ffffff',
  cardForeground: '#101828',

  popover: '#ffffff',
  popoverForeground: '#101828',

  primary: '#2563eb',
  primaryForeground: '#ffffff',

  secondary: '#eef4ff',
  secondaryForeground: '#1d4ed8',

  muted: '#eef2f7',
  mutedForeground: '#667085',

  accent: '#ecfdf3',
  accentForeground: '#027a48',

  destructive: '#dc2626',
  destructiveForeground: '#ffffff',

  border: '#e4e7ec',
  input: '#d0d5dd',
  ring: '#2563eb',

  overlay: 'rgba(0, 0, 0, 0.5)',
  surface: '#f9fafb',
  surfaceElevated: '#ffffff',
  success: '#12b76a',
  warning: '#f59e0b',
  shadow: 'rgba(16, 24, 40, 0.12)',
};

// Dark theme
export const darkColors: ThemeColors = {
  background: '#0b1220',
  foreground: '#f8fafc',

  card: '#111827',
  cardForeground: '#f8fafc',

  popover: '#111827',
  popoverForeground: '#f8fafc',

  primary: '#60a5fa',
  primaryForeground: '#0b1220',

  secondary: '#1e293b',
  secondaryForeground: '#dbeafe',

  muted: '#1e293b',
  mutedForeground: '#94a3b8',

  accent: '#063f2c',
  accentForeground: '#bbf7d0',

  destructive: '#f87171',
  destructiveForeground: '#0b1220',

  border: '#233044',
  input: '#334155',
  ring: '#93c5fd',

  overlay: 'rgba(0, 0, 0, 0.8)',
  surface: '#0f172a',
  surfaceElevated: '#172033',
  success: '#34d399',
  warning: '#fbbf24',
  shadow: 'rgba(0, 0, 0, 0.35)',
};

// Design tokens
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
};

export const radius = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 18,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
};

interface ThemeContextType {
  colors: ThemeColors;
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@loan_calculator_theme';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  const loadTheme = useCallback(async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeModeState(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');
  const colors = isDark ? darkColors : lightColors;

  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ colors, themeMode, isDark, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
