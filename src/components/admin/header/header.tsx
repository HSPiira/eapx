'use client'

import React from "react";
import {useRouter} from "next/navigation";
import Image from "next/image";
import {Settings} from "lucide-react";

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

                {props.user && (
                    <Image
                        src={props.user.avatar || '/placeholder-avatar.png'}
                        alt={props.user.name || 'User avatar'}
                        className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-700 object-cover"
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/placeholder-avatar.png';
                        }}
                    />
                )}
            </div>
        </header>
    );
}