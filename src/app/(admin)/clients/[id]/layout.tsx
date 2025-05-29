'use client';

import React from 'react';
import { usePathname, useParams, useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Users, FileText, Calendar, MessageSquare, BarChart, ArrowLeft, CheckCircle2, CircleOff, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const tabs = [
    { value: 'overview', label: 'Overview', icon: Building2, href: '' },
    { value: 'staff', label: 'Staff', icon: Users, href: '/staff' },
    { value: 'contracts', label: 'Contracts', icon: FileText, href: '/contracts' },
    { value: 'sessions', label: 'Sessions', icon: Calendar, href: '/sessions' },
    { value: 'feedback', label: 'Feedback', icon: MessageSquare, href: '/feedback' },
    { value: 'reports', label: 'Reports', icon: BarChart, href: '/reports' },
];

async function fetchClient(id: string) {
    const response = await fetch(`/api/clients/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch client');
    }
    return response.json();
}

export default function ClientDetailsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const clientId = params.id as string;
    const basePath = `/clients/${clientId}`;

    // Determine the current tab based on the pathname relative to the basePath
    const remainingPath = pathname.replace(basePath, '');
    const currentTab = remainingPath === '' ? 'overview' : remainingPath.split('/')[1];

    const { data: client, error, isLoading } = useQuery({
        queryKey: ['client', clientId],
        queryFn: () => fetchClient(clientId),
        retry: 2,
        retryDelay: 1000,
    });

    return (
        <div className="container mx-auto p-6 space-y-6">
            {error && (
                <div className="text-center text-red-500 p-4">
                    <p>Failed to load client details</p>
                    <Button
                        onClick={() => queryClient.invalidateQueries({ queryKey: ['client', clientId] })}
                        className="mt-2"
                    >
                        Retry
                    </Button>
                </div>
            )}
            {isLoading && (
                <div className="flex justify-center py-8">
                    <LoadingSpinner className="w-8 h-8" />
                </div>
            )}
            {client && (
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push('/clients')}
                        className="hover:bg-muted"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
                        {client.status === 'ACTIVE' ? (
                            <CheckCircle className="h-4 w-4 text-green-500 animate-pulse" />
                        ) : (
                            <CircleOff className="h-4 w-4 text-muted-foreground" />
                        )}
                        {client.isVerified && (
                            <Badge variant="outline" className="flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Verified
                            </Badge>
                        )}
                        <span className="text-muted-foreground">•</span>
                        <span className="text-base text-foreground">
                            {tabs.find(tab => tab.value === currentTab)?.label || 'Overview'}
                        </span>
                    </div>
                </div>
            )}
            <Tabs value={currentTab} className="w-full">
                <TabsList className="justify-start">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <Link key={tab.value} href={`${basePath}${tab.href}`}>
                                <TabsTrigger
                                    value={tab.value}
                                    className={cn(
                                        "flex items-center gap-2",
                                        "data-[state=inactive]:hover:bg-accent data-[state=inactive]:hover:text-accent-foreground",
                                        "data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-foreground",
                                        "data-[state=inactive]:text-muted-foreground"
                                    )}
                                >
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