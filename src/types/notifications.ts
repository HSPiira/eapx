export interface NotificationSettings {
    emailNotifications: {
        newAppointments: boolean;
        appointmentReminders: boolean;
        appointmentChanges: boolean;
        appointmentCancellations: boolean;
    };
    pushNotifications: {
        newAppointments: boolean;
        appointmentReminders: boolean;
        appointmentChanges: boolean;
        appointmentCancellations: boolean;
    };
    reminderTiming: {
        email: number; // hours before appointment
        push: number; // hours before appointment
    };
    quietHours: {
        enabled: boolean;
        start: string;
        end: string;
    };
} 