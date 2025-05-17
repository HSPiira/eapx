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
            { label: 'Profile', icon: 'User', href: '/admin/settings/profile' },
            { label: 'General', icon: 'Settings', href: '/admin/settings/general' },
            { label: 'Calendars', icon: 'Calendar', href: '/admin/settings/calendars' },
            { label: 'Appearance', icon: 'Eye', href: '/admin/settings/appearance' },
            { label: 'Out of office', icon: 'Calendar', href: '/admin/settings/out-of-office' },
            { label: 'Push Notifications', icon: 'Bell', href: '/admin/settings/push-notifications' },
        ],
    },
    {
        title: 'Security',
        items: [
            { label: 'Password', icon: 'Key', href: '/admin/settings/password' },
            { label: 'Impersonation', icon: 'Lock', href: '/admin/settings/impersonation' },
            { label: 'Industries', icon: 'Briefcase', href: '/admin/settings/industries' },
        ],
    },
    {
        title: 'Billing',
        items: [
            { label: 'Manage billing', icon: 'CreditCard', href: '/admin/settings/billing' },
        ],
    },
    {
        title: 'Developer',
        items: [
            { label: 'Webhooks', icon: 'Code', href: '/admin/settings/webhooks' },
            { label: 'API keys', icon: 'Key', href: '/admin/settings/api-keys' },
        ],
    },
    {
        title: 'Teams',
        items: [
            { label: 'Add a team', icon: 'Plus', href: '/admin/settings/teams' },
        ],
    },
];
