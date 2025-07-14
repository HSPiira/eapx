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

export interface CalendarSettings {
    workingHours: {
        start: string;
        end: string;
    };
    timeZone: string;
    defaultDuration: number;
    bufferTime: number;
    workingDays: {
        monday: boolean;
        tuesday: boolean;
        wednesday: boolean;
        thursday: boolean;
        friday: boolean;
        saturday: boolean;
        sunday: boolean;
    };
    autoConfirm: boolean;
} 