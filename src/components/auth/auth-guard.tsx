'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { isPublicPath } from '@/config/auth';

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Check if the current path is public
        const isPathPublic = isPublicPath(pathname);

        // If authenticated and trying to access public pages, redirect to dashboard
        if (status === 'authenticated' && isPathPublic) {
            router.push('/dashboard');
            return;
        }

        // If the path is not public and there's no session, redirect to login
        if (!isPathPublic && status === 'unauthenticated') {
            const callbackUrl = encodeURIComponent(pathname);
            router.push(`/auth/login?callbackUrl=${callbackUrl}`);
        }
    }, [status, pathname, router]);

    // Show nothing while checking authentication
    if (status === 'loading') {
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
    if (status === 'authenticated') {
        return <>{children}</>;
    }

    // Show nothing while redirecting
    return null;
} 