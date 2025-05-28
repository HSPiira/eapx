'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
    { label: 'Providers', href: '/services/providers' },
    { label: 'Staff', href: '/services/providers/staff' },
    { label: 'Onboarding', href: '/services/providers/onboarding' },
];

export default function ProvidersLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div>
            <div className="flex border-b mb-4">
                {tabs.map(tab => (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`px-4 py-2 -mb-px border-b-2 transition-colors duration-150 ${pathname === tab.href ? 'border-blue-600 font-medium text-blue-700' : 'border-transparent text-gray-600 hover:text-blue-600'}`}
                    >
                        {tab.label}
                    </Link>
                ))}
            </div>
            <div>{children}</div>
        </div>
    );
} 