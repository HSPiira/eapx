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
                setFormData(prev => {
                    // Determine timeFormat (default to 12hr if not set)
                    const timeFormat = prev.counselor.timeFormat || '12hr';
                    let selectedSlot = '';
                    if (data.scheduledAt) {
                        const dateObj = new Date(data.scheduledAt);
                        let hours = dateObj.getHours();
                        const minutes = dateObj.getMinutes();
                        if (timeFormat === '12hr') {
                            const period = hours >= 12 ? 'pm' : 'am';
                            let displayHour = hours % 12;
                            if (displayHour === 0) displayHour = 12;
                            selectedSlot = `${displayHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
                        } else {
                            selectedSlot = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                        }
                    }
                    return ({
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
                            notes: data.metadata?.clientNotes || '',
                        },
                        intervention: {
                            ...prev.intervention,
                            intervention: data.interventionId || '',
                            notes: data.metadata?.interventionNotes || '',
                        },
                        counselor: {
                            ...prev.counselor,
                            provider: data.providerId || '',
                            staff: data.providerStaffId || '',
                            date: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
                            duration: data.duration ? data.duration.toString() : '30',
                            selectedSlot,
                        },
                        location: {
                            ...prev.location,
                            location: data.location || '',
                            requirements: data.metadata?.requirements || '',
                        }
                    });
                });
            } catch (error) {
                console.error('Error fetching session:', error);
                setError(error instanceof Error ? error.message : 'Failed to fetch session');
            }
        };

        if (params.sessionId) {
            fetchSessionData();
        }
    }, [params.sessionId, status, router]);

    const handleConfirm = async () => {
        try {
            if (!params.sessionId) {
                throw new Error('No session ID found');
            }

            // Parse the selected time slot and date
            const { date, selectedSlot, duration } = formData.counselor;
            if (!date || !selectedSlot || !duration) {
                throw new Error('Please select a date, time slot, and duration');
            }

            // Convert time slot to DateTime
            const [time, period] = selectedSlot.split(' ');
            let [hours, minutes] = time.split(':').map(Number);

            // Adjust hours for PM
            if (period === 'pm' && hours !== 12) {
                hours += 12;
            }
            // Adjust hours for AM
            if (period === 'am' && hours === 12) {
                hours = 0;
            }

            // Create scheduledAt DateTime
            const scheduledAt = new Date(date);
            scheduledAt.setHours(hours, minutes, 0, 0);

            // Validate that the scheduled time is not in the past
            const now = new Date();
            if (scheduledAt < now) {
                throw new Error('Session cannot be scheduled in the past');
            }

            // Create a complete update object with all required fields
            const sessionUpdate = {
                clientId: formData.client.clientId,
                staffId: formData.client.staff || null,
                beneficiaryId: formData.client.dependant || null,
                isGroupSession: ['group', 'family', 'couple'].includes(formData.client.sessionType || ''),
                sessionType: formData.client.sessionType,
                notes: formData.client.notes,
                interventionId: formData.intervention.intervention,
                providerId: formData.counselor.provider,
                providerStaffId: formData.counselor.staff || null,
                scheduledAt: scheduledAt.toISOString(),
                duration: parseInt(duration),
                location: formData.location.location,
                status: 'SCHEDULED',
                metadata: {
                    numAttendees: formData.client.numAttendees,
                    sessionFor: formData.client.sessionFor,
                    whoFor: formData.client.whoFor,
                    clientNotes: formData.client.notes,
                    interventionNotes: formData.intervention.notes,
                    requirements: formData.location.requirements,
                }
            };

            const res = await fetch(`/api/services/sessions/${params.sessionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sessionUpdate),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to confirm session: ${res.status}`);
            }

            const updatedSession = await res.json();
            alert('Session confirmed successfully!');
            router.push('/sessions/upcoming');
        } catch (error) {
            console.error('Error confirming session:', error);
            alert(error instanceof Error ? error.message : 'Failed to confirm session');
        }
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