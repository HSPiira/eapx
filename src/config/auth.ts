/**
 * Shared authentication configuration
 * This file contains constants used by both client and server-side authentication
 */

// List of paths that should be considered public (no auth required)
export const publicPaths = [
    '/',
    '/auth/login',
    '/auth/error',
    '/404',
    '/not-found',
    '/favicon.ico',
    '/logo.svg',
    '/logo.png',
    '/globe.svg',
    '/window.svg',
    '/file.svg',
    '/microsoft.svg',
    '/dark-logo.png',
    '/session-feedback'
] as const;

// Helper to determine if a path is a static asset
export const isStaticAsset = (pathname: string): boolean => {
    return !!pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf|eot)$/);
};

// Helper to determine if a path is public
export const isPublicPath = (pathname: string): boolean => {
    return publicPaths.some(path =>
        pathname === path || pathname.startsWith(path + '/')
    ) || isStaticAsset(pathname);
}; 