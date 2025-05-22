'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/ui';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CalendarSettings {
    workingHours: {
        start: string;
        end: string;
    };
    timeZone: string;
    defaultDuration: number;
    bufferTime: number;
    workingDays: {
        monday: boolean;
        tuesday: boolean;
        wednesday: boolean;
        thursday: boolean;
        friday: boolean;
        saturday: boolean;
        sunday: boolean;
    };
    autoConfirm: boolean;
}

// Mock data
const mockCalendarSettings: CalendarSettings = {
    workingHours: {
        start: '09:00',
        end: '17:00',
    },
    timeZone: 'America/New_York',
    defaultDuration: 30,
    bufferTime: 15,
    workingDays: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
    },
    autoConfirm: false,
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchCalendarSettings = async (): Promise<CalendarSettings> => {
    // Simulate API call
    await delay(1000);
    return mockCalendarSettings;
};

const updateCalendarSettings = async (data: Partial<CalendarSettings>) => {
    // Simulate API call
    await delay(1000);
    console.log('Updating calendar settings:', data);
    return { ...mockCalendarSettings, ...data };
};

const CalendarSettingsPage = () => {
    const queryClient = useQueryClient();
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [settings, setSettings] = useState<CalendarSettings>({
        workingHours: {
            start: '09:00',
            end: '17:00',
        },
        timeZone: 'UTC',
        defaultDuration: 30,
        bufferTime: 15,
        workingDays: {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: false,
            sunday: false,
        },
        autoConfirm: false,
    });

    const queryOptions: UseQueryOptions<CalendarSettings, Error> = {
        queryKey: ['calendarSettings'],
        queryFn: fetchCalendarSettings,
    };

    const { isLoading, error: fetchError, data } = useQuery<CalendarSettings, Error>(queryOptions);

    React.useEffect(() => {
        if (data) {
            setSettings(data);
        }
    }, [data]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            setIsUpdating(true);
            await updateCalendarSettings(settings);
            await queryClient.invalidateQueries({ queryKey: ['calendarSettings'] });
        } catch (err) {
            console.error('Failed to update calendar settings:', err);
            setError('Failed to update calendar settings. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner className="w-8 h-8" />
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <p className="text-red-500 mb-4">Failed to load calendar settings</p>
                <button
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['calendarSettings'] })}
                    className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded hover:bg-gray-800 dark:hover:bg-gray-100"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold mb-1 text-gray-900 dark:text-white">Calendar Settings</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Manage your calendar preferences and availability</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">Working Hours</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="start-time">Start Time</Label>
                            <Input
                                id="start-time"
                                type="time"
                                value={settings.workingHours.start}
                                onChange={(e) =>
                                    setSettings((prev) => ({
                                        ...prev,
                                        workingHours: { ...prev.workingHours, start: e.target.value },
                                    }))
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="end-time">End Time</Label>
                            <Input
                                id="end-time"
                                type="time"
                                value={settings.workingHours.end}
                                onChange={(e) =>
                                    setSettings((prev) => ({
                                        ...prev,
                                        workingHours: { ...prev.workingHours, end: e.target.value },
                                    }))
                                }
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">Working Days</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {Object.entries(settings.workingDays).map(([day, enabled]) => (
                            <div key={day} className="flex items-center space-x-2">
                                <Switch
                                    id={day}
                                    checked={enabled}
                                    onCheckedChange={(checked) =>
                                        setSettings((prev) => ({
                                            ...prev,
                                            workingDays: { ...prev.workingDays, [day]: checked },
                                        }))
                                    }
                                />
                                <Label htmlFor={day} className="capitalize">
                                    {day}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">Preferences</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="timezone">Time Zone</Label>
                            <Select
                                value={settings.timeZone}
                                onValueChange={(value) =>
                                    setSettings((prev) => ({ ...prev, timeZone: value }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="UTC">UTC</SelectItem>
                                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="default-duration">Default Duration (minutes)</Label>
                            <Select
                                value={settings.defaultDuration.toString()}
                                onValueChange={(value) =>
                                    setSettings((prev) => ({ ...prev, defaultDuration: parseInt(value) }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="15">15 minutes</SelectItem>
                                    <SelectItem value="30">30 minutes</SelectItem>
                                    <SelectItem value="45">45 minutes</SelectItem>
                                    <SelectItem value="60">1 hour</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="buffer-time">Buffer Time (minutes)</Label>
                            <Select
                                value={settings.bufferTime.toString()}
                                onValueChange={(value) =>
                                    setSettings((prev) => ({ ...prev, bufferTime: parseInt(value) }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select buffer time" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">No buffer</SelectItem>
                                    <SelectItem value="5">5 minutes</SelectItem>
                                    <SelectItem value="10">10 minutes</SelectItem>
                                    <SelectItem value="15">15 minutes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Switch
                        id="auto-confirm"
                        checked={settings.autoConfirm}
                        onCheckedChange={(checked) =>
                            setSettings((prev) => ({ ...prev, autoConfirm: checked }))
                        }
                    />
                    <Label htmlFor="auto-confirm">Auto-confirm appointments</Label>
                </div>

                {error && <p className="text-red-500">{error}</p>}

                <button
                    type="submit"
                    disabled={isUpdating}
                    className={`mt-4 px-6 py-2 rounded ${isUpdating
                            ? 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100'
                        }`}
                >
                    {isUpdating ? (
                        <div className="flex items-center gap-2">
                            <LoadingSpinner className="w-4 h-4" />
                            <span>Updating...</span>
                        </div>
                    ) : (
                        'Save Changes'
                    )}
                </button>
            </form>
        </div>
    );
};

export default CalendarSettingsPage; 