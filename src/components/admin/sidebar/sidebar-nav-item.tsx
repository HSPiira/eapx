"use client";
import React from 'react';
import * as Icons from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { IconKey } from '@/config';

interface SidebarNavItemProps {
    icon: IconKey;
    label: string;
    to: string;
    active?: boolean;
}

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({ icon, label, to, active }) => {
    const Icon = Icons[icon] || Icons.HomeIcon;

    const baseClasses =
        "group flex items-center md:items-center md:justify-center lg:justify-start lg:gap-2 lg:w-full lg:flex lg:flex-row lg:items-center rounded-md px-1.5 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:text-black dark:hover:text-white transition-colors";

    const activeClasses =
        "bg-white dark:bg-gray-800 text-black dark:text-white font-semibold";

    return (
        <div className="relative flex justify-center md:justify-center lg:justify-start">
            <Link
                href={to}
                className={cn(baseClasses, active && activeClasses)}
            >
                <Icon className="w-4 h-4" />
                <span className="hidden lg:inline text-sm">{label}</span>
            </Link>

            {/* Tooltip for medium screens */}
            <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 whitespace-nowrap rounded bg-black dark:bg-white text-white dark:text-black text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-50 md:block lg:hidden">
                {label}
            </span>
        </div>
    );
};
export default SidebarNavItem;