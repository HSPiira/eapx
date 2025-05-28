import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ArrowLeft, ExternalLink, Link2, Code2, Trash2 } from 'lucide-react';
import { SessionData, FormData } from './types';

interface SessionHeaderProps {
    formData: FormData;
}

export function SessionHeader({ formData }: SessionHeaderProps) {
    const router = useRouter();
    const params = useParams();
    const { status } = useSession();
    const [hidden, setHidden] = useState(false);
    const [sessionData, setSessionData] = useState<SessionData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [staffData, setStaffData] = useState<any>(null);
    const [dependantData, setDependantData] = useState<any>(null);

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

                // Fetch staff data if staff ID is present
                if (data.staffId) {
                    const staffRes = await fetch(`/api/clients/${data.clientId}/staff/${data.staffId}`, {
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });
                    if (staffRes.ok) {
                        const staffData = await staffRes.json();
                        setStaffData(staffData);
                    }
                }

                // Fetch dependant data if beneficiary ID is present
                if (data.beneficiaryId) {
                    const dependantRes = await fetch(`/api/clients/${data.clientId}/staff/${data.staffId}/beneficiaries/${data.beneficiaryId}`, {
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });
                    if (dependantRes.ok) {
                        const dependantData = await dependantRes.json();
                        setDependantData(dependantData);
                    }
                }
            } catch (error) {
                console.error('Error fetching session:', error);
                setError(error instanceof Error ? error.message : 'Failed to fetch session');
            }
        };

        if (params.sessionId) {
            fetchSessionData();
        }
    }, [params.sessionId, status, router]);

    const handleSave = async () => {
        try {
            if (!sessionData?.id) {
                throw new Error('No session ID found');
            }

            // Transform formData into the format expected by the API
            const sessionUpdate = {
                id: sessionData.id,
                clientId: formData.client.clientId,
                staffId: formData.client.staff,
                beneficiaryId: formData.client.dependant || null,
                isGroupSession: formData.client.sessionType === 'group',
                notes: formData.client.notes,
                metadata: {
                    ...sessionData.metadata,
                    numAttendees: formData.client.numAttendees,
                    sessionFor: formData.client.sessionFor,
                    whoFor: formData.client.whoFor,
                },
                // Use the selected intervention from the form
                interventionId: formData.intervention.intervention,
                providerId: sessionData.providerId,
                scheduledAt: sessionData.scheduledAt,
                status: sessionData.status,
                duration: sessionData.duration,
                location: sessionData.location,
                completedAt: sessionData.completedAt,
                feedback: sessionData.feedback,
                cancellationReason: sessionData.cancellationReason,
                rescheduleCount: sessionData.rescheduleCount
            };

            console.log('sessionUpdate', sessionUpdate);

            const res = await fetch(`/api/services/sessions/${sessionData.id}`, {
                method: 'PUT',
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
            alert('Session saved successfully!');
        } catch (error) {
            console.error('Error saving session:', error);
            alert(error instanceof Error ? error.message : 'Failed to save session');
        }
    };

    const sessionTitle = error
        ? 'Error'
        : (sessionData
            ? <><span>{sessionData.client?.name || 'New Session'}</span><span className="mx-1 text-gray-400">·</span><span className="text-xs font-normal text-gray-500 dark:text-gray-300 align-middle">{sessionData.id}</span></>
            : 'Loading...');

    return (
        <div className="flex items-center justify-between w-full px-0 mx-0 mt-0 bg-background">
            {/* Left: Back + Title */}
            <div className="flex items-center gap-2 min-w-0">
                <button
                    className="p-1 rounded-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border focus:bg-gray-100 dark:focus:bg-gray-800 transition-colors"
                    onClick={() => router.push('/sessions/unconfirmed')}
                    aria-label="Back to Sessions"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <span className={`font-bold text-lg truncate ${error ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>{sessionTitle}</span>
                {error && (
                    <span className="text-sm text-red-600 ml-2">{error}</span>
                )}
            </div>
            {/* Right: Hidden toggle, menu, save */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                    <span className="text-gray-700 font-medium text-sm">Hidden</span>
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
                <button className="px-3 py-1.5 rounded font-semibold hover:bg-gray-800 transition-colors ml-1 text-sm bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900" aria-label="Save" onClick={handleSave}>Save</button>
            </div>
        </div>
    );
}