'use client'
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { useSession } from 'next-auth/react';
import { SessionHeader } from './session-header';
import { FormData, SectionKey, sectionComponents, SessionData } from './types';
import { ReviewDetails } from './review-details';
import { Sidebar, TabBar } from './session-sidebar';

function Content({
    selected,
    formData,
    setFormData,
    onConfirm,
}: {
    selected: string;
    formData: FormData;
    setFormData: Dispatch<SetStateAction<FormData>>;
    onConfirm: () => void;
}) {
    if (selected === 'review') {
        return (
            <div className="flex-1">
                <ReviewDetails formData={formData} onConfirm={onConfirm} />
            </div>
        );
    }

    const keyMap: Record<string, SectionKey> = {
        'client-setup': 'client',
        'intervention': 'intervention',
        'counselor-availability': 'counselor',
        'location': 'location',
    };

    const sectionKey = keyMap[selected as keyof typeof keyMap];
    const SectionComponent = sectionKey ? sectionComponents[sectionKey] : null;

    if (SectionComponent && sectionKey) {
        return (
            <div className="flex-1">
                <SectionComponent
                    data={formData[sectionKey]}
                    setData={(d: FormData[typeof sectionKey]) =>
                        setFormData((prev) => ({ ...prev, [sectionKey]: d }))
                    }
                />
            </div>
        );
    }

    return (
        <div className="flex-1 p-8">
            <h2 className="text-xl font-bold mb-4">{selected}</h2>
            <p className="text-gray-600">Content for <b>{selected}</b> goes here.</p>
        </div>
    );
}

export default function SessionEditPage() {
    const searchParams = useSearchParams();
    const [selected, setSelected] = useState(searchParams.get('tab') || 'client-setup');
    const [formData, setFormData] = useState<FormData>({
        client: {},
        intervention: {},
        counselor: {},
        location: {},
    });
    const [sessionData, setSessionData] = useState<SessionData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const params = useParams();
    const router = useRouter();
    const { status } = useSession();

    // Update URL when tab changes
    useEffect(() => {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', selected);
        window.history.replaceState({}, '', url.toString());
    }, [selected]);

    // Single useEffect for data fetching
    useEffect(() => {
        const fetchSessionData = async () => {
            try {
                if (status === 'loading') return;
                if (status === 'unauthenticated') {
                    router.push('/auth/login');
                    return;
                }

                setError(null);
                const res = await fetch(`/api/services/sessions/${params.sessionId}`, {
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.error || `Failed to fetch session: ${res.status}`);
                }

                const data = await res.json();
                setSessionData(data);

                // Update form data with session data
                setFormData(prev => ({
                    ...prev,
                    client: {
                        ...prev.client,
                        company: data.client?.name || '',
                        clientId: data.client?.id || '',
                        staff: data.staffId || '',
                        dependant: data.beneficiaryId || '',
                        sessionType: data.isGroupSession ? 'group' : 'individual',
                        numAttendees: data.metadata?.numAttendees || 1,
                        sessionFor: data.metadata?.sessionFor || 'organization',
                        whoFor: data.metadata?.whoFor || 'self',
                        notes: data.notes || '',
                    },
                    intervention: {
                        ...prev.intervention,
                        intervention: data.interventionId || '',
                        notes: data.metadata?.interventionNotes || '',
                    },
                    counselor: {
                        ...prev.counselor,
                        provider: data.providerId || '',
                        date: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
                        duration: data.duration || '',
                    },
                    location: {
                        ...prev.location,
                        location: data.location || '',
                        requirements: data.metadata?.requirements || '',
                    }
                }));
            } catch (error) {
                console.error('Error fetching session:', error);
                setError(error instanceof Error ? error.message : 'Failed to fetch session');
            }
        };

        if (params.sessionId) {
            fetchSessionData();
        }
    }, [params.sessionId, status, router]);

    const handleConfirm = () => {
        // TODO: Call your session creation API
        alert('Session confirmed!');
    };

    return (
        <div className="flex flex-col h-screen w-full">
            <div className="sticky top-0 z-20 w-full bg-white">
                <SessionHeader formData={formData} />
                <TabBar selected={selected} onSelect={setSelected} />
            </div>
            <div className="flex flex-1 min-h-0">
                <Sidebar selected={selected} onSelect={setSelected} />
                <div className="flex-1 overflow-y-auto">
                    <Content
                        selected={selected}
                        formData={formData}
                        setFormData={setFormData}
                        onConfirm={handleConfirm}
                    />
                </div>
            </div>
        </div>
    );
}