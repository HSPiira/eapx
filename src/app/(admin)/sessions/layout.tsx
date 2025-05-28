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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui';
import { SessionRequestForm } from '@/components/session-booking/SessionRequestForm';
import { SessionRequestFormData, ServiceProvider } from '@/components/session-booking/sessionRequestSchema';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { ServiceProviderType, RelationType, ProviderStaff, Beneficiary } from '@prisma/client';

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
    const [modalOpen, setModalOpen] = useState(false);
    const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([]);
    const [beneficiaries, setBeneficiaries] = useState<Array<{ id: string; name: string; relation: RelationType }>>([]);
    const [serviceProviders, setServiceProviders] = useState<Array<ServiceProvider>>([]);
    const [providerStaff] = useState<Array<ProviderStaff>>([]);
    const [staff, setStaff] = useState<Array<{ id: string; name: string; email: string; companyId: string }>>([]);
    const [interventions, setInterventions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { data: session } = useSession();
    const [selectedCompany] = useState<string>('');
    const [selectedStaff] = useState<string>('');

    useEffect(() => {
        async function loadData() {
            try {
                const [sessionsRes, companiesRes, serviceProvidersRes, staffRes, interventionsRes] = await Promise.all([
                    fetch('/api/services/sessions').then(async (res) => {
                        if (!res.ok) throw new Error(`Sessions API failed: ${res.status}`);
                        const text = await res.text();
                        try {
                            return { ok: true, data: JSON.parse(text) };
                        } catch (e) {
                            console.error('Failed to parse sessions response:', e);
                            throw new Error('Invalid JSON from sessions API');
                        }
                    }),
                    fetch('/api/clients').then(async (res) => {
                        if (!res.ok) throw new Error(`Clients API failed: ${res.status}`);
                        const text = await res.text();
                        try {
                            return { ok: true, data: JSON.parse(text) };
                        } catch (e) {
                            console.error('Failed to parse clients response:', e);
                            throw new Error('Invalid JSON from clients API');
                        }
                    }),
                    fetch('/api/providers').then(async (res) => {
                        if (!res.ok) throw new Error(`Providers API failed: ${res.status}`);
                        const text = await res.text();
                        try {
                            return { ok: true, data: JSON.parse(text) };
                        } catch (e) {
                            console.error('Failed to parse providers response:', e);
                            throw new Error('Invalid JSON from providers API');
                        }
                    }),
                    fetch('/api/staff').then(async (res) => {
                        if (!res.ok) throw new Error(`Staff API failed: ${res.status}`);
                        const text = await res.text();
                        try {
                            return { ok: true, data: JSON.parse(text) };
                        } catch (e) {
                            console.error('Failed to parse staff response:', e);
                            throw new Error('Invalid JSON from staff API');
                        }
                    }),
                    fetch('/api/services/interventions').then(async (res) => {
                        if (!res.ok) throw new Error(`Interventions API failed: ${res.status}`);
                        const text = await res.text();
                        try {
                            return { ok: true, data: JSON.parse(text) };
                        } catch (e) {
                            console.error('Failed to parse interventions response:', e);
                            throw new Error('Invalid JSON from interventions API');
                        }
                    })
                ]);

                setCounts(sessionsRes.data.data || sessionsRes.data);
                setCompanies(companiesRes.data.data || companiesRes.data);
                const mappedServiceProviders: ServiceProvider[] = (serviceProvidersRes.data.data || serviceProvidersRes.data).map((sp: ServiceProvider) => ({
                    ...sp,
                    type: ServiceProviderType[sp.type as keyof typeof ServiceProviderType] ?? ServiceProviderType.COUNSELOR
                }));
                setServiceProviders(mappedServiceProviders);
                setStaff(staffRes.data.data || staffRes.data);
                const interventionsArr = interventionsRes.data.data || interventionsRes.data;
                setInterventions(interventionsArr);
            } catch (error) {
                console.error('Failed to load data:', error);
                toast.error(`Failed to load data: ${error instanceof Error ? error.message : 'An unknown error occurred'}`);
            }
        }
        loadData();
    }, []);

    useEffect(() => {
        if (selectedCompany && selectedStaff) {
            fetch(`/api/clients/${selectedCompany}/staff/${selectedStaff}/beneficiaries`).then(async (res) => {
                if (!res.ok) throw new Error(`Beneficiaries API failed: ${res.status}`);
                const text = await res.text();
                try {
                    const json = JSON.parse(text);
                    setBeneficiaries(
                        (json.data || json).map((b: Beneficiary) => ({
                            ...b,
                            relation: RelationType[b.relation as keyof typeof RelationType]
                        }))
                    );
                } catch (e) {
                    console.error('Failed to parse beneficiaries response:', e);
                }
            }).catch(() => {
                // Optionally handle error
            });
        } else {
            setBeneficiaries([]);
        }
    }, [selectedCompany, selectedStaff]);

    const handleRequestSession = async (data: SessionRequestFormData) => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/services/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const responseData = await res.json();

            if (!res.ok) {
                throw new Error(responseData.message || 'Failed to request session');
            }

            toast.success('Session request submitted successfully!');
            setModalOpen(false);

            // Refresh the session counts
            const sessionsRes = await fetch('/api/services/sessions');
            if (sessionsRes.ok) {
                const sessionsData = await sessionsRes.json();
                setCounts(sessionsData.data || sessionsData);
            }
        } catch (err) {
            console.error('Session request error:', err);
            toast.error('Failed to submit session request', {
                description: err instanceof Error ? err.message : 'An unknown error occurred',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePointerDownOutside = (event: Event) => {
        event.preventDefault();
    };

    const handleEscapeKeyDown = (event: KeyboardEvent) => {
        event.preventDefault();
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Sessions</h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            See upcoming and past sessions booked through your event type links.
                        </p>
                    </div>
                    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                        <DialogTrigger asChild>
                            <Button>Request Session</Button>
                        </DialogTrigger>
                        <DialogContent
                            onPointerDownOutside={handlePointerDownOutside}
                            onEscapeKeyDown={handleEscapeKeyDown}
                        >
                            <DialogHeader>
                                <DialogTitle>Request a Session</DialogTitle>
                                <DialogDescription>
                                    Schedule a new counseling session with one of our professionals.
                                </DialogDescription>
                            </DialogHeader>
                            {session?.user?.id ? (
                                <SessionRequestForm
                                    companies={companies}
                                    beneficiaries={beneficiaries}
                                    serviceProviders={serviceProviders}
                                    providerStaff={providerStaff.map(staff => ({
                                        id: staff.id,
                                        name: staff.fullName,
                                        email: staff.email || '',
                                        companyId: staff.serviceProviderId
                                    }))}
                                    staff={staff}
                                    interventions={interventions}
                                    onSubmitAction={handleRequestSession}
                                    isSubmitting={isLoading}
                                    onCancel={() => setModalOpen(false)}
                                />
                            ) : (
                                <div className="text-red-500">You must be logged in to request a session.</div>
                            )}
                        </DialogContent>
                    </Dialog>
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
                                    className={`flex items-center gap-2 px-4 py-2 -mb-px border-b-2 font-medium text-sm transition-colors duration-150 whitespace-nowrap ${isActive
                                        ? `border-${color}-500 text-${color}-600 dark:text-${color}-400`
                                        : `border-transparent text-gray-500 dark:text-gray-400 hover:text-${color}-600 dark:hover:text-${color}-400`
                                        }`}
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
                {children}
            </div>
        </div>
    );
}