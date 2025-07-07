
import { fetchCalendarSettings, updateCalendarSettings } from "@/api/calendars";
import { useGenericQuery, useGenericMutation } from "../generic-create";
import { CalendarSettings } from "@/types/calendar";

export function useCalendarSettings() {
    return useGenericQuery<CalendarSettings>(['calendarSettings'], fetchCalendarSettings);
}

export function useUpdateCalendarSettings() {
    return useGenericMutation<CalendarSettings, Partial<CalendarSettings>>(
        ['update-calendar-settings'],
        (data) => updateCalendarSettings(data)
    );
}
