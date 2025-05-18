// config/settings.ts
import type { IconName } from './icons';

export interface SettingsSectionItem {
    label: string;
    icon: IconName;
    href: string;
}

export interface SettingsSection {
    title: string;
    items: SettingsSectionItem[];
}

export const settingsSections: SettingsSection[] = [
    {
        title: 'Account',
        items: [
            { label: 'Profile', icon: 'User', href: '/settings/profile' },
            { label: 'General', icon: 'Settings', href: '/settings/general' },
            { label: 'Calendars', icon: 'Calendar', href: '/settings/calendars' },
            { label: 'Appearance', icon: 'Eye', href: '/settings/appearance' },
            { label: 'Notifications', icon: 'Bell', href: '/settings/notifications' },
        ],
    },
    {
        title: 'Security',
        items: [
            { label: 'Password', icon: 'Key', href: '/settings/password' },
            { label: 'Impersonation', icon: 'Lock', href: '/settings/impersonation' },
            { label: 'Industries', icon: 'Briefcase', href: '/settings/industries' },
        ],
    },
    {
        title: 'Billing',
        items: [
            { label: 'Manage billing', icon: 'CreditCard', href: '/settings/billing' },
        ],
    },
    {
        title: 'Developer',
        items: [
            { label: 'Webhooks', icon: 'Code', href: '/settings/webhooks' },
            { label: 'API keys', icon: 'Key', href: '/settings/api-keys' },
        ],
    },
    {
        title: 'Teams',
        items: [
            { label: 'Add a team', icon: 'Plus', href: '/settings/teams' },
        ],
    },
];
