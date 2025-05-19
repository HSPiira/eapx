'use client';

import React from 'react';
import { adminNavItems } from '@/config';
import MoreNavItem from '@/components/admin/more-nav-item';
import { usePathname } from 'next/navigation';

export default function MorePage() {
    const pathname = usePathname();

    // Re-calculate extra items based on the same logic as ClientNav
    const maxVisible = 4;
    const allNavItems = adminNavItems; // Use the shared config
    const extraNavItems = allNavItems.slice(maxVisible - 1);

    const isItemActive = (itemPath: string) => {
        // Special handling for the root sessions path, which should match /sessions/*
        if (itemPath === '/sessions') {
            return pathname.startsWith('/sessions/');
        }
        // For other items, check for exact match for dashboard, or startsWith for others
        return itemPath === '/dashboard'
            ? pathname === itemPath
            : pathname.startsWith(itemPath);
    };


    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col gap-0 border-t border-gray-200 dark:border-gray-800">
                {extraNavItems.map((item) => (
                    <MoreNavItem
                        key={item.label}
                        icon={item.icon}
                        label={item.label}
                        to={item.to === '/sessions' ? '/sessions/upcoming' : item.to}
                    />
                ))}
            </div>
            <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                We view the mobile application as an extension of the web application. If you are performing any complicated actions, please refer back to the web application.
            </div>
        </div>
    );
}