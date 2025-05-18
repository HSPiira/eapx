import { NextResponse } from 'next/server';
import { withApiMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';

export async function GET(request: Request) {
    return withApiMiddleware(request, async (request) => {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const rating = searchParams.get('rating');
        const sessionId = searchParams.get('sessionId');
        const serviceId = searchParams.get('serviceId');
        const providerId = searchParams.get('providerId');

        // Check cache first
        const cacheKey = `service-feedback:${page}:${limit}:${search}:${rating}:${sessionId}:${serviceId}:${providerId}`;
        const cached = await cache.get(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        // Build where clause
        const where: any = {
            deletedAt: null,
        };

        if (search) {
            where.OR = [
                { comment: { contains: search, mode: 'insensitive' } },
                { session: { service: { name: { contains: search, mode: 'insensitive' } } } },
                { session: { provider: { name: { contains: search, mode: 'insensitive' } } } },
            ];
        }

        if (rating) {
            where.rating = parseInt(rating);
        }

        if (sessionId) {
            where.sessionId = sessionId;
        }

        if (serviceId) {
            where.session = {
                serviceId: serviceId,
            };
        }

        if (providerId) {
            where.session = {
                providerId: providerId,
            };
        }

        // Get total count
        const total = await prisma.sessionFeedback.count({ where });

        // Get feedback
        const feedback = await prisma.sessionFeedback.findMany({
            where,
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
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        });

        const result = {
            data: feedback,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        };

        // Cache the result
        await cache.set(cacheKey, result);

        return NextResponse.json(result);
    });
}

export async function POST(request: Request) {
    return withApiMiddleware(request, async (request) => {
        let body;

        try {
            body = await request.json();
        } catch (error) {
            return NextResponse.json(
                { error: 'Invalid JSON in request body' },
                { status: 400 }
            );
        }

        // Validate required fields
        if (!body.sessionId || !body.rating) {
            return NextResponse.json(
                { error: 'Session and rating are required' },
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

        // Create feedback
        const feedback = await prisma.sessionFeedback.create({
            data: {
                sessionId: body.sessionId,
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
        await cache.invalidateByTags(['service-feedback']);

        return NextResponse.json(feedback);
    });
} 