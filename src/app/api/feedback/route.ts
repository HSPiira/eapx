import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const feedbackSchema = z.object({
    sessionId: z.string().min(1, 'Session ID is required'),
    rating: z.coerce
        .number({
            required_error: 'Rating is required',
            invalid_type_error: 'Rating must be a number',
        })
        .int('Rating must be a whole number')
        .min(1, 'Rating must be at least 1')
        .max(5, 'Rating cannot be greater than 5'),
    comment: z.string().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate request body against schema
        const validationResult = feedbackSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: 'Invalid request data',
                    details: validationResult.error.format()
                },
                { status: 400 }
            );
        }

        const { sessionId, rating, comment } = validationResult.data;

        // Verify that the session exists
        const session = await prisma.careSession.findUnique({
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

        // Handle JSON parsing errors specifically
        if (error instanceof SyntaxError) {
            return NextResponse.json(
                { error: 'Invalid JSON in request body' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create feedback' },
            { status: 500 }
        );
    }
} 