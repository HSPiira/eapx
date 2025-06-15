import { CalendarEvent } from '@/schema/calendar';

export interface CalendarsResponse {
    data: CalendarEvent[];
    total: number;
    page: number;
    limit: number;
}

export interface CalendarError {
    message: string;
    details?: unknown;
} 