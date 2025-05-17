"use client";
import React, { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { SettingsSidebarNav, ClientNav } from '@/components/admin';

interface AppSidebarProps {
    user: { avatar: string; name: string };
}

const AppSidebar: React.FC<AppSidebarProps> = ({ user }) => {
    const pathname = usePathname();
    const isSettings = useMemo(() => pathname.startsWith('/settings'), [pathname]);

    if (!user) return null;

    return isSettings ? <SettingsSidebarNav /> : <ClientNav />;
};
export default AppSidebar;