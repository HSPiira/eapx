'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import Image from "next/image";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Settings, User, LogOut } from 'lucide-react';
import Link from 'next/link';

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
    const userEmail = session.user.email || '';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 px-2 py-2 md:justify-center md:px-0 md:py-2 lg:justify-start lg:px-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
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
                    <span className="font-medium text-gray-900 dark:text-white text-sm truncate hidden md:hidden lg:flex">
                        {displayName || 'Unknown'}
                    </span>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end">
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {userEmail}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/settings/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Your profile</span>
                    </Link>
                </DropdownMenuItem>
                {/* Add more profile-related links as needed */}

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => signOut()} className="flex items-center text-red-500 dark:text-red-400">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
export default UserProfile;
