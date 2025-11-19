'use client';

import React from 'react';
import { useSettings } from '@/context/settings-context';
import { Switch } from '@/components/ui/switch'; // replace with your switch component
import { Label } from '@/components/ui/label';
import type { Theme, ColorScheme, FontSize } from "@/context/settings-context";
import {THEME_OPTIONS, COLOR_SCHEME_OPTIONS, FONT_SIZE_OPTIONS} from '@/constants/options';

const SettingsPanel = () => {
    const { settings, updateSettings } = useSettings();

    return (
        <div className="space-y-6 p-4 max-w-md mx-auto">
            <h2 className="text-xl font-semibold">Appearance Settings</h2>

            {/* Theme */}
            <div>
                <Label>Theme</Label>
                <select
                    className="mt-1 w-full border rounded px-2 py-1"
                    value={settings.theme}
                    onChange={(e) => updateSettings({ theme: e.target.value as Theme })}
                >
                    {THEME_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Color Scheme */}
            <div>
                <Label>Color Scheme</Label>
                <select
                    className="mt-1 w-full border rounded px-2 py-1"
                    value={settings.colorScheme}
                    onChange={(e) => updateSettings({ colorScheme: e.target.value as ColorScheme })}
                >
                    {COLOR_SCHEME_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Font Size */}
            <div>
                <Label>Font Size</Label>
                <select
                    className="mt-1 w-full border rounded px-2 py-1"
                    value={settings.fontSize}
                    onChange={(e) => updateSettings({ fontSize: e.target.value as FontSize })}
                >
                    {FONT_SIZE_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between">
                <Label>Reduced Motion</Label>
                <Switch
                    checked={settings.reducedMotion}
                    onCheckedChange={(val) => updateSettings({ reducedMotion: val })}
                />
            </div>

            {/* High Contrast */}
            <div className="flex items-center justify-between">
                <Label>High Contrast</Label>
                <Switch
                    checked={settings.highContrast}
                    onCheckedChange={(val) => updateSettings({ highContrast: val })}
                />
            </div>
        </div>
    );
};

export default SettingsPanel;