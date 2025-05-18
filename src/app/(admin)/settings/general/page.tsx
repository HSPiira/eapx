'use client';

import React, { useState, useMemo } from 'react';
import isEqual from 'fast-deep-equal';
import { useSettings } from '@/context/settings-context';
import { LoadingSpinner } from '@/components/ui';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Settings {
    language: string;
    timezone: string;
    timeFormat: '12 hour' | '24 hour';
    startOfWeek: 'Sunday' | 'Monday';
    dynamicGroupLinks: boolean;
    searchEngineIndexing: boolean;
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
    options: { value: T; label: string }[];
    className?: string;
}

const ToggleGroup = <T extends string>({ value, onValueChange, options, className }: ToggleGroupProps<T>) => (
    <div className={`grid grid-cols-${options.length} gap-4 ${className}`}>
        {options.map(({ value: optionValue, label }) => (
            <button
                key={optionValue}
                onClick={() => onValueChange(optionValue)}
                className={`p-4 border rounded-lg text-center ${value === optionValue
                    ? 'border-black dark:border-white bg-gray-100 dark:bg-gray-900'
                    : 'border-gray-200 dark:border-gray-800'
                    }`}
            >
                <span className="text-sm">{label}</span>
            </button>
        ))}
    </div>
);

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

const GeneralSettingsPage = () => {
    const { settings, updateSettings } = useSettings();
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [localSettings, setLocalSettings] = useState<Settings>({
        language: settings.language || 'English',
        timezone: settings.timezone || 'Africa/Kampala',
        timeFormat: settings.timeFormat || '12 hour',
        startOfWeek: settings.startOfWeek || 'Sunday',
        dynamicGroupLinks: settings.dynamicGroupLinks || false,
        searchEngineIndexing: settings.searchEngineIndexing || false,
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

    const timeFormatOptions = [
        { value: '12 hour' as const, label: '12 hour' },
        { value: '24 hour' as const, label: '24 hour' },
    ];

    const startOfWeekOptions = [
        { value: 'Sunday' as const, label: 'Sunday' },
        { value: 'Monday' as const, label: 'Monday' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold mb-1 text-gray-900 dark:text-white">General</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Manage settings for your language and timezone</p>

            <div className="mb-6">
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-200">Language</label>
                <Select
                    value={localSettings.language}
                    onValueChange={(value) => setLocalSettings(prev => ({ ...prev, language: value }))}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                        <SelectItem value="Spanish">Spanish</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-200">Timezone</label>
                <div className="flex gap-2">
                    <Select
                        value={localSettings.timezone}
                        onValueChange={(value) => setLocalSettings(prev => ({ ...prev, timezone: value }))}
                    >
                        <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Africa/Kampala">Africa/Kampala</SelectItem>
                            <SelectItem value="America/New_York">America/New_York</SelectItem>
                            <SelectItem value="Europe/London">Europe/London</SelectItem>
                        </SelectContent>
                    </Select>
                    <button className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded flex items-center gap-1 text-sm bg-white dark:bg-black text-gray-700 dark:text-gray-200">
                        <span role="img" aria-label="calendar">📅</span>
                        Schedule timezone change
                    </button>
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-200">Time format</label>
                <ToggleGroup
                    value={localSettings.timeFormat}
                    onValueChange={(timeFormat) => setLocalSettings(prev => ({ ...prev, timeFormat }))}
                    options={timeFormatOptions}
                    className="grid-cols-2"
                />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    This is an internal setting and will not affect how times are displayed on public booking pages for you or anyone
                    booking you.
                </p>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-200">Start of week</label>
                <ToggleGroup
                    value={localSettings.startOfWeek}
                    onValueChange={(startOfWeek) => setLocalSettings(prev => ({ ...prev, startOfWeek }))}
                    options={startOfWeekOptions}
                    className="grid-cols-2"
                />
            </div>

            <div className="space-y-4">
                <ToggleSwitch
                    label="Dynamic group links"
                    description="Allow attendees to book you through dynamic group bookings"
                    checked={localSettings.dynamicGroupLinks}
                    onChange={() => setLocalSettings(prev => ({ ...prev, dynamicGroupLinks: !prev.dynamicGroupLinks }))}
                />

                <ToggleSwitch
                    label="Allow search engine indexing"
                    description="Allow search engines to access your public content"
                    checked={localSettings.searchEngineIndexing}
                    onChange={() => setLocalSettings(prev => ({ ...prev, searchEngineIndexing: !prev.searchEngineIndexing }))}
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

export default GeneralSettingsPage;
