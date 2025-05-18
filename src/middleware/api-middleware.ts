import { NextResponse } from 'next/server';
import { auth } from '@/middleware/auth';
import { rateLimiter } from '@/lib/rate-limiter';

export async function withApiMiddleware(
    request: Request,
    handler: (request: Request) => Promise<NextResponse>
): Promise<NextResponse> {
    try {
        // Rate limiting
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        if (!(await rateLimiter.isAllowed(ip))) {
            return NextResponse.json(
                { error: 'Too many requests' },
                { status: 429 }
            );
        }

        // Authentication
        const session = await auth();
        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        return await handler(request);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
} 