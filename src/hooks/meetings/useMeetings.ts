import { useMutation } from '@tanstack/react-query';
import { createMeeting } from '@/api/meetings';
import { MeetingPlatform } from '@/schema/meeting';
import { Meeting } from '@/schema/meeting';

export interface CreateMeetingData {
    subject: string;
    startDateTime: string;
    endDateTime: string;
    attendees: string[];
    platform: MeetingPlatform;
    body: string;
}

export function useMeetings() {
    const createMeetingMutation = useMutation<Meeting, Error, CreateMeetingData>({
        mutationFn: async (meetingData) => {
            return createMeeting({
                subject: meetingData.subject,
                startDateTime: meetingData.startDateTime,
                endDateTime: meetingData.endDateTime,
                attendees: meetingData.attendees,
                platform: meetingData.platform,
                body: meetingData.body,
            });
        },
    });

    return {
        createMeeting: createMeetingMutation,
        isCreating: createMeetingMutation.isPending,
        error: createMeetingMutation.error,
    };
} 