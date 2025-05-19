'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ServiceHeader } from '@/components/admin/services';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IconKey, resolveIcon } from '@/config/icon-map';
import Link from 'next/link';

const tabs: { value: string; label: string; icon: IconKey; href: string; }[] = [
    { value: 'services', label: 'Services', icon: 'Briefcase', href: '/services' },
    { value: 'categories', label: 'Categories', icon: 'List', href: '/services/categories' },
    { value: 'providers', label: 'Providers', icon: 'Users', href: '/services/providers' },
    { value: 'sessions', label: 'Sessions', icon: 'Calendar', href: '/services/sessions' },
    { value: 'feedback', label: 'Feedback', icon: 'MessageSquare', href: '/services/feedback' },
    { value: 'reports', label: 'Reports', icon: 'BarChart', href: '/services/reports' },
];

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const currentTab = tabs.find(
        tab => pathname === tab.href || pathname.startsWith(tab.href + '/')
    )?.value || 'services';


    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <ServiceHeader />
            </div>
            <Tabs value={currentTab} className="w-full mb-4">
                <TabsList className="justify-start">
                    {tabs.map((tab) => {
                        const Icon = resolveIcon(tab.icon);
                        return (
                            <Link key={tab.value} href={tab.href}>
                                <TabsTrigger value={tab.value} className="flex items-center gap-2">
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