'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import Image from "next/image";

type Profile = {
    id: string;
    fullName: string;
    image?: string;
};

const fetchProfile = async (): Promise<Profile> => {
    const res = await fetch('/api/auth/profile');
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
};

const UserProfile: React.FC = () => {
    const { data: session } = useSession();

    const { data: profile } = useQuery({
        queryKey: ['profile'],
        queryFn: fetchProfile,
        enabled: !!session?.user?.id,
        staleTime: 1000 * 60 * 5, // cache for 5 mins
    });

    if (!session?.user) return null;

    const displayImage = profile?.image || session.user.image;
    const displayName = profile?.fullName || session.user.name || 'Unknown';

    return (
        <div className="flex items-center gap-2 px-2 py-2 md:justify-center md:px-0 md:py-2 lg:justify-start lg:px-4">
            {displayImage ? (
                <Image
                    src={displayImage}
                    alt={displayName || ''}
                    className="w-8 h-8 rounded-full object-cover"
                    width={48}
                    height={48}
                />
            ) : (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    {displayName?.charAt(0).toUpperCase() || '?'}
                </div>
            )}
            <span className="font-medium text-gray-900 dark:text-white text-sm truncate md:hidden lg:flex">
                {displayName || 'Unknown'}
            </span>
        </div>
    );
};
export default UserProfile;
