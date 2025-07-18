import { IconKey } from './icon-map';

export const adminNavItems: { icon: IconKey; label: string; to: string; }[] = [
    { icon: 'Home', label: 'Home', to: '/dashboard' },
    { icon: 'Calendar', label: 'Calendar', to: '/calendar' },
    { icon: 'Calendar', label: 'Sessions', to: '/sessions' },
    { icon: 'Users', label: 'Clients', to: '/clients' },
    { icon: 'Briefcase', label: 'Services', to: '/services' },
    { icon: 'Users', label: 'Providers', to: '/providers' },
    { icon: 'BarChart', label: 'Insights', to: '/insights' },
    { icon: 'Settings', label: 'Settings', to: '/settings' },
]; 