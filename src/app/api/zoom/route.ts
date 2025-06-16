import { NextResponse } from 'next/server';
import { z } from 'zod';

// Zoom API types
interface ZoomMeeting {
    topic: string;
    type: number;
    start_time?: string;
    duration?: number;
    timezone?: string;
    agenda?: string;
    host_email?: string;
    settings?: {
        host_video?: boolean;
        participant_video?: boolean;
        join_before_host?: boolean;
        mute_upon_entry?: boolean;
        waiting_room?: boolean;
        meeting_authentication?: boolean;
        authentication_option?: string;
    };
}

// Request validation schema
const createMeetingSchema = z.object({
    topic: z.string().min(1),
    startTime: z.string().optional(),
    duration: z.number().min(1).optional(),
    timezone: z.string().optional(),
    agenda: z.string().optional(),
    hostName: z.string().optional(),
    attendees: z.array(z.string().email()).optional(),
    settings: z.object({
        hostVideo: z.boolean().optional(),
        participantVideo: z.boolean().optional(),
        joinBeforeHost: z.boolean().optional(),
        muteUponEntry: z.boolean().optional(),
        waitingRoom: z.boolean().optional(),
        meetingAuthentication: z.boolean().optional(),
        authenticationOption: z.string().optional(),
    }).optional(),
});

// Zoom API error response type
interface ZoomErrorResponse {
    code: number;
    message: string;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validatedData = createMeetingSchema.parse(body);

        // Get Zoom credentials from environment variables
        const zoomClientId = process.env.ZOOM_CLIENT_ID;
        const zoomClientSecret = process.env.ZOOM_CLIENT_SECRET;
        const zoomAccountId = process.env.ZOOM_ACCOUNT_ID;

        if (!zoomClientId || !zoomClientSecret || !zoomAccountId) {
            console.error('Missing Zoom credentials:', {
                hasClientId: !!zoomClientId,
                hasClientSecret: !!zoomClientSecret,
                hasAccountId: !!zoomAccountId
            });
            return NextResponse.json(
                {
                    error: 'Zoom API credentials not configured',
                    code: 'ZOOM_CREDENTIALS_MISSING'
                },
                { status: 500 }
            );
        }

        // Get OAuth token
        let token;
        try {
            token = await getZoomOAuthToken(zoomClientId, zoomClientSecret, zoomAccountId);
        } catch (error) {
            console.error('Failed to get Zoom OAuth token:', error);
            return NextResponse.json(
                {
                    error: 'Failed to authenticate with Zoom',
                    code: 'ZOOM_AUTH_FAILED',
                    message: error instanceof Error ? error.message : 'Unknown error',
                    details: 'Please ensure your Zoom App has the required scopes: meeting:write:meeting, meeting:write:meeting:admin'
                },
                { status: 401 }
            );
        }

        // Prepare meeting data for Zoom API
        const meetingData: ZoomMeeting = {
            topic: validatedData.topic,
            type: 2, // Scheduled meeting
            start_time: validatedData.startTime,
            duration: validatedData.duration,
            timezone: validatedData.timezone,
            agenda: validatedData.agenda,
            host_email: validatedData.hostName,
            settings: validatedData.settings ? {
                host_video: validatedData.settings.hostVideo,
                participant_video: validatedData.settings.participantVideo,
                join_before_host: validatedData.settings.joinBeforeHost,
                mute_upon_entry: validatedData.settings.muteUponEntry,
                waiting_room: validatedData.settings.waitingRoom,
                meeting_authentication: validatedData.settings.meetingAuthentication,
                authentication_option: validatedData.settings.authenticationOption,
            } : undefined,
        };

        // Make request to Zoom API
        const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(meetingData),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Zoom API error:', data);
            const error = data as ZoomErrorResponse;

            // Handle specific Zoom API errors
            if (error.code === 4711) {
                return NextResponse.json(
                    {
                        error: 'Zoom API configuration error',
                        code: error.code,
                        message: 'Missing required scopes in Zoom App configuration',
                        details: 'Please add the following scopes to your Zoom App: meeting:write:meeting, meeting:write:meeting:admin'
                    },
                    { status: 400 }
                );
            }

            return NextResponse.json(
                {
                    error: 'Failed to create Zoom meeting',
                    code: error.code || 'ZOOM_API_ERROR',
                    message: error.message || 'Unknown error from Zoom API'
                },
                { status: response.status }
            );
        }

        // If attendees are provided, add them to the meeting
        if (validatedData.attendees && validatedData.attendees.length > 0) {
            try {
                const addAttendeesResponse = await fetch(`https://api.zoom.us/v2/meetings/${data.id}/registrants`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        registrants: validatedData.attendees.map(email => ({
                            email,
                            first_name: email.split('@')[0],
                            last_name: ''
                        }))
                    }),
                });

                if (!addAttendeesResponse.ok) {
                    console.error('Failed to add attendees:', await addAttendeesResponse.json());
                }
            } catch (error) {
                console.error('Error adding attendees:', error);
            }
        }

        return NextResponse.json(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: 'Invalid request data',
                    code: 'VALIDATION_ERROR',
                    details: error.errors
                },
                { status: 400 }
            );
        }

        console.error('Error creating Zoom meeting:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                code: 'INTERNAL_ERROR',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// Helper function to get OAuth token
async function getZoomOAuthToken(
    clientId: string,
    clientSecret: string,
    accountId: string
): Promise<string> {
    const tokenEndpoint = 'https://zoom.us/oauth/token';
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    try {
        const response = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'account_credentials',
                account_id: accountId,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Zoom OAuth error:', data);
            throw new Error(data.message || 'Failed to get Zoom OAuth token');
        }

        return data.access_token;
    } catch (error) {
        console.error('Error in getZoomOAuthToken:', error);
        throw error;
    }
}
