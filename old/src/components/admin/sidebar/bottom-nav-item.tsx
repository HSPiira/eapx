"use client";
import React from 'react';
import * as Icons from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { IconKey } from '@/config';

interface BottomNavItemProps {
    icon: IconKey;
    label: string;
    to: string;
    active?: boolean;
}

const BottomNavItem: React.FC<BottomNavItemProps> = ({ icon, label, to, active }) => {
    const Icon = Icons[icon] || Icons.HomeIcon;

    const baseClasses = "group flex flex-col items-center justify-center rounded-md px-2 py-[7px] text-base transition-colors";
    const activeClasses = "text-blue-600 dark:text-blue-400 font-semibold";
    const inactiveClasses = "text-gray-500 dark:text-gray-400";

    const iconBaseClasses = "w-5 h-5 mb-1";
    const iconActiveClasses = "text-blue-600 dark:text-blue-400";
    const iconInactiveClasses = "text-gray-400 dark:text-gray-500";

    return (
        <Link
            href={to}
            className={cn(
                baseClasses,
                active ? activeClasses : inactiveClasses
            )}
        >
            <Icon
                className={cn(
                    iconBaseClasses,
                    active ? iconActiveClasses : iconInactiveClasses
                )}
            />
            <span>{label}</span>
        </Link>
    );
};
export default BottomNavItem;