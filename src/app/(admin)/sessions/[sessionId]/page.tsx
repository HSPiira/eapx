'use client'
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { SessionHeader } from './session-header';
import { FormData, SectionKey, sectionComponents, SessionData } from './types';
import { ReviewDetails } from './review-details';
import { Sidebar, TabBar } from './session-sidebar';
import { useSessionDetails } from '@/hooks/sessions/useSessionDetails';

function Content({
    selected,
    formData,
    setFormData,
    onConfirm,
}: {
    selected: string;
    formData: FormData;
    setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
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
                        setFormData((prev: FormData) => ({ ...prev, [sectionKey]: d }))
                    }
                    {...(sectionKey === 'client' ? { clientId: formData.client.clientId } : {})}
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
    const { sessionId } = useParams();
    const [selected, setSelected] = useState('client-setup');
    const [formData, setFormData] = useState<FormData>({
        client: {},
        intervention: {},
        counselor: {},
        location: {},
    });

    // Initialize with empty session data
    const [sessionData, setSessionData] = useState<SessionData | null>(null);

    const { session, staff, dependants, isLoading, isError, error } = useSessionDetails(
        sessionId as string,
        sessionData?.client?.id || '',
        sessionData?.staffId
    );

    // Update session data when session is loaded
    useEffect(() => {
        if (session) {
            setSessionData(session);
        }
    }, [session]);

    // Update form data when session data is loaded
    useEffect(() => {
        if (sessionData) {
            setFormData((prev: FormData) => ({
                ...prev,
                client: {
                    ...prev.client,
                    company: sessionData.client?.name || '',
                    clientId: sessionData.client?.id || '',
                    staff: sessionData.staffId || '',
                    dependant: sessionData.beneficiaryId || '',
                    sessionType: sessionData.sessionType,
                    numAttendees: sessionData.metadata?.numAttendees || 1,
                    sessionFor: sessionData.metadata?.sessionFor || 'organization',
                    whoFor: sessionData.metadata?.whoFor || 'self',
                    notes: sessionData.metadata?.clientNotes || '',
                },
                intervention: {
                    ...prev.intervention,
                    intervention: sessionData.interventionId || '',
                    notes: sessionData.metadata?.interventionNotes || '',
                },
                counselor: {
                    ...prev.counselor,
                    provider: sessionData.providerId || '',
                    staff: sessionData.providerStaffId || '',
                    date: sessionData.scheduledAt ? new Date(sessionData.scheduledAt) : undefined,
                    duration: sessionData.duration ? sessionData.duration.toString() : '30',
                    selectedSlot: sessionData.scheduledAt ? new Date(sessionData.scheduledAt).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    }) : '',
                    timeFormat: '12hr',
                },
                location: {
                    ...prev.location,
                    location: sessionData.location || '',
                    requirements: sessionData.metadata?.requirements || '',
                }
            }));
        }
    }, [sessionData]);

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading session details: {error?.message}</div>;

    return (
        <div className="flex h-full">
            <Sidebar selected={selected} onSelect={setSelected} />
            <div className="flex-1 flex flex-col">
                <SessionHeader formData={formData} />
                <div>
                    <TabBar selected={selected} onSelect={setSelected} />
                    <Content
                        selected={selected}
                        formData={formData}
                        setFormData={setFormData}
                        onConfirm={() => { }}
                    />
                </div>
            </div>
        </div>
    );
}