import { auth } from '@/middleware/auth';
import { rateLimiter } from '@/lib/rate-limiter';
import { NextRequest, NextResponse } from 'next/server';
import { Session } from 'next-auth';

interface RouteHandlerParams {
    request: NextRequest;
    session: Session;
}

export async function withRouteMiddleware(
    req: NextRequest,
    handler: (params: RouteHandlerParams) => Promise<NextResponse>
): Promise<NextResponse> {
    try {
        // Get IP address
        const forwarded = req.headers.get('x-forwarded-for');
        const ip = forwarded?.split(',')[0]?.trim() || 'unknown';

        // Rate limiting
        const allowed = await rateLimiter.isAllowed(ip);
        if (!allowed) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        // Auth
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Run the actual route handler with both request and session
        return await handler({ request: req, session });
    } catch (error) {
        console.error('Route Error:', error);
        return NextResponse.json(
            {
                error: 'Internal Server Error',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
