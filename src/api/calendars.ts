import { CreateCalendarInput, CalendarEvent, UpdateCalendarInput } from "@/schema/calendar";
import { CalendarsResponse } from "@/types/calendars";

export async function fetchCalendars(): Promise<CalendarsResponse> {
    const res = await fetch('/api/ms-calendar');
    if (!res.ok) {
        throw new Error('Failed to fetch calendars');
    }
    return res.json();
}

export async function createCalendar(data: CreateCalendarInput): Promise<CalendarEvent> {
    const res = await fetch('/api/ms-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create calendar');
    }
    const result = await res.json();
    return result as CalendarEvent;
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
