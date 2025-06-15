import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { sessionId, rating, comment } = body;

        if (!sessionId || !rating) {
            return NextResponse.json(
                { error: 'Session ID and rating are required' },
                { status: 400 }
            );
        }

        // Verify that the session exists
        const session = await prisma.session.findUnique({
            where: { id: sessionId },
        });

        if (!session) {
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            );
        }

        // Create the feedback
        const feedback = await prisma.sessionFeedback.create({
            data: {
                sessionId,
                rating,
                comment: comment || '',
            },
        });

        return NextResponse.json(feedback);
    } catch (error) {
        console.error('Error creating feedback:', error);
        return NextResponse.json(
            { error: 'Failed to create feedback' },
            { status: 500 }
        );
    }
} 