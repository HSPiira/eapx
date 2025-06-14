import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/middleware/auth';

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.access_token) {
        return NextResponse.json({ error: 'No access token found. Please sign in again.' }, { status: 401 });
    }
    let body;
    try {
        body = await req.json();
    } catch (e) {
        return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    const {
        subject,
        body: eventBody = '',
        startDateTime,
        endDateTime,
        location = '',
        attendees = [],
        joinUrl = '',
    } = body;
    if (!subject || !startDateTime || !endDateTime) {
        return NextResponse.json({ error: 'Missing required fields: subject, startDateTime, endDateTime' }, { status: 400 });
    }
    const calendarEventBody = {
        subject,
        body: {
            contentType: 'HTML',
            content: `${eventBody}${joinUrl ? `<br><br>Teams Meeting Link: ${joinUrl}` : ''}`
        },
        start: {
            dateTime: startDateTime,
            timeZone: 'UTC'
        },
        end: {
            dateTime: endDateTime,
            timeZone: 'UTC'
        },
        location: {
            displayName: location || 'Teams Meeting'
        },
        attendees: attendees.map((email: string) => ({
            emailAddress: {
                address: email,
                name: email.split('@')[0]
            },
            type: 'required'
        })),
        isOnlineMeeting: !!joinUrl,
        onlineMeetingProvider: joinUrl ? 'teamsForBusiness' : undefined,
        onlineMeeting: joinUrl ? { joinUrl } : undefined,
        responseRequested: true,
        showAs: 'busy'
    };
    const calendarResponse = await fetch('https://graph.microsoft.com/v1.0/me/events', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${session.user.access_token}`,
            'Content-Type': 'application/json',
            'Prefer': 'outlook.timezone="UTC"'
        },
        body: JSON.stringify(calendarEventBody)
    });
    const calendarData = await calendarResponse.json();
    if (!calendarResponse.ok) {
        return NextResponse.json({ error: calendarData.error?.message || 'Failed to create calendar event', details: calendarData.error }, { status: calendarResponse.status });
    }
    return NextResponse.json(calendarData);
}
