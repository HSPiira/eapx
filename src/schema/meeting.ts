import { z } from 'zod';

export const MeetingSettingsSchema = z.object({
    hostVideo: z.boolean().optional(),
    participantVideo: z.boolean().optional(),
    joinBeforeHost: z.boolean().optional(),
    muteUponEntry: z.boolean().optional(),
    waitingRoom: z.boolean().optional(),
    meetingAuthentication: z.boolean().optional(),
    authenticationOption: z.string().optional(),
    password: z.string().optional(),
    allowMeetingChat: z.enum(['enabled', 'disabled']).optional(),
    allowAttendeeToEnableCamera: z.boolean().optional(),
    allowAttendeeToEnableMic: z.boolean().optional(),
    allowParticipantsToChangeName: z.boolean().optional(),
    allowTeamworkReactions: z.boolean().optional(),
});

export const MeetingParticipantSchema = z.object({
    email: z.string().email(),
    role: z.enum(['host', 'attendee']).default('attendee'),
});

export const MeetingPlatformSchema = z.enum(['zoom', 'teams', 'google']);
export type MeetingPlatform = z.infer<typeof MeetingPlatformSchema>;

export const CreateMeetingInputSchema = z.object({
    subject: z.string(),
    startDateTime: z.string(),
    endDateTime: z.string(),
    timezone: z.string().optional(),
    agenda: z.string().optional(),
    body: z.string().optional(),
    attendees: z.array(z.string().email()).optional(),
    location: z.string().optional(),
    platform: MeetingPlatformSchema,
    settings: MeetingSettingsSchema.optional(),
});

export type CreateMeetingInput = z.infer<typeof CreateMeetingInputSchema>;

export const UpdateMeetingInputSchema = CreateMeetingInputSchema.extend({
    id: z.string(),
});

export type UpdateMeetingInput = z.infer<typeof UpdateMeetingInputSchema>;

export const MeetingSchema = z.object({
    id: z.string(),
    subject: z.string(),
    startDateTime: z.string(),
    endDateTime: z.string(),
    timezone: z.string().optional(),
    agenda: z.string().optional(),
    location: z.string().optional(),
    platform: MeetingPlatformSchema,
    joinUrl: z.string(),
    hostEmail: z.string().email(),
    attendees: z.array(MeetingParticipantSchema),
    settings: MeetingSettingsSchema.optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type Meeting = z.infer<typeof MeetingSchema>; 