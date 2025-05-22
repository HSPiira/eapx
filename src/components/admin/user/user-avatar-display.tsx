'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface UserAvatarDisplayProps {
    imageUrl?: string | null;
    name?: string | null;
    size?: number; // e.g., 32 for small, 48 for medium, 64 for large
    className?: string;
}

const UserAvatarDisplay: React.FC<UserAvatarDisplayProps> = ({ imageUrl, name, size = 32, className }) => {
    const initial = name?.charAt(0).toUpperCase() || '?';
    return (
        <div className={cn(
            "rounded-full object-cover flex items-center justify-center text-primary-foreground",
            `w-${size / 4} h-${size / 4}`,
            !imageUrl && "bg-primary", // Background for fallback
            className
        )}>
            {imageUrl ? (
                <Image
                    src={imageUrl}
                    alt={name || ''}
                    className="rounded-full object-cover w-full h-full"
                    width={size}
                    height={size}
                />
            ) : (
                <span className="text-lg font-semibold">{initial}</span>
            )}
        </div>
    );
};

export default UserAvatarDisplay; 