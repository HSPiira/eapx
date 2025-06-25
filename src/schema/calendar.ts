import { z } from 'zod';

export const CalendarEventBodySchema = z.object({
    contentType: z.literal('HTML'),
    content: z.string()
});

export const CalendarDateTimeSchema = z.object({
    dateTime: z.string(),
    timeZone: z.string()
});

export const CalendarAttendeeSchema = z.object({
    emailAddress: z.object({
        address: z.string().email(),
        name: z.string()
    }),
    type: z.literal('required')
});

export const CalendarEventSchema = z.object({
    subject: z.string(),
    body: CalendarEventBodySchema,
    start: CalendarDateTimeSchema,
    end: CalendarDateTimeSchema,
    location: z.object({
        displayName: z.string()
    }),
    attendees: z.array(CalendarAttendeeSchema),
    isOnlineMeeting: z.boolean(),
    onlineMeetingProvider: z.enum(['teamsForBusiness', 'zoom']).optional(),
    onlineMeeting: z.object({
        joinUrl: z.string()
    }).optional(),
    responseRequested: z.boolean(),
    showAs: z.literal('busy')
});

export type CalendarEvent = z.infer<typeof CalendarEventSchema>;

export const CreateCalendarInputSchema = z.object({
    subject: z.string(),
    body: z.string().optional(),
    startDateTime: z.string(),
    endDateTime: z.string(),
    location: z.string().optional(),
    attendees: z.array(z.string().email()).optional(),
    joinUrl: z.string().optional(),
    isOnlineMeeting: z.boolean().optional(),
    onlineMeetingProvider: z.enum(['teamsForBusiness', 'zoom']).optional()
});

export type CreateCalendarInput = z.infer<typeof CreateCalendarInputSchema>;

export const UpdateCalendarInputSchema = CreateCalendarInputSchema.extend({
    id: z.string()
});

export type UpdateCalendarInput = z.infer<typeof UpdateCalendarInputSchema>; 