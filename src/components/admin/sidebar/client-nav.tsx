'use client';

import React from 'react';
import { SidebarNav, SidebarNavItem, SidebarFooter, BottomNav, BottomNavItem, UserProfile } from '@/components/admin';
import { usePathname } from 'next/navigation';
import { IconKey, adminNavItems } from '@/config';

export default function ClientNav() {
    const pathname = usePathname();

    const allNavItems = adminNavItems;
    // We will show up to 4 items in the bottom nav on small screens.
    // The last slot will be reserved for the 'More' button if there are extra items.
    const maxVisible = 4;
    const visibleNavItems = allNavItems.slice(0, maxVisible - 1);
    const extraNavItems = allNavItems.slice(maxVisible - 1);
    const isMoreActive = pathname === '/more' || extraNavItems.some(item => pathname.startsWith(item.to));

    const isItemActive = (itemPath: string) => {
        // Special handling for the root sessions path, which should match /sessions/*
        if (itemPath === '/sessions') {
            return pathname.startsWith('/sessions/');
        }
        // For other items, check for exact match for dashboard, or startsWith for others
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
                    {/* Filter out the Settings item for the main sidebar */}
                    {adminNavItems.filter(item => item.label !== 'Settings').map((item) => (
                        <SidebarNavItem
                            key={item.label}
                            icon={item.icon}
                            label={item.label}
                            // Adjust the 'to' path for the sessions link in the main sidebar
                            to={item.to === '/sessions' ? '/sessions/upcoming' : item.to}
                            active={isItemActive(item.to)}
                        />
                    ))}
                </SidebarNav>
                <SidebarFooter>
                    {/* Add the Settings item to the sidebar footer */}
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
                        // Adjust the 'to' path for the sessions link in the bottom nav
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
