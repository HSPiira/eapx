export const settingsSections = [
    {
        title: 'Account',
        items: [
            { label: 'Profile', icon: 'FiUser', href: '/admin/settings/profile' },
            { label: 'General', icon: 'FiSettings', href: '/admin/settings/general' },
            { label: 'Calendars', icon: 'FiCalendar', href: '/admin/settings/calendars' },
            { label: 'Appearance', icon: 'FiEye', href: '/admin/settings/appearance' },
            { label: 'Out of office', icon: 'FiCalendar', href: '/admin/settings/out-of-office' },
            { label: 'Push Notifications', icon: 'FiBell', href: '/admin/settings/push-notifications' },
        ],
    },
    {
        title: 'Security',
        items: [
            { label: 'Password', icon: 'FiKey', href: '/admin/settings/password' },
            { label: 'Impersonation', icon: 'FiLock', href: '/admin/settings/impersonation' },
            { label: 'Industries', icon: 'FiBriefcase', href: '/admin/settings/industries' },
        ],
    },
    {
        title: 'Billing',
        items: [
            { label: 'Manage billing', icon: 'FiCreditCard', href: '/admin/settings/billing' },
        ],
    },
    {
        title: 'Developer',
        items: [
            { label: 'Webhooks', icon: 'FiCode', href: '/admin/settings/webhooks' },
            { label: 'API keys', icon: 'FiKey', href: '/admin/settings/api-keys' },
        ],
    },
    {
        title: 'Teams',
        items: [
            { label: 'Add a team', icon: 'FiPlus', href: '/admin/settings/teams' },
        ],
    },
];