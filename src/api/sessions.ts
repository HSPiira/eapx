import { SessionData } from "@/app/(admin)/sessions/[sessionId]/types";
import { SessionRequestFormData } from "@/components/session-booking/sessionRequestSchema";

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

export async function createTestSession(accessToken: string) {
    const response = await fetch('/api/test/create-test-session', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create test session');
    }
    return response.json();
}

export async function sendFeedbackLink(sessionId: string, accessToken: string) {
    const response = await fetch(`/api/sessions/${sessionId}/send-feedback-link`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send feedback link');
    }
    return response.json();
}

export async function createDraftSession(clientId: string) {
    const response = await fetch('/api/services/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId }),
    });
    if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error || 'Failed to create draft session');
    }
    return response.json();
}

export async function fetchUnconfirmedSessions() {
    const response = await fetch('/api/services/sessions?status=UNCONFIRMED');
    if (!response.ok) throw new Error(`Failed to fetch unconfirmed sessions: ${response.status} ${response.statusText}`);
    return response.json();
}

export async function fetchUpcomingSessions() {
    const response = await fetch('/api/services/sessions?status=SCHEDULED');
    if (!response.ok) throw new Error(`Failed to fetch sessions: ${response.status} ${response.statusText}`);
    return response.json();
}

export async function createSessionRequest(data: SessionRequestFormData) {
    const response = await fetch("/api/session-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create session request');
    }
    return response.json();
}

export async function verifyFeedbackToken(sessionId: string, token: string) {
    const response = await fetch(`/api/verify-feedback-token?sessionId=${sessionId}&token=${token}`);
    if (!response.ok) {
        throw new Error('Invalid or expired token');
    }
    return response.json();
} 