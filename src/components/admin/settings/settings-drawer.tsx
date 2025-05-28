'use client';
import React, { useRef } from 'react';
import Link from 'next/link';
import * as Icons from 'lucide-react';
import { useDrawerFocusTrap } from '@/hooks';
import { settingsSections } from '@/config';
import { ArrowLeft, UserIcon, X } from "lucide-react";
import { useRouter } from 'next/navigation';

interface DrawerProps {
    open: boolean;
    onClose: () => void;
}

export default function Drawer({ open, onClose }: DrawerProps) {
    const drawerRef = useRef<HTMLElement>(null!);
    useDrawerFocusTrap(open, onClose, drawerRef);
    const router = useRouter();

    return (
        <aside
            ref={drawerRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            className={`absolute left-0 top-0 h-full w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 shadow-lg transform transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'
                }`}
        >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/dashboard')}
                        aria-label="Back"
                        className="p-2"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </button>
                    <span className="font-bold text-lg">Settings</span>
                </div>
                <button onClick={onClose} aria-label="Close" className="p-2">
                    <X className="w-5 h-5 text-gray-500" />
                </button>
            </div>
            <div className="flex flex-col gap-2 p-4 overflow-y-auto h-full">
                {settingsSections.map((section, idx) => (
                    <div key={idx} className="mb-2">
                        {section.title && (
                            <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-1 mt-2">
                                {section.title}
                            </div>
                        )}
                        <nav className="flex flex-col gap-1">
                            {section.items.map((item) => {
                                const Icon = Icons[item.icon] || UserIcon;
                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className="flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-200"
                                        onClick={onClose}
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
}
