'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/ui';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NotificationSettings {
    emailNotifications: {
        newAppointments: boolean;
        appointmentReminders: boolean;
        appointmentChanges: boolean;
        appointmentCancellations: boolean;
    };
    pushNotifications: {
        newAppointments: boolean;
        appointmentReminders: boolean;
        appointmentChanges: boolean;
        appointmentCancellations: boolean;
    };
    reminderTiming: {
        email: number; // hours before appointment
        push: number; // hours before appointment
    };
    quietHours: {
        enabled: boolean;
        start: string;
        end: string;
    };
}

// Mock data
const mockNotificationSettings: NotificationSettings = {
    emailNotifications: {
        newAppointments: true,
        appointmentReminders: true,
        appointmentChanges: true,
        appointmentCancellations: true,
    },
    pushNotifications: {
        newAppointments: true,
        appointmentReminders: true,
        appointmentChanges: true,
        appointmentCancellations: true,
    },
    reminderTiming: {
        email: 24,
        push: 2,
    },
    quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
    },
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchNotificationSettings = async (): Promise<NotificationSettings> => {
    // Simulate API call
    await delay(1000);
    return mockNotificationSettings;
};

const updateNotificationSettings = async (data: Partial<NotificationSettings>) => {
    // Simulate API call
    await delay(1000);
    console.log('Updating notification settings:', data);
    return { ...mockNotificationSettings, ...data };
};

const NotificationSettingsPage = () => {
    const queryClient = useQueryClient();
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [settings, setSettings] = useState<NotificationSettings>(mockNotificationSettings);

    const queryOptions: UseQueryOptions<NotificationSettings, Error> = {
        queryKey: ['notificationSettings'],
        queryFn: fetchNotificationSettings,
    };

    const { isLoading, error: fetchError, data } = useQuery<NotificationSettings, Error>(queryOptions);

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
            await updateNotificationSettings(settings);
            await queryClient.invalidateQueries({ queryKey: ['notificationSettings'] });
        } catch (err) {
            console.error('Failed to update notification settings:', err);
            setError('Failed to update notification settings. Please try again.');
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
                <p className="text-red-500 mb-4">Failed to load notification settings</p>
                <button
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['notificationSettings'] })}
                    className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded hover:bg-gray-800 dark:hover:bg-gray-100"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold mb-1 text-gray-900 dark:text-white">Notification Settings</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Manage your notification preferences</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">Email Notifications</h2>
                    <div className="space-y-4">
                        {Object.entries(settings.emailNotifications).map(([type, enabled]) => (
                            <div key={type} className="flex items-center space-x-2">
                                <Switch
                                    id={`email-${type}`}
                                    checked={enabled}
                                    onCheckedChange={(checked) =>
                                        setSettings((prev) => ({
                                            ...prev,
                                            emailNotifications: { ...prev.emailNotifications, [type]: checked },
                                        }))
                                    }
                                />
                                <Label htmlFor={`email-${type}`} className="capitalize">
                                    {type.replace(/([A-Z])/g, ' $1').trim()}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">Push Notifications</h2>
                    <div className="space-y-4">
                        {Object.entries(settings.pushNotifications).map(([type, enabled]) => (
                            <div key={type} className="flex items-center space-x-2">
                                <Switch
                                    id={`push-${type}`}
                                    checked={enabled}
                                    onCheckedChange={(checked) =>
                                        setSettings((prev) => ({
                                            ...prev,
                                            pushNotifications: { ...prev.pushNotifications, [type]: checked },
                                        }))
                                    }
                                />
                                <Label htmlFor={`push-${type}`} className="capitalize">
                                    {type.replace(/([A-Z])/g, ' $1').trim()}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">Reminder Timing</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="email-timing">Email Reminder Timing</Label>
                            <Select
                                value={settings.reminderTiming.email.toString()}
                                onValueChange={(value) =>
                                    setSettings((prev) => ({
                                        ...prev,
                                        reminderTiming: { ...prev.reminderTiming, email: parseInt(value) },
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select timing" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1 hour before</SelectItem>
                                    <SelectItem value="2">2 hours before</SelectItem>
                                    <SelectItem value="12">12 hours before</SelectItem>
                                    <SelectItem value="24">24 hours before</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="push-timing">Push Notification Timing</Label>
                            <Select
                                value={settings.reminderTiming.push.toString()}
                                onValueChange={(value) =>
                                    setSettings((prev) => ({
                                        ...prev,
                                        reminderTiming: { ...prev.reminderTiming, push: parseInt(value) },
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select timing" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1 hour before</SelectItem>
                                    <SelectItem value="2">2 hours before</SelectItem>
                                    <SelectItem value="12">12 hours before</SelectItem>
                                    <SelectItem value="24">24 hours before</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">Quiet Hours</h2>
                    <div className="flex items-center space-x-2 mb-4">
                        <Switch
                            id="quiet-hours"
                            checked={settings.quietHours.enabled}
                            onCheckedChange={(checked) =>
                                setSettings((prev) => ({
                                    ...prev,
                                    quietHours: { ...prev.quietHours, enabled: checked },
                                }))
                            }
                        />
                        <Label htmlFor="quiet-hours">Enable Quiet Hours</Label>
                    </div>
                    {settings.quietHours.enabled && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="quiet-start">Start Time</Label>
                                <input
                                    type="time"
                                    id="quiet-start"
                                    value={settings.quietHours.start}
                                    onChange={(e) =>
                                        setSettings((prev) => ({
                                            ...prev,
                                            quietHours: { ...prev.quietHours, start: e.target.value },
                                        }))
                                    }
                                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                                />
                            </div>
                            <div>
                                <Label htmlFor="quiet-end">End Time</Label>
                                <input
                                    type="time"
                                    id="quiet-end"
                                    value={settings.quietHours.end}
                                    onChange={(e) =>
                                        setSettings((prev) => ({
                                            ...prev,
                                            quietHours: { ...prev.quietHours, end: e.target.value },
                                        }))
                                    }
                                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                                />
                            </div>
                        </div>
                    )}
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

export default NotificationSettingsPage; 