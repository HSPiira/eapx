'use client'
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { SessionHeader } from './session-header';
import { FormData, SectionKey, sectionComponents, SessionData } from './types';
import { ReviewDetails } from './review-details';
import { Sidebar, TabBar } from './session-sidebar';
import { useSessionDetails } from '@/hooks/sessions/useSessionDetails';
import { SessionType as PrismaSessionType } from '@prisma/client';

const ORG_SESSION_TYPES = [
    PrismaSessionType.TALK,
    PrismaSessionType.WEBINAR,
    PrismaSessionType.TRAINING,
    PrismaSessionType.WORKSHOP,
    PrismaSessionType.SEMINAR,
    PrismaSessionType.CONFERENCE
] as const;

const STAFF_SESSION_TYPES = [
    PrismaSessionType.INDIVIDUAL,
    PrismaSessionType.COUPLE,
    PrismaSessionType.FAMILY,
    PrismaSessionType.GROUP
] as const;

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
        client: {
            sessionFor: 'organization',
        },
        intervention: {},
        counselor: {},
        location: {},
    });

    const [sessionData, setSessionData] = useState<SessionData | null>(null);
    const [initialLoad, setInitialLoad] = useState(true);

    const { session, isLoading, isError, error } = useSessionDetails(
        sessionId as string,
        sessionData?.client?.id || '',
        sessionData?.staffId
    );

    useEffect(() => {
        if (session) {
            setSessionData(session);
        }
    }, [session]);

    useEffect(() => {
        if (sessionData && initialLoad) {
            const sessionFor = sessionData.metadata?.sessionFor || 'organization';
            const validTypes: readonly PrismaSessionType[] = sessionFor === 'organization'
                ? ORG_SESSION_TYPES
                : STAFF_SESSION_TYPES;
            const sessionType = validTypes.includes(sessionData.sessionType as PrismaSessionType)
                ? sessionData.sessionType
                : validTypes[0];

            setFormData((prev: FormData) => ({
                ...prev,
                client: {
                    ...prev.client,
                    company: sessionData.client?.name || '',
                    clientId: sessionData.client?.id || '',
                    staff: sessionData.staffId || '',
                    dependant: sessionData.beneficiaryId || '',
                    sessionType,
                    numAttendees: sessionData.metadata?.numAttendees || 1,
                    sessionFor,
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
            setInitialLoad(false);
        }
    }, [sessionData, initialLoad]);

    useEffect(() => {
        setFormData((prev) => {
            if (!prev.client.sessionType) {
                const sessionFor = prev.client.sessionFor || 'organization';
                const defaultType =
                    sessionFor === 'organization'
                        ? ORG_SESSION_TYPES[0]
                        : STAFF_SESSION_TYPES[0];
                return {
                    ...prev,
                    client: {
                        ...prev.client,
                        sessionType: defaultType,
                    },
                };
            }
            return prev;
        });
    }, [formData.client.sessionFor]);

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