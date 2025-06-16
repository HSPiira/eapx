import { CreateMeetingInput, Meeting, UpdateMeetingInput, MeetingPlatform } from "@/schema/meeting";
import { MeetingsResponse, PlatformMeetingResponse, ZoomMeetingResponse, TeamsMeetingResponse } from "@/types/meetings";

const PLATFORM_ENDPOINTS: Record<MeetingPlatform, string> = {
    zoom: '/api/zoom',
    teams: '/api/ms-teams',
    google: '/api/google-meet'
};

export async function fetchMeetings(): Promise<MeetingsResponse> {
    const res = await fetch('/api/services/meetings?limit=50&page=1');
    if (!res.ok) {
        throw new Error('Failed to fetch meetings');
    }
    return res.json();
}

export async function createMeeting(data: CreateMeetingInput, accessToken?: string): Promise<Meeting> {
    const endpoint = PLATFORM_ENDPOINTS[data.platform];

    // Transform data based on platform
    let requestBody;
    if (data.platform === 'teams') {
        requestBody = {
            accessToken,
            subject: data.subject,
            startDateTime: data.startDateTime,
            endDateTime: data.endDateTime,
            attendees: data.attendees,
            body: data.body,
            location: data.location,
            reminderMinutes: 15
        };
    } else if (data.platform === 'zoom') {
        requestBody = {
            topic: data.subject,
            startTime: data.startDateTime,
            duration: Math.round((new Date(data.endDateTime).getTime() - new Date(data.startDateTime).getTime()) / 60000),
            hostName: data.attendees?.[0], // First attendee is the host
            attendees: data.attendees,
            settings: data.settings
        };
    }

    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };

    if (data.platform === 'teams' && accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to create ${data.platform} meeting`);
    }

    const platformResponse = await res.json() as PlatformMeetingResponse;

    // Transform platform-specific response to our unified Meeting type
    const meeting: Meeting = {
        id: platformResponse.id,
        subject: data.subject,
        startDateTime: data.startDateTime,
        endDateTime: data.endDateTime,
        timezone: data.timezone,
        agenda: data.body,
        location: data.location,
        platform: data.platform,
        joinUrl: data.platform === 'zoom'
            ? (platformResponse as ZoomMeetingResponse).join_url
            : (platformResponse as TeamsMeetingResponse).joinUrl,
        hostEmail: data.platform === 'zoom'
            ? (platformResponse as ZoomMeetingResponse).host_email
            : (platformResponse as TeamsMeetingResponse).hostEmail,
        attendees: data.attendees?.map((email: string) => ({ email, role: 'attendee' })) || [],
        settings: data.settings,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    return meeting;
}

export async function updateMeeting(data: UpdateMeetingInput, accessToken?: string): Promise<Meeting> {
    const { id, platform, ...rest } = data;
    const endpoint = `${PLATFORM_ENDPOINTS[platform]}/${id}`;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };

    if (platform === 'teams' && accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const res = await fetch(endpoint, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(rest),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to update ${platform} meeting`);
    }

    const platformResponse = await res.json() as PlatformMeetingResponse;

    // Transform platform-specific response to our unified Meeting type
    const meeting: Meeting = {
        id: platformResponse.id,
        subject: data.subject,
        startDateTime: data.startDateTime,
        endDateTime: data.endDateTime,
        timezone: data.timezone,
        agenda: data.body,
        location: data.location,
        platform: data.platform,
        joinUrl: data.platform === 'zoom'
            ? (platformResponse as ZoomMeetingResponse).join_url
            : (platformResponse as TeamsMeetingResponse).joinUrl,
        hostEmail: data.platform === 'zoom'
            ? (platformResponse as ZoomMeetingResponse).host_email
            : (platformResponse as TeamsMeetingResponse).hostEmail,
        attendees: data.attendees?.map((email: string) => ({ email, role: 'attendee' })) || [],
        settings: data.settings,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    return meeting;
}

export async function deleteMeeting(id: string, platform: MeetingPlatform, accessToken?: string): Promise<void> {
    const endpoint = `${PLATFORM_ENDPOINTS[platform]}/${id}`;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };

    if (platform === 'teams' && accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const res = await fetch(endpoint, {
        method: 'DELETE',
        headers,
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to delete ${platform} meeting`);
    }
}
