import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

// Design tokens
interface ThemeColors {
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
}

// Light theme
export const lightColors: ThemeColors = {
    background: '#ffffff',
    foreground: '#09090b',

    card: '#ffffff',
    cardForeground: '#09090b',

    popover: '#ffffff',
    popoverForeground: '#09090b',

    primary: '#18181b',
    primaryForeground: '#fafafa',

    secondary: '#f4f4f5',
    secondaryForeground: '#18181b',

    muted: '#f4f4f5',
    mutedForeground: '#71717a',

    accent: '#f4f4f5',
    accentForeground: '#18181b',

    destructive: '#ef4444',
    destructiveForeground: '#fafafa',

    border: '#e4e4e7',
    input: '#e4e4e7',
    ring: '#18181b',

    overlay: 'rgba(0, 0, 0, 0.5)',
};

// Dark theme
export const darkColors: ThemeColors = {
    background: '#09090b',
    foreground: '#fafafa',

    card: '#09090b',
    cardForeground: '#fafafa',

    popover: '#09090b',
    popoverForeground: '#fafafa',

    primary: '#fafafa',
    primaryForeground: '#18181b',

    secondary: '#27272a',
    secondaryForeground: '#fafafa',

    muted: '#27272a',
    mutedForeground: '#a1a1aa',

    accent: '#27272a',
    accentForeground: '#fafafa',

    destructive: '#7f1d1d',
    destructiveForeground: '#fafafa',

    border: '#27272a',
    input: '#27272a',
    ring: '#d4d4d8',

    overlay: 'rgba(0, 0, 0, 0.8)',
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

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
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
    };

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
