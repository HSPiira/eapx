import { NextResponse } from 'next/server';
import { withApiMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';

export async function GET(
    _request: Request,
    { params }: { params: { id: string } }
) {
    return withApiMiddleware(_request, async () => {
        const { id } = params;

        // Check cache first
        const cacheKey = `service-feedback:${id}`;
        const cached = await cache.get(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        const feedback = await prisma.sessionFeedback.findUnique({
            where: { id },
            select: {
                id: true,
                sessionId: true,
                rating: true,
                comment: true,
                metadata: true,
                createdAt: true,
                // updatedAt: true,
                session: {
                    select: {
                        id: true,
                        scheduledAt: true,
                        completedAt: true,
                        status: true,
                        service: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                            },
                        },
                        provider: {
                            select: {
                                id: true,
                                name: true,
                                type: true,
                            },
                        },
                        beneficiary: {
                            select: {
                                id: true,
                                profile: {
                                    select: {
                                        fullName: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!feedback) {
            return NextResponse.json(
                { error: 'Feedback not found' },
                { status: 404 }
            );
        }

        // Cache the result
        await cache.set(cacheKey, feedback);

        return NextResponse.json(feedback);
    });
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    return withApiMiddleware(request, async (request) => {
        const { id } = params;
        let body;

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: 'Invalid JSON in request body' },
                { status: 400 }
            );
        }

        // Validate required fields
        if (!body.rating) {
            return NextResponse.json(
                { error: 'Rating is required' },
                { status: 400 }
            );
        }

        // Validate rating range
        if (body.rating < 1 || body.rating > 5) {
            return NextResponse.json(
                { error: 'Rating must be between 1 and 5' },
                { status: 400 }
            );
        }

        // Update feedback
        const updatedFeedback = await prisma.sessionFeedback.update({
            where: { id },
            data: {
                rating: body.rating,
                comment: body.comment,
                metadata: body.metadata,
            },
            select: {
                id: true,
                sessionId: true,
                rating: true,
                comment: true,
                metadata: true,
                createdAt: true,
                // updatedAt: true,
                session: {
                    select: {
                        id: true,
                        scheduledAt: true,
                        completedAt: true,
                        status: true,
                        service: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                            },
                        },
                        provider: {
                            select: {
                                id: true,
                                name: true,
                                type: true,
                            },
                        },
                        beneficiary: {
                            select: {
                                id: true,
                                profile: {
                                    select: {
                                        fullName: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        // Invalidate caches
        await cache.delete(`service-feedback:${id}`);
        await cache.invalidateByTags(['service-feedback']);

        return NextResponse.json(updatedFeedback);
    });
}

export async function DELETE(
    _request: Request,
    { params }: { params: { id: string } }
) {
    return withApiMiddleware(_request, async () => {
        const { id } = params;

        // Soft delete the feedback
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

        // Invalidate caches
        await cache.delete(`service-feedback:${id}`);
        await cache.invalidateByTags(['service-feedback']);

        return NextResponse.json(deletedFeedback);
    });
} 