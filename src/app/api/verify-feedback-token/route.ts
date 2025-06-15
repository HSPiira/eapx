import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const sessionId = searchParams.get('sessionId');
        const token = searchParams.get('token');

        if (!sessionId || !token) {
            return NextResponse.json(
                { error: 'Session ID and token are required' },
                { status: 400 }
            );
        }

        // Verify the JWT token
        const decoded = verify(token, JWT_SECRET) as { sessionId: string; providerId: string };

        // Check if the token is for this session
        if (decoded.sessionId !== sessionId) {
            return NextResponse.json(
                { error: 'Invalid token for this session' },
                { status: 403 }
            );
        }

        // Verify that the session exists and belongs to the provider
        const session = await prisma.careSession.findFirst({
            where: {
                id: sessionId,
                provider: {
                    id: decoded.providerId
                }
            },
        });

        if (!session) {
            return NextResponse.json(
                { error: 'Session not found or unauthorized' },
                { status: 404 }
            );
        }

        return NextResponse.json({ authorized: true });
    } catch (error) {
        console.error('Token verification error:', error);
        return NextResponse.json(
            { error: 'Invalid or expired token' },
            { status: 401 }
        );
    }
} 