import { withRouteMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { NextRequest, NextResponse } from 'next/server';
import { feedbackSelectFields } from '@/lib/select-fields';

type Params = Promise<{ id: string }>;

export async function GET(
    request: NextRequest,
    { params }: { params: Params }
) {
    return withRouteMiddleware(request, async () => {
        const { id } = await params;

        const cacheKey = `feedback:${id}`;
        const cached = await cache.get(cacheKey);
        if (cached) return NextResponse.json(cached);

        const feedback = await prisma.sessionFeedback.findUnique({
            where: { id },
            select: feedbackSelectFields,
        });

        if (!feedback) {
            return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
        }

        await cache.set(cacheKey, feedback);
        return NextResponse.json(feedback);
    });
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Params }
) {
    return withRouteMiddleware(request, async () => {
        const { id } = await params;

        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }

        if (!body.rating) {
            return NextResponse.json({ error: 'Rating is required' }, { status: 400 });
        }

        if (body.rating < 1 || body.rating > 5) {
            return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
        }

        try {
            const updatedFeedback = await prisma.sessionFeedback.update({
                where: { id },
                data: {
                    rating: body.rating,
                    comment: body.comment,
                    metadata: body.metadata,
                },
                select: feedbackSelectFields,
            });

            await cache.delete(`feedback:${id}`);
            await cache.deleteByPrefix('feedback:');
            return NextResponse.json(updatedFeedback);
        } catch (error) {
            console.error('Error updating feedback:', error);
            return NextResponse.json({ error: 'Failed to update feedback' }, { status: 500 });
        }
    });
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Params }
) {
    return withRouteMiddleware(request, async () => {
        const { id } = await params;

        try {
            const deletedFeedback = await prisma.sessionFeedback.update({
                where: { id },
                data: {
                    deletedAt: new Date(),
                },
                select: {
                    id: true,
                    rating: true,
                },
            });

            await cache.delete(`feedback:${id}`);
            await cache.deleteByPrefix('feedback:');
            return NextResponse.json(deletedFeedback);
        } catch (error) {
            console.error('Error deleting feedback:', error);
            return NextResponse.json({ error: 'Failed to delete feedback' }, { status: 500 });
        }
    });
} 