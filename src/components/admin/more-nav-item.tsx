'use client';

import React from 'react';
import Link from 'next/link';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';
import { IconKey } from '@/config';

interface MoreNavItemProps {
    icon: IconKey;
    label: string;
    to: string;
}

const MoreNavItem: React.FC<MoreNavItemProps> = ({ icon, label, to }) => {
    const Icon = Icons[icon] || Icons.HomeIcon; // Default to HomeIcon if icon not found

    return (
        <Link
            href={to}
            className={cn(
                "flex items-center justify-between w-full p-4 border-b border-gray-200 dark:border-gray-800",
                "hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            )}
        >
            <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-base font-medium text-gray-800 dark:text-gray-200">{label}</span>
            </div>
            <Icons.ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </Link>
    );
};

export default MoreNavItem; 