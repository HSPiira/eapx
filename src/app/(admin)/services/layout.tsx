'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { InterventionHeader } from '@/components/admin/services';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IconKey, resolveIcon } from '@/config/icon-map';
import Link from 'next/link';

const tabs: { value: string; label: string; icon: IconKey; href: string; }[] = [
    { value: 'services', label: 'Services', icon: 'List', href: '/services' },
    { value: 'interventions', label: 'Interventions', icon: 'Briefcase', href: '/services/interventions' },
    { value: 'providers', label: 'Providers', icon: 'Users', href: '/services/providers' },
    { value: 'sessions', label: 'Sessions', icon: 'Calendar', href: '/services/sessions' },
    { value: 'feedback', label: 'Feedback', icon: 'MessageSquare', href: '/services/feedback' },
    { value: 'reports', label: 'Reports', icon: 'BarChart', href: '/services/reports' },
];

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const currentTab = tabs.find(tab => {
        if (pathname === tab.href) return true;

        if (tab.href === '/services') {
            return pathname.startsWith('/services/') &&
                !tabs.some(t => t.href !== '/services' && pathname.startsWith(t.href));
        }

        return pathname.startsWith(tab.href + '/');
    })?.value || 'services';

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <InterventionHeader />
            </div>
            <Tabs value={currentTab} className="w-full mb-4">
                <TabsList className="justify-start overflow-x-auto flex-nowrap w-full -mx-2 px-2 scrollbar-hide">
                    {tabs.map((tab) => {
                        const Icon = resolveIcon(tab.icon);
                        return (
                            <Link key={tab.value} href={tab.href}>
                                <TabsTrigger value={tab.value} className="flex items-center gap-2 whitespace-nowrap px-3 py-1.5">
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </TabsTrigger>
                            </Link>
                        );
                    })}
                </TabsList>
            </Tabs>
            {children}
        </div>
    );
} 