import { CalendarEvent, UpdateCalendarInput } from "@/schema/calendar";
import { CalendarsResponse, CalendarSettings } from "@/types/calendars";

export async function fetchCalendars(): Promise<CalendarsResponse> {
    const res = await fetch('/api/ms-calendar');
    if (!res.ok) {
        throw new Error('Failed to fetch calendars');
    }
    return res.json();
}

import { CalendarEventData } from "@/hooks/calendar/useCalendar";

export async function createCalendar(data: CalendarEventData) {
    const response = await fetch('/api/ms-calendar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create calendar event');
    }
    return response.json();
}

export async function fetchCalendarSettings(): Promise<CalendarSettings> {
    // This is a mock implementation. Replace with actual API call.
    return {
        workingHours: {
            start: '09:00',
            end: '17:00',
        },
        timeZone: 'America/New_York',
        defaultDuration: 30,
        bufferTime: 15,
        workingDays: {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: false,
            sunday: false,
        },
        autoConfirm: false,
    };
}

export async function updateCalendarSettings(data: Partial<CalendarSettings>): Promise<CalendarSettings> {
    // This is a mock implementation. Replace with actual API call.
    console.log('Updating calendar settings:', data);
    return { ...data } as CalendarSettings;
}

export async function updateCalendar(data: UpdateCalendarInput): Promise<CalendarEvent> {
    const { id, ...rest } = data;
    const res = await fetch(`/api/ms-calendar/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rest),
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update calendar');
    }
    return res.json();
}

export async function deleteCalendar(id: string): Promise<unknown> {
    const res = await fetch(`/api/ms-calendar/${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete calendar');
    }
    return res.json();
}
