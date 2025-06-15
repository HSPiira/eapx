import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ArrowLeft, ExternalLink, Link2, Code2, Trash2 } from 'lucide-react';
import { SessionData, FormData, SessionMetadata } from './types';
import React from 'react';
import { toast } from 'sonner';

interface SessionHeaderProps {
    formData: FormData;
}

// Define the type for session updates
interface SessionUpdate {
    clientId?: string;
    staffId?: string | null;
    beneficiaryId?: string | null;
    isGroupSession?: boolean;
    sessionType?: string;
    notes?: string;
    interventionId?: string;
    providerId?: string;
    providerStaffId?: string | null;
    scheduledAt?: string;
    duration?: number;
    location?: string;
    metadata?: SessionMetadata;
    status?: string;
}

export function SessionHeader({ formData }: SessionHeaderProps) {
    const router = useRouter();
    const params = useParams();
    const { status } = useSession();
    const [hidden, setHidden] = useState(false);
    const [sessionData, setSessionData] = useState<SessionData | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Move the fetchSessionData function outside useEffect to avoid dependency issues
    const fetchSessionData = React.useCallback(async () => {
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
        } catch (error) {
            console.error('Error fetching session:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch session');
        }
    }, [params.sessionId, status, router]);

    // Use useEffect with proper dependencies
    useEffect(() => {
        if (params.sessionId) {
            fetchSessionData();
        }
    }, [params.sessionId, fetchSessionData]);

    const handleSave = async () => {
        try {
            if (!sessionData?.id) {
                throw new Error('No session ID found');
            }

            // Create a partial update object with only the fields we know have changed
            const sessionUpdate: SessionUpdate = {};

            // Only include fields that we know have been modified
            if (formData.client.clientId) {
                sessionUpdate.clientId = formData.client.clientId;
            }

            // Handle staff-related fields based on sessionFor
            if (formData.client.sessionFor === 'organization') {
                // Clear staff-related fields when sessionFor is organization
                sessionUpdate.staffId = null;
                sessionUpdate.beneficiaryId = null;
            } else {
                // Only include staff-related fields if sessionFor is staff
                if (formData.client.staff !== undefined) {
                    sessionUpdate.staffId = formData.client.staff || null;
                }
                if (formData.client.dependant !== undefined) {
                    sessionUpdate.beneficiaryId = formData.client.dependant || null;
                }
            }

            if (formData.client.sessionType !== undefined) {
                // Set isGroupSession based on session type
                const isGroupSession = ['group', 'family', 'couple'].includes(formData.client.sessionType);
                sessionUpdate.isGroupSession = isGroupSession;
                sessionUpdate.sessionType = formData.client.sessionType;
            }
            if (formData.client.notes !== undefined) {
                sessionUpdate.notes = formData.client.notes;
            }
            if (formData.intervention.intervention) {
                sessionUpdate.interventionId = formData.intervention.intervention;
            }
            if (formData.counselor.provider) {
                sessionUpdate.providerId = formData.counselor.provider;
            }
            if (formData.counselor.staff !== undefined) {
                sessionUpdate.providerStaffId = formData.counselor.staff || null;
            }

            // Handle date, time, and duration
            if (formData.counselor.date && formData.counselor.selectedSlot) {
                // Parse the selected time slot
                const [time, period] = formData.counselor.selectedSlot.split(' ');
                const [hours, minutes] = time.split(':');
                let hour = parseInt(hours);

                // Convert to 24-hour format
                if (period === 'pm' && hour !== 12) hour += 12;
                if (period === 'am' && hour === 12) hour = 0;

                // Create the scheduled date with the selected time
                const scheduledDate = new Date(formData.counselor.date);
                scheduledDate.setHours(hour, parseInt(minutes), 0, 0);

                sessionUpdate.scheduledAt = scheduledDate.toISOString();
            }

            // Handle duration
            if (formData.counselor.duration) {
                sessionUpdate.duration = parseInt(formData.counselor.duration);
            }

            // Only update metadata if we have new values
            if (formData.client.numAttendees || formData.client.sessionFor || formData.client.whoFor ||
                formData.client.notes || formData.intervention.notes || formData.location.requirements) {
                sessionUpdate.metadata = {
                    ...(sessionData.metadata || {}),
                    ...(formData.client.numAttendees && { numAttendees: formData.client.numAttendees }),
                    ...(formData.client.sessionFor && { sessionFor: formData.client.sessionFor }),
                    ...(formData.client.whoFor && { whoFor: formData.client.whoFor }),
                    ...(formData.client.notes && { clientNotes: formData.client.notes }),
                    ...(formData.intervention.notes && { interventionNotes: formData.intervention.notes }),
                    ...(formData.location.requirements && { requirements: formData.location.requirements }),
                };
            }

            // Add location data if present
            if (formData.location.location) {
                sessionUpdate.location = formData.location.location;
            }

            console.log('sessionUpdate', sessionUpdate);

            // Using PATCH but only sending modified fields
            const res = await fetch(`/api/services/sessions/${sessionData.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sessionUpdate),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to save session: ${res.status}`);
            }

            const updatedSession = await res.json();
            setSessionData(updatedSession);
            await fetchSessionData();
            toast.success('Session saved successfully!');
        } catch (error) {
            console.error('Error saving session:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to save session');
        }
    };

    const sessionTitle = error
        ? 'Error'
        : (sessionData
            ? <><span>{sessionData.client?.name || 'New Session'}</span><span className="mx-1 text-gray-400">·</span><span className="text-xs font-normal text-gray-500 dark:text-gray-300 align-middle">{sessionData.id}</span></>
            : 'Loading...');

    const isScheduled = sessionData?.status === 'SCHEDULED';

    return (
        <div className="fixed top-0
            left-0 w-full
            md:left-[64px] md:w-[calc(100%-64px)]
            lg:left-[240px] lg:w-[calc(100%-240px)]
            right-0 z-50 flex items-center justify-between
            px-4 py-3 mb-2 bg-white dark:bg-black border-b border-gray-200">
            {/* Left: Back + Title */}
            <div className="flex items-center gap-2 min-w-0 flex-1 mr-4 md:mr-0">
                <button
                    className="flex-shrink-0 p-1 rounded-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border focus:bg-gray-100 dark:focus:bg-gray-800 transition-colors"
                    onClick={() => router.push('/sessions/unconfirmed')}
                    aria-label="Back to Sessions"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <span className={`font-bold text-lg truncate ${error ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>{sessionTitle}</span>
                {error && (
                    <span className="text-sm text-red-600 ml-2 truncate">{error}</span>
                )}
            </div>
            {/* Right: Hidden toggle, menu, save */}
            <div className="flex items-center gap-3 flex-shrink-0">
                <div className="flex items-center gap-1">
                    <span className="text-gray-700 font-medium text-sm whitespace-nowrap">Hidden</span>
                    <button
                        className={`w-8 h-5 flex items-center bg-gray-200 rounded-full p-0.5 transition-colors duration-200 ${hidden ? 'bg-blue-500' : ''}`}
                        onClick={() => setHidden(h => !h)}
                        aria-label="Toggle hidden"
                    >
                        <span className={`inline-block w-3.5 h-3.5 bg-white rounded-full shadow transform transition-transform duration-200 ${hidden ? 'translate-x-3' : ''}`}></span>
                    </button>
                </div>
                <span className="h-5 w-px bg-gray-200 mx-1" />
                <div className="flex items-center gap-1">
                    <button className="p-2 hover:bg-gray-100 rounded" aria-label="Open"><ExternalLink className="w-4 h-4" /></button>
                    <button className="p-2 hover:bg-gray-100 rounded" aria-label="Link"><Link2 className="w-4 h-4" /></button>
                    <button className="p-2 hover:bg-gray-100 rounded" aria-label="Code"><Code2 className="w-4 h-4" /></button>
                    <button className="p-2 hover:bg-gray-100 rounded text-red-600" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
                </div>
                <span className="h-5 w-px bg-gray-200 mx-1" />
                <button
                    className={`px-3 py-1.5 rounded font-semibold transition-colors ml-1 text-sm whitespace-nowrap ${isScheduled
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 hover:bg-gray-800'
                        }`}
                    aria-label="Save"
                    onClick={handleSave}
                    disabled={isScheduled}
                >
                    Save
                </button>
            </div>
        </div>
    );
}