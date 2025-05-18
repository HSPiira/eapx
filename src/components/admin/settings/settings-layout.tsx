'use client';
import React, { useState } from 'react';
import SettingsHeader from './settings-header';
import SettingsOverlay from './settings-overlay';
import SettingDrawer from './settings-drawer';
import { AppSidebar } from '@/components/admin';
// import { FloatingActionButton } from '@/components/sidebar';

const user = {
    avatar: 'https://i.pravatar.cc/100',
    name: 'Henry Ssekibo',
};

interface SettingsLayoutProps {
    children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <div className="flex flex-col md:flex-row bg-white dark:bg-black h-full">
            <SettingsHeader
                onMenuClick={() => setDrawerOpen(true)}
                isMenuOpen={drawerOpen}
            />

            {/* Drawer and Overlay container */}
            <div
                className={`fixed inset-0 z-40 lg:hidden transition-all ${drawerOpen ? 'visible' : 'invisible'}`}
                aria-hidden={!drawerOpen}
            >
                <SettingsOverlay open={drawerOpen} onClose={() => setDrawerOpen(false)} />
                <SettingDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
            </div>

            <AppSidebar user={user} />
            <main className="flex-1 w-full md:mt-16 lg:mt-0 lg:ml-64">
                <div className="max-w-4xl mx-auto px-2 sm:px-4 py-2 md:py-4">{children}</div>
            </main>
            {/*<FloatingActionButton />*/}
        </div>
    );
}
