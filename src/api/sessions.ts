import { SessionData } from "@/app/(admin)/sessions/[sessionId]/types";

export async function fetchSession(sessionId: string): Promise<SessionData> {
    const response = await fetch(`/api/services/sessions/${sessionId}`);
    if (!response.ok) throw new Error('Failed to fetch session');
    return response.json();
}

export async function fetchSessionWithDetails(sessionId: string) {
    const response = await fetch(`/api/services/sessions/${sessionId}/details`);
    if (!response.ok) throw new Error('Failed to fetch session details');
    return response.json();
}

export async function updateSession(sessionId: string, data: Partial<SessionData>) {
    const response = await fetch(`/api/services/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update session');
    return response.json();
}

export async function confirmSession(sessionId: string) {
    const response = await fetch(`/api/services/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            status: 'SCHEDULED'
        }),
    });
    if (!response.ok) throw new Error('Failed to confirm session');
    return response.json();
} 