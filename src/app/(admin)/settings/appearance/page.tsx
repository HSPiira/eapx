'use client';

import React, { useState, useMemo } from 'react';
import isEqual from 'fast-deep-equal';
import { useSettings } from '@/context/settings-context';
import { LoadingSpinner } from '@/components/ui';

type Theme = 'light' | 'dark' | 'system';
type ColorScheme = 'default' | 'blue' | 'green' | 'purple';
type FontSize = 'small' | 'medium' | 'large';

interface Settings {
    theme: Theme;
    colorScheme: ColorScheme;
    fontSize: FontSize;
    reducedMotion: boolean;
    highContrast: boolean;
}

interface ToggleSwitchProps {
    label: string;
    description: string;
    checked: boolean;
    onChange: () => void;
}

interface ToggleGroupProps<T extends string> {
    value: T;
    onValueChange: (value: T) => void;
    options: { value: T; label: string; previewClass?: string }[];
    className?: string;
}

interface RadioGroupProps<T extends string> {
    value: T;
    onValueChange: (value: T) => void;
    options: { value: T; label: string; previewClass?: string }[];
    className?: string;
}

const RadioGroup = <T extends string>({ value, onValueChange, options, className }: RadioGroupProps<T>) => (
    <div className={`flex flex-wrap gap-4 ${className}`}>
        {options.map(({ value: optionValue, label, previewClass }) => (
            <label
                key={optionValue}
                className={`relative flex flex-col items-center cursor-pointer group`}
            >
                <input
                    type="radio"
                    name="color-scheme"
                    value={optionValue}
                    checked={value === optionValue}
                    onChange={() => onValueChange(optionValue)}
                    className="sr-only"
                />
                <div className={`w-12 h-12 rounded-full ${previewClass} border-2 transition-all ${value === optionValue
                    ? 'border-black dark:border-white scale-110'
                    : 'border-transparent group-hover:border-gray-300 dark:group-hover:border-gray-700'
                    }`} />
                <span className="mt-2 text-sm text-gray-600 dark:text-gray-400">{label}</span>
            </label>
        ))}
    </div>
);

const ToggleGroup = <T extends string>({ value, onValueChange, options, className }: ToggleGroupProps<T>) => {
    const gridCols = {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        5: 'grid-cols-5',
    }[options.length] || 'grid-cols-1';

    return (
        <div className={`grid ${gridCols} gap-4 ${className}`}>
            {options.map(({ value: optionValue, label, previewClass }) => (
                <button
                    key={optionValue}
                    onClick={() => onValueChange(optionValue)}
                    className={`p-2 border rounded-lg text-center ${value === optionValue
                        ? 'border-black dark:border-white bg-gray-100 dark:bg-gray-900'
                        : 'border-gray-200 dark:border-gray-800'
                        }`}
                >
                    {previewClass && <div className={`w-full h-16 rounded mb-1 ${previewClass}`}></div>}
                    <span className="text-sm">{label}</span>
                </button>
            ))}
        </div>
    );
};

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between">
        <div>
            <div className="font-medium text-gray-900 dark:text-gray-200">{label}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{description}</div>
        </div>
        <button
            role="switch"
            aria-checked={checked}
            onClick={onChange}
            className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white ${checked ? 'bg-black dark:bg-white' : 'bg-gray-200 dark:bg-gray-800'
                }`}
            aria-label={label}
        >
            <span
                className={`inline-block w-4 h-4 transform bg-white dark:bg-black rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
                    }`}
            />
        </button>
    </div>
);

const AppearanceSettingsPage = () => {
    const { settings, updateSettings } = useSettings();
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [localSettings, setLocalSettings] = useState<Settings>({
        theme: settings.theme ?? 'system',
        colorScheme: settings.colorScheme ?? 'default',
        fontSize: settings.fontSize ?? 'medium',
        reducedMotion: settings.reducedMotion ?? false,
        highContrast: settings.highContrast ?? false,
    });

    const hasChanges = useMemo(() => !isEqual(localSettings, settings), [localSettings, settings]);

    const handleUpdate = async () => {
        setError(null);
        try {
            setIsUpdating(true);
            await updateSettings(localSettings);
        } catch (err) {
            console.error('Failed to update settings:', err);
            setError('Failed to update settings. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    const themeOptions = [
        {
            value: 'light' as Theme,
            label: 'Light',
            previewClass: 'bg-white dark:bg-black border border-gray-200 dark:border-gray-800',
        },
        {
            value: 'dark' as Theme,
            label: 'Dark',
            previewClass: 'bg-gray-900 border border-gray-800',
        },
        {
            value: 'system' as Theme,
            label: 'System',
            previewClass: 'bg-gradient-to-r from-white to-gray-900 border border-gray-200 dark:border-gray-800',
        },
    ];

    const colorSchemeOptions = [
        {
            value: 'default' as ColorScheme,
            label: 'Default',
            previewClass: 'bg-gray-100 dark:bg-gray-800',
        },
        {
            value: 'blue' as ColorScheme,
            label: 'Blue',
            previewClass: 'bg-blue-100 dark:bg-blue-900',
        },
        {
            value: 'green' as ColorScheme,
            label: 'Green',
            previewClass: 'bg-green-100 dark:bg-green-900',
        },
        {
            value: 'purple' as ColorScheme,
            label: 'Purple',
            previewClass: 'bg-purple-100 dark:bg-purple-900',
        },
    ];

    const fontSizeOptions = [
        { value: 'small' as FontSize, label: 'Small' },
        { value: 'medium' as FontSize, label: 'Medium' },
        { value: 'large' as FontSize, label: 'Large' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold mb-1 text-gray-900 dark:text-white">Appearance</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Customize how careAxis looks and feels</p>

            <div className="mb-6">
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-200">Theme</label>
                <div className="grid grid-cols-3 gap-4">
                    {themeOptions.map(({ value: optionValue, label, previewClass }) => (
                        <button
                            key={optionValue}
                            onClick={() => setLocalSettings(prev => ({ ...prev, theme: optionValue }))}
                            className={`p-4 border rounded-lg text-center ${localSettings.theme === optionValue
                                ? 'border-black dark:border-white bg-gray-100 dark:bg-gray-900'
                                : 'border-gray-200 dark:border-gray-800'
                                }`}
                        >
                            {previewClass && <div className={`w-full h-24 rounded mb-2 ${previewClass}`}></div>}
                            <span className="text-sm">{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-200">Color Scheme</label>
                <RadioGroup
                    value={localSettings.colorScheme}
                    onValueChange={(colorScheme) => setLocalSettings(prev => ({ ...prev, colorScheme }))}
                    options={colorSchemeOptions}
                />
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-200">Font Size</label>
                <ToggleGroup
                    value={localSettings.fontSize}
                    onValueChange={(fontSize) => setLocalSettings(prev => ({ ...prev, fontSize }))}
                    options={fontSizeOptions}
                />
            </div>

            <div className="space-y-4">
                <ToggleSwitch
                    label="Reduced motion"
                    description="Minimize animations and transitions"
                    checked={localSettings.reducedMotion}
                    onChange={() => setLocalSettings(prev => ({ ...prev, reducedMotion: !prev.reducedMotion }))}
                />
                <ToggleSwitch
                    label="High contrast"
                    description="Increase contrast for better readability"
                    checked={localSettings.highContrast}
                    onChange={() => setLocalSettings(prev => ({ ...prev, highContrast: !prev.highContrast }))}
                />
            </div>

            {error && <p className="text-red-500 mt-4">{error}</p>}

            <button
                onClick={handleUpdate}
                disabled={!hasChanges || isUpdating}
                className={`mt-6 px-6 py-2 rounded ${hasChanges
                    ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    }`}
            >
                {isUpdating ? (
                    <div className="flex items-center gap-2">
                        <LoadingSpinner className="w-4 h-4" />
                        <span>Updating...</span>
                    </div>
                ) : (
                    'Update'
                )}
            </button>
        </div>
    );
};

export default AppearanceSettingsPage;
