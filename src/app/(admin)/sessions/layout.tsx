'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    CalendarClock,
    Clock4,
    Repeat,
    History,
    XCircle,
    File,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { ServiceProvider } from '@/components/session-booking/sessionRequestSchema';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { ServiceProviderType } from '@prisma/client';
import { SessionRequestModal } from './[sessionId]/session-request';

const tabs = [
    { label: 'Upcoming', href: '/sessions/upcoming', icon: CalendarClock, key: 'upcoming', color: 'blue' },
    { label: 'Unconfirmed', href: '/sessions/unconfirmed', icon: Clock4, key: 'unconfirmed', color: 'amber' },
    { label: 'Recurring', href: '/sessions/recurring', icon: Repeat, key: 'recurring', color: 'emerald' },
    { label: 'Past', href: '/sessions/past', icon: History, key: 'past', color: 'slate' },
    { label: 'Canceled', href: '/sessions/canceled', icon: XCircle, key: 'canceled', color: 'rose' },
    // { label: 'Drafts', href: '/sessions/drafts', icon: File, key: 'drafts', color: 'gray' },
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

export default function SessionsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [modalOpen, setModalOpen] = useState(false);
    const [clients, setClients] = useState<Array<{ id: string; name: string }>>([]);
    const [, setServiceProviders] = useState<Array<ServiceProvider>>([]);
    const [, setStaff] = useState<Array<{ id: string; name: string; email: string; companyId: string }>>([]);
    const [, setInterventions] = useState([]);
    const [, setIsLoading] = useState(false);

    useSession();

    const sessionDetailRegex = /^\/sessions\/([^/]+)$/;
    const knownTabs = [
        '/sessions/upcoming',
        '/sessions/unconfirmed',
        '/sessions/recurring',
        '/sessions/past',
        '/sessions/canceled',
    ];
    const isSessionDetail = sessionDetailRegex.test(pathname) && !knownTabs.includes(pathname);

    useEffect(() => {
        async function loadData() {
            try {
                const [clientsRes, serviceProvidersRes, staffRes, interventionsRes, draftSessionsRes, unconfirmedSessionsRes] = await Promise.all([
                    fetch('/api/clients').then(async (res) => {
                        if (!res.ok) {
                            const errorData = await res.json().catch(() => ({}));
                            throw new Error(errorData.error || `Clients API failed: ${res.status}`);
                        }
                        const data = await res.json();
                        return data?.data || data || [];
                    }),
                    fetch('/api/providers').then(async (res) => {
                        if (!res.ok) {
                            const errorData = await res.json().catch(() => ({}));
                            throw new Error(errorData.error || `Providers API failed: ${res.status}`);
                        }
                        const data = await res.json();
                        return data?.data || data || [];
                    }),
                    fetch('/api/staff').then(async (res) => {
                        if (!res.ok) {
                            const errorData = await res.json().catch(() => ({}));
                            throw new Error(errorData.error || `Staff API failed: ${res.status}`);
                        }
                        const data = await res.json();
                        return data?.data || data || [];
                    }),
                    fetch('/api/services/interventions').then(async (res) => {
                        if (!res.ok) {
                            const errorData = await res.json().catch(() => ({}));
                            throw new Error(errorData.error || `Interventions API failed: ${res.status}`);
                        }
                        const data = await res.json();
                        return data?.data || data || [];
                    }),
                    fetch('/api/services/sessions?status=DRAFT').then(async (res) => {
                        if (!res.ok) {
                            const errorData = await res.json().catch(() => ({}));
                            throw new Error(errorData.error || `Draft sessions API failed: ${res.status}`);
                        }
                        const data = await res.json();
                        return data?.metadata?.total || 0;
                    }),
                    fetch('/api/services/sessions?status=UNCONFIRMED').then(async (res) => {
                        if (!res.ok) {
                            const errorData = await res.json().catch(() => ({}));
                            throw new Error(errorData.error || `Unconfirmed sessions API failed: ${res.status}`);
                        }
                        const data = await res.json();
                        return data?.metadata?.total || 0;
                    })
                ]);

                setCounts({
                    upcoming: draftSessionsRes,
                    unconfirmed: unconfirmedSessionsRes,
                    recurring: draftSessionsRes,
                    past: draftSessionsRes,
                    canceled: draftSessionsRes,
                    drafts: draftSessionsRes
                });
                setClients(clientsRes);
                const mappedServiceProviders: ServiceProvider[] = (serviceProvidersRes || []).map((sp: ServiceProvider) => ({
                    ...sp,
                    type: ServiceProviderType[sp.type as keyof typeof ServiceProviderType] ?? ServiceProviderType.COUNSELOR
                }));
                setServiceProviders(mappedServiceProviders);
                setStaff(staffRes);
                setInterventions(interventionsRes);
            } catch (error) {
                console.error('Failed to load data:', error);
                setCounts({
                    upcoming: 0,
                    unconfirmed: 0,
                    recurring: 0,
                    past: 0,
                    canceled: 0,
                    drafts: 0
                });
                toast.error(`Failed to load data: ${error instanceof Error ? error.message : 'An unknown error occurred'}`);
            }
        }
        loadData();
    }, []);

    const handleCreateDraftSession = async (clientId: string) => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/services/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientId }),
            });
            if (!res.ok) {
                const responseData = await res.json();
                console.log(responseData);
                throw new Error(responseData.error || 'Failed to create draft session');
            }
            const { data: draft } = await res.json();
            toast.success('Draft session created!');
            setModalOpen(false);
            router.push(`/sessions/${draft.id}`);
        } catch (err) {
            console.error('Draft session error:', err);
            toast.error('Failed to create draft session', {
                description: err instanceof Error ? err.message : 'An unknown error occurred',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4">
            <div className="py-3">
                {!isSessionDetail && (
                    <>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Sessions</h1>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    See upcoming and past sessions booked through your event type links.
                                </p>
                            </div>
                            <Button onClick={() => setModalOpen(true)}>Request Session</Button>
                            <SessionRequestModal
                                open={modalOpen}
                                onClose={() => setModalOpen(false)}
                                onConfirm={handleCreateDraftSession}
                                companies={clients}
                            />
                        </div>
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
                                            className={`flex items-center gap-2 px-4 py-2 -mb-px border-b-2 font-medium text-sm transition-colors duration-150 whitespace-nowrap
                                                ${isActive
                                                    ? tabColorClasses[color as keyof typeof tabColorClasses].active
                                                    : `border-transparent text-gray-500 dark:text-gray-400 ${tabColorClasses[color as keyof typeof tabColorClasses].hover}`
                                                }
                                            `}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {label}
                                            {typeof count === 'number' && (
                                                <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5">
                                                    {count}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    </>
                )}
                {children}
            </div>
        </div>
    );
}