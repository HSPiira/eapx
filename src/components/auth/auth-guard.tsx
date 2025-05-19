'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

// List of paths that should be considered public (no auth required)
const publicPaths = [
    '/',
    '/auth/login',
    '/auth/error',
    '/404',
    '/not-found',
];

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Check if the current path is public
        const isPublicPath = publicPaths.some(path =>
            pathname === path || pathname.startsWith(path + '/')
        );

        // If the path is not public and there's no session, redirect to login
        if (!isPublicPath && status === 'unauthenticated') {
            const callbackUrl = encodeURIComponent(pathname);
            router.push(`/auth/login?callbackUrl=${callbackUrl}`);
        }
    }, [status, pathname, router]);

    // Show nothing while checking authentication
    if (status === 'loading') {
        return null;
    }

    // Allow access to public paths without authentication
    if (publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'))) {
        return <>{children}</>;
    }

    // If authenticated, show the protected content
    if (status === 'authenticated') {
        return <>{children}</>;
    }

    // Show nothing while redirecting
    return null;
} 