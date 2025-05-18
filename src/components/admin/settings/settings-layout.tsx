'use client';
import React, { useState, useRef } from 'react';
import { useDrawerFocusTrap } from '@/hooks';
import { settingsSections } from '@/config';
import { UserIcon, LucideIcon } from "lucide-react";
import Drawer from './settings-drawer';
import SettingsHeader from './settings-header';
import SettingsOverlay from './settings-overlay';
// import { FloatingActionButton } from '@/components/sidebar';

interface SettingsLayoutProps {
    children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const drawerRef = useRef<HTMLElement>(null!);
    useDrawerFocusTrap(isDrawerOpen, () => setIsDrawerOpen(false), drawerRef);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <SettingsHeader onMenuClick={() => setIsDrawerOpen(true)} />
            <div className="container mx-auto px-4 py-8">
                <div className="flex gap-8">
                    <aside className="hidden lg:block w-64">
                        <nav className="space-y-1">
                            {settingsSections.map((section, idx) => (
                                <div key={idx} className="mb-4">
                                    {section.title && (
                                        <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-1 mt-2">
                                            {section.title}
                                        </div>
                                    )}
                                    {section.items.map((item) => {
                                        const Icon = (item.icon as unknown as LucideIcon) || UserIcon;
                                        return (
                                            <a
                                                key={item.label}
                                                href={item.href}
                                                className="flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
                                            >
                                                <Icon className="w-4 h-4" />
                                                <span>{item.label}</span>
                                            </a>
                                        );
                                    })}
                                </div>
                            ))}
                        </nav>
                    </aside>
                    <main className="flex-1">
                        {children}
                    </main>
                </div>
            </div>
            <Drawer
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
            />
            <SettingsOverlay open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
        </div>
    );
}
