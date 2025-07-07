
import { fetchNotificationSettings, updateNotificationSettings } from "@/api/notifications";
import { useGenericQuery, useGenericMutation } from "../generic-create";
import { NotificationSettings } from "@/types/notification";

export function useNotificationSettings() {
    return useGenericQuery<NotificationSettings>(['notificationSettings'], fetchNotificationSettings);
}

export function useUpdateNotificationSettings() {
    return useGenericMutation<NotificationSettings, Partial<NotificationSettings>>(
        ['update-notification-settings'],
        (data) => updateNotificationSettings(data)
    );
}
