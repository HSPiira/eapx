'use client';

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type ColorScheme = 'default' | 'blue' | 'green' | 'purple';
export type FontSize = 'small' | 'medium' | 'large';

interface Settings {
    theme: Theme;
    colorScheme: ColorScheme;
    fontSize: FontSize;
    reducedMotion: boolean;
    highContrast: boolean;
    // General settings
    language: string;
    timezone: string;
    timeFormat: '12 hour' | '24 hour';
    startOfWeek: 'Sunday' | 'Monday';
    dynamicGroupLinks: boolean;
    searchEngineIndexing: boolean;
}

interface SettingsContextType {
    settings: Settings;
    updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
}

const defaultSettings: Settings = {
    theme: 'system',
    colorScheme: 'default',
    fontSize: 'medium',
    reducedMotion: false,
    highContrast: false,
    // General settings defaults
    language: 'English',
    timezone: 'Africa/Kampala',
    timeFormat: '12 hour',
    startOfWeek: 'Sunday',
    dynamicGroupLinks: false,
    searchEngineIndexing: false,
};

const STORAGE_KEY = 'appSettings';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [isLoading, setIsLoading] = useState(true);

    // Load settings on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                setSettings(JSON.parse(saved));
            }
        } catch (e) {
            console.error('Failed to load settings:', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Apply settings to document root
    useEffect(() => {
        if (isLoading) return;

        const root = document.documentElement;

        // Theme
        root.classList.remove('light', 'dark');
        const appliedTheme = settings.theme === 'system'
            ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            : settings.theme;
        root.classList.add(appliedTheme);

        // Color Scheme
        root.classList.remove(
            'color-scheme-default',
            'color-scheme-blue',
            'color-scheme-green',
            'color-scheme-purple'
        );
        root.classList.add(`color-scheme-${settings.colorScheme}`);

        // Font size
        root.classList.remove('text-sm', 'text-base', 'text-lg');
        root.classList.add({
            small: 'text-sm',
            medium: 'text-base',
            large: 'text-lg',
        }[settings.fontSize]);

        // Reduced Motion
        root.classList.toggle('reduced-motion', settings.reducedMotion);

        // High Contrast
        root.classList.toggle('high-contrast', settings.highContrast);
    }, [settings, isLoading]);

    const updateSettings = useCallback(async (newSettings: Partial<Settings>) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            // Optional: notify other tabs
            window.dispatchEvent(new Event('storage'));
        } catch (e) {
            console.error('Error saving settings:', e);
        }
    }, [settings]);

    if (isLoading) return null;

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) throw new Error('useSettings must be used within SettingsProvider');
    return context;
}