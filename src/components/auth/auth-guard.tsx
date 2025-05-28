'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { isPublicPath } from '@/config/auth';
import { useSession } from 'next-auth/react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { status } = useSession();

    useEffect(() => {
        // Check if the current path is public
        const isPathPublic = isPublicPath(pathname);

        // If authenticated and trying to access public pages, redirect to dashboard
        if (status === 'authenticated' && isPathPublic) {
            router.push('/dashboard');
            return;
        }

        // If the path is not public and there's no session, redirect to login
        if (status === 'unauthenticated' && !isPathPublic) {
            const callbackUrl = encodeURIComponent(pathname);
            router.push(`/auth/login?callbackUrl=${callbackUrl}`);
        }
    }, [router, pathname, status]);

    // Show nothing while checking authentication
    if (!pathname || status === 'loading') {
        return null;
    }

    // If authenticated and on a public path, show nothing (will redirect)
    if (status === 'authenticated' && isPublicPath(pathname)) {
        return null;
    }

    // Allow access to public paths without authentication
    if (isPublicPath(pathname)) {
        return <>{children}</>;
    }

    // If authenticated, show the protected content
    return <>{children}</>;
} 