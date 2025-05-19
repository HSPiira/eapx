'use client'

import React from "react";
import { useRouter } from "next/navigation";
import { Settings } from "lucide-react";
import UserProfile from '@/components/admin/user/user-profile';

interface HeaderProps {
    logo?: React.ReactNode;
    user?: {
        avatar: string
        name: string
    };
}

export function Header(props: HeaderProps) {
    const router = useRouter();

    return (
        <header className="flex items-center justify-between px-4 h-14 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 shadow-sm fixed top-0 left-0 right-0 z-30 md:hidden">
            <div className="flex items-center gap-2">
                {props.logo || <span className="font-bold text-lg">careAxis</span>}
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={() => router.push('/settings')}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 focus:outline-none"
                    aria-label="Settings"
                    title="Settings"
                >
                    <Settings className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                </button>

                <UserProfile />

            </div>
        </header>
    );
}