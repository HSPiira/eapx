import { MeetingPlatform } from "@/schema/meeting";

export interface Meeting {
    id: string;
    subject: string;
    startDateTime: string;
    endDateTime: string;
    timezone: string;
    agenda?: string;
    location?: string;
    platform: MeetingPlatform;
    joinUrl: string;
    hostEmail: string;
    attendees: Array<{ email: string; role: string }>;
    settings?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

export interface MeetingsResponse {
    meetings: Meeting[];
    total: number;
    page: number;
    limit: number;
}

// Platform-specific response types
export interface ZoomMeetingResponse {
    id: string;
    join_url: string;
    host_email: string;
    start_url?: string;
    password?: string;
}

export interface TeamsMeetingResponse {
    id: string;
    joinUrl: string;
    hostEmail: string;
    onlineMeetingUrl?: string;
}

export type PlatformMeetingResponse = ZoomMeetingResponse | TeamsMeetingResponse;

export interface MeetingError {
    message: string;
    code?: string;
    details?: unknown;
}
