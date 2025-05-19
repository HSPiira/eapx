import { IconKey } from './icon-map';

export const adminNavItems: { icon: IconKey; label: string; to: string; }[] = [
    { icon: 'Home', label: 'Home', to: '/dashboard' },
    { icon: 'Calendar', label: 'Sessions', to: '/sessions' },
    { icon: 'Users', label: 'Clients', to: '/clients' },
    { icon: 'Briefcase', label: 'Services', to: '/services' },
    { icon: 'BarChart', label: 'Insights', to: '/insights' },
    { icon: 'Settings', label: 'Settings', to: '/settings' },
]; 