'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    CalendarClock,
    Clock4,
    Repeat,
    History,
    XCircle,
} from 'lucide-react';

// Mock API call — replace with your real fetch function
async function fetchSessionCounts(): Promise<Record<string, number>> {
    // Simulate a fetch delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
        upcoming: 5,
        unconfirmed: 2,
        recurring: 3,
        past: 10,
        canceled: 1,
    };
}

const tabs = [
    { label: 'Upcoming', href: '/sessions/upcoming', icon: CalendarClock, key: 'upcoming', color: 'blue' },
    { label: 'Unconfirmed', href: '/sessions/unconfirmed', icon: Clock4, key: 'unconfirmed', color: 'amber' },
    { label: 'Recurring', href: '/sessions/recurring', icon: Repeat, key: 'recurring', color: 'emerald' },
    { label: 'Past', href: '/sessions/past', icon: History, key: 'past', color: 'slate' },
    { label: 'Canceled', href: '/sessions/canceled', icon: XCircle, key: 'canceled', color: 'rose' },
];

export default function SessionsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [counts, setCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        async function loadCounts() {
            try {
                const data = await fetchSessionCounts();
                setCounts(data);
            } catch (error) {
                console.error('Failed to load session counts', error);
            }
        }
        loadCounts();
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
                <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Sessions</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    See upcoming and past sessions booked through your event type links.
                </p>
                <div className="overflow-x-auto">
                    <nav className="flex space-x-4 mb-6 border-b border-gray-200 dark:border-gray-800" aria-label="Sessions tabs">
                        {tabs.map(({ label, href, icon: Icon, key, color }) => {
                            const isActive = pathname === href;
                            const count = counts[key];
                            return (
                                <Link
                                    key={label}
                                    href={href}
                                    aria-current={isActive ? 'page' : undefined}
                                    className={`flex items-center gap-2 px-4 py-2 -mb-px border-b-2 font-medium text-sm transition-colors duration-150 whitespace-nowrap ${isActive
                                        ? `border-${color}-500 text-${color}-600 dark:text-${color}-400`
                                        : `border-transparent text-gray-500 dark:text-gray-400 hover:text-${color}-600 dark:hover:text-${color}-400`
                                        }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? `text-${color}-500` : ''}`} aria-hidden="true" />
                                    <span>{label}</span>
                                    {count !== undefined && (
                                        <span
                                            className={`ml-1 text-xs rounded-full px-2 py-0.5 ${isActive
                                                ? `bg-${color}-100 text-${color}-700 dark:bg-${color}-900/30 dark:text-${color}-400`
                                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                }`}
                                        >
                                            {count}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="mt-6">{children}</div>
            </div>
        </div>
    );
}
