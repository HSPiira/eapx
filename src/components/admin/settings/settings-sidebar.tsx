'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {icons, settingsSections } from '@/config';

export default function SettingsSidebarNav(){
    const router = useRouter();
    const pathname = usePathname();

    return (
        <aside className="hidden lg:flex flex-col w-56 h-screen bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 shadow-sm fixed left-0 top-0 z-30">
            <div className="flex flex-col gap-2 p-4">
                {/* Back link */}
                <div
                    className="flex items-center gap-2 mb-4 cursor-pointer select-none text-gray-700 dark:text-gray-200"
                    onClick={() => router.push('/dashboard')}
                >
                    {React.createElement(icons.ArrowLeftCircle, { className: 'w-5 h-5' })}
                    <span className="font-medium">Back</span>
                </div>
                {settingsSections.map((section, idx) => (
                    <div key={idx} className="mb-2">
                        {section.title && (
                            <div className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 mb-1 mt-2">
                                {section.title}
                            </div>
                        )}
                        <nav className="flex flex-col gap-1">
                            {section.items.map((item) => {
                                const Icon = icons[item.icon] ?? icons.UserCog;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-200 ${isActive ? 'bg-gray-100 dark:bg-gray-900 font-semibold' : ''}`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                ))}
            </div>
        </aside>
    );
};
