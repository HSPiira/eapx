import { CalendarClock, Clock4, Repeat, History, XCircle } from 'lucide-react';
import Link from 'next/link';

const tabs = [
    { label: 'Upcoming', href: '/sessions/upcoming', icon: CalendarClock, key: 'upcoming', color: 'blue' },
    { label: 'Unconfirmed', href: '/sessions/unconfirmed', icon: Clock4, key: 'unconfirmed', color: 'amber' },
    { label: 'Recurring', href: '/sessions/recurring', icon: Repeat, key: 'recurring', color: 'emerald' },
    { label: 'Past', href: '/sessions/past', icon: History, key: 'past', color: 'slate' },
    { label: 'Canceled', href: '/sessions/canceled', icon: XCircle, key: 'canceled', color: 'rose' },
];

const tabColorClasses = {
    blue: {
        active: 'border-blue-500 text-blue-600 dark:text-blue-400',
        hover: 'hover:text-blue-600 dark:hover:text-blue-400'
    },
    amber: {
        active: 'border-amber-500 text-amber-600 dark:text-amber-400',
        hover: 'hover:text-amber-600 dark:hover:text-amber-400'
    },
    emerald: {
        active: 'border-emerald-500 text-emerald-600 dark:text-emerald-400',
        hover: 'hover:text-emerald-600 dark:hover:text-emerald-400'
    },
    slate: {
        active: 'border-slate-500 text-slate-600 dark:text-slate-400',
        hover: 'hover:text-slate-600 dark:hover:text-slate-400'
    },
    rose: {
        active: 'border-rose-500 text-rose-600 dark:text-rose-400',
        hover: 'hover:text-rose-600 dark:hover:text-rose-400'
    },
    gray: {
        active: 'border-gray-500 text-gray-600 dark:text-gray-400',
        hover: 'hover:text-gray-600 dark:hover:text-gray-400'
    }
};

interface SessionsTabsProps {
    pathname: string;
    counts: Record<string, number>;
}

export function SessionsTabs({ pathname, counts }: SessionsTabsProps) {
    return (
        <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    const colorClasses = tabColorClasses[tab.color as keyof typeof tabColorClasses];
                    return (
                        <Link
                            key={tab.key}
                            href={tab.href}
                            className={`
                                whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
                                ${isActive ? colorClasses.active : `border-transparent text-gray-500 ${colorClasses.hover}`}
                            `}
                        >
                            <div className="flex items-center gap-2">
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                                {counts[tab.key] > 0 && (
                                    <span className="ml-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                                        {counts[tab.key]}
                                    </span>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
} 