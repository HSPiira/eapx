import { useMutation } from '@tanstack/react-query';
import { createCalendar } from '@/api/calendars';
import { CalendarEvent } from '@/schema/calendar';

export interface CalendarEventData {
    subject: string;
    startDateTime: string;
    endDateTime: string;
    body: string;
    location: string;
    isOnlineMeeting: boolean;
    onlineMeetingUrl?: string;
    onlineMeetingProvider?: 'teamsForBusiness' | 'zoom';
    attendees?: string[];
}

interface CreateCalendarEventResponse {
    id: string;
    webLink: string;
}

export function useCalendar() {
    const createEvent = useMutation<CalendarEvent, Error, CalendarEventData>({
        mutationFn: async (eventData) => {
            return createCalendar({
                subject: eventData.subject,
                startDateTime: eventData.startDateTime,
                endDateTime: eventData.endDateTime,
                body: eventData.body,
                location: eventData.location,
                joinUrl: eventData.onlineMeetingUrl,
                attendees: eventData.attendees,
                isOnlineMeeting: eventData.isOnlineMeeting,
                onlineMeetingProvider: eventData.onlineMeetingProvider,
            });
        },
    });

    return {
        createEvent,
        isCreating: createEvent.isPending,
        error: createEvent.error,
    };
} 