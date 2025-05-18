'use client';

import React from 'react';
import { SidebarNav, SidebarNavItem, SidebarFooter, BottomNav, BottomNavItem, UserProfile } from '@/components/admin';
import { usePathname } from 'next/navigation';
import { IconKey } from '@/config';

const navItems: { icon: IconKey; label: string; to: string; }[] = [
    { icon: 'Home', label: 'Home', to: '/dashboard' },
    { icon: 'Calendar', label: 'Sessions', to: '/sessions' },
    { icon: 'Users', label: 'Clients', to: '/clients' },
    { icon: 'Briefcase', label: 'Services', to: '/services' },
    { icon: 'BarChart', label: 'Insights', to: '/insights' },
];

export default function ClientNav() {
    const pathname = usePathname();

    const settingsNav: { icon: IconKey; label: string; to: string; } = {
        icon: 'Settings',
        label: 'Settings',
        to: '/settings'
    };

    const allNavItems = [...navItems, settingsNav];
    const maxVisible = 4;
    const visibleNavItems = allNavItems.slice(0, maxVisible - 1);
    const extraNavItems = allNavItems.slice(maxVisible - 1);
    const isMoreActive = pathname === '/more' || extraNavItems.some(item => pathname.startsWith(item.to));

    const isItemActive = (itemPath: string) => {
        if (itemPath === '/sessions') {
            return pathname.startsWith('/sessions/');
        }
        return itemPath === '/dashboard'
            ? pathname === itemPath
            : pathname.startsWith(itemPath);
    };

    return (
        <>
            {/* Sidebar for large screens */}
            <div className="hidden md:flex fixed left-0 top-0 flex-col w-16 lg:w-56 h-screen bg-[#f8f4fc] dark:bg-[#171717] shadow-sm z-10">
                <UserProfile />
                <SidebarNav>
                    {navItems.map((item) => (
                        <SidebarNavItem
                            key={item.label}
                            icon={item.icon}
                            label={item.label}
                            to={item.to === '/sessions' ? '/sessions/upcoming' : item.to}
                            active={isItemActive(item.to)}
                        />
                    ))}
                </SidebarNav>
                <SidebarFooter>
                    <SidebarNavItem
                        icon={'Settings'}
                        label="Settings"
                        to="/settings"
                        active={pathname.startsWith('/settings')}
                    />
                </SidebarFooter>
            </div>

            {/* Spacer */}
            <div className="hidden md:block w-16 lg:w-56 flex-shrink-0" />

            {/* Bottom navigation */}
            <BottomNav>
                {visibleNavItems.map((item) => (
                    <BottomNavItem
                        key={item.label}
                        icon={item.icon}
                        label={item.label}
                        to={item.to === '/sessions' ? '/sessions/upcoming' : item.to}
                        active={isItemActive(item.to)}
                    />
                ))}
                {extraNavItems.length > 0 && (
                    <BottomNavItem
                        icon={'MoreHorizontal' as IconKey}
                        label="More"
                        to="/more"
                        active={isMoreActive}
                    />
                )}
            </BottomNav>
        </>
    );
}
