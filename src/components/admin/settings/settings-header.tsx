'use client';
import React from 'react';
import {ArrowLeft, MenuIcon} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SettingsHeaderProps {
    onMenuClick: () => void;
}

export default function SettingsHeader({ onMenuClick }: SettingsHeaderProps) {
    const router = useRouter();

    return (
        <header
            className="flex items-center gap-3 px-4 h-14 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 shadow-sm fixed top-0 left-0 right-0 z-30 flex lg:hidden"
            role="banner"
        >
            <button
                className="p-2"
                aria-label="Menu"
                aria-haspopup="true"
                aria-expanded={false}
                onClick={onMenuClick}
            >
                <MenuIcon className="w-5 h-5 text-gray-500" />
            </button>
            <button className="p-2" aria-label="Back" onClick={() => router.push('/admin')}>
                <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>
            <span className="font-bold text-lg">Settings</span>
        </header>
    );
}
