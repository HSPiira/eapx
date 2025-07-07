import { NotificationSettings } from "@/types/notifications";

export async function fetchNotificationSettings(): Promise<NotificationSettings> {
    // This is a mock implementation. Replace with actual API call.
    return {
        emailNotifications: {
            newAppointments: true,
            appointmentReminders: true,
            appointmentChanges: true,
            appointmentCancellations: true,
        },
        pushNotifications: {
            newAppointments: true,
            appointmentReminders: true,
            appointmentChanges: true,
            appointmentCancellations: true,
        },
        reminderTiming: {
            email: 24,
            push: 2,
        },
        quietHours: {
            enabled: false,
            start: '22:00',
            end: '08:00',
        },
    };
}

export async function updateNotificationSettings(data: Partial<NotificationSettings>): Promise<NotificationSettings> {
    // This is a mock implementation. Replace with actual API call.
    console.log('Updating notification settings:', data);
    return { ...data } as NotificationSettings;
}
