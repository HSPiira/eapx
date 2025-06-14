import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/middleware/auth';

interface TeamsMeetingBody {
    subject: string;
    startDateTime: string;
    endDateTime: string;
    participants: {
        attendees: Array<{
            upn: string;
            role: string;
        }>;
    };
    body?: {
        contentType: string;
        content: string;
    };
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.access_token) {
            return NextResponse.json(
                { error: 'No access token found. Please sign in again.' },
                { status: 401 }
            );
        }

        // Get the raw request body as text first
        const rawBody = await req.text();
        console.log('Raw request body:', rawBody);

        if (!rawBody) {
            return NextResponse.json(
                { error: 'Request body is empty' },
                { status: 400 }
            );
        }

        // Parse the JSON body
        let body;
        try {
            body = JSON.parse(rawBody);
        } catch (e) {
            console.error('Failed to parse request body:', e);
            return NextResponse.json(
                { error: 'Invalid JSON in request body' },
                { status: 400 }
            );
        }

        console.log('Parsed request body:', body);

        const {
            accessToken,
            subject,
            startDateTime,
            endDateTime,
            attendees = [],
            body: meetingBody = '',
            location = '',
            reminderMinutes = 15
        } = body;

        // Validate required fields
        if (!subject || !startDateTime || !endDateTime) {
            return NextResponse.json(
                { error: 'Missing required fields: subject, startDateTime, and endDateTime are required' },
                { status: 400 }
            );
        }

        // Create Teams meeting with minimal required fields
        const teamsMeetingBody = {
            startDateTime,
            endDateTime,
            subject,
            participants: {
                attendees: attendees.map((email: string) => ({
                    upn: email,
                    role: 'attendee'
                }))
            }
        };

        const requestBody = JSON.stringify(teamsMeetingBody);
        console.log('Creating Teams meeting with body:', requestBody);

        const teamsResponse = await fetch('https://graph.microsoft.com/v1.0/me/onlineMeetings', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: requestBody
        });

        if (!teamsResponse.ok) {
            const teamsData = await teamsResponse.json();
            console.error('Teams meeting creation failed:', {
                status: teamsResponse.status,
                statusText: teamsResponse.statusText,
                headers: Object.fromEntries(teamsResponse.headers.entries()),
                body: teamsData,
                innerError: teamsData.error?.innerError,
                requestBody: requestBody
            });
            return NextResponse.json(
                {
                    error: teamsData.error?.message || 'Failed to create Teams meeting',
                    details: teamsData.error?.innerError || teamsData.error
                },
                { status: teamsResponse.status }
            );
        }

        const teamsData = await teamsResponse.json();
        console.log('Teams API Response:', teamsData);
        return NextResponse.json(teamsData);
    } catch (error) {
        console.error('Error in Teams meeting creation:', error);
        return NextResponse.json(
            { error: (error as Error).message || 'Internal server error' },
            { status: 500 }
        );
    }
}