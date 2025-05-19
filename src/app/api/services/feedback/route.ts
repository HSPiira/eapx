import { withRouteMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { getPaginationParams } from '@/lib/api-utils';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { feedbackSelectFields } from '@/lib/select-fields';

export async function GET(request: NextRequest) {
    return withRouteMiddleware(request, async (session) => {
        const { searchParams } = new URL(request.url);
        const { page, limit, offset, search } = getPaginationParams(searchParams);
        const sessionId = searchParams.get('sessionId') || undefined;
        const serviceId = searchParams.get('serviceId') || undefined;
        const providerId = searchParams.get('providerId') || undefined;
        const minRating = searchParams.get('minRating') ? parseInt(searchParams.get('minRating')!) : undefined;
        const maxRating = searchParams.get('maxRating') ? parseInt(searchParams.get('maxRating')!) : undefined;

        if (minRating && (minRating < 1 || minRating > 5)) {
            return NextResponse.json({ error: 'Minimum rating must be between 1 and 5' }, { status: 400 });
        }

        if (maxRating && (maxRating < 1 || maxRating > 5)) {
            return NextResponse.json({ error: 'Maximum rating must be between 1 and 5' }, { status: 400 });
        }

        if (minRating && maxRating && minRating > maxRating) {
            return NextResponse.json({ error: 'Minimum rating cannot be greater than maximum rating' }, { status: 400 });
        }

        const where: Prisma.SessionFeedbackWhereInput = {
            deletedAt: null,
            OR: search
                ? [
                    { comment: { contains: search, mode: Prisma.QueryMode.insensitive } },
                    { session: { service: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } } },
                    { session: { provider: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } } },
                ]
                : undefined,
            sessionId: sessionId || undefined,
            session: {
                serviceId: serviceId || undefined,
                providerId: providerId || undefined,
            },
            rating: {
                gte: minRating,
                lte: maxRating,
            },
        };

        const cacheKey = `feedback:${page}:${limit}:${search}:${sessionId}:${serviceId}:${providerId}:${minRating}:${maxRating}`;
        const cached = await cache.get(cacheKey);
        if (cached) return NextResponse.json(cached);

        const totalCount = await prisma.sessionFeedback.count({ where });
        const feedback = await prisma.sessionFeedback.findMany({
            where,
            select: feedbackSelectFields,
            skip: offset,
            take: limit,
            orderBy: { createdAt: 'desc' },
        });

        const response = {
            data: feedback,
            metadata: {
                total: totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit),
            },
        };

        await cache.set(cacheKey, response);
        return NextResponse.json(response);
    });
}

export async function POST(request: NextRequest) {
    return withRouteMiddleware(request, async (session) => {
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }

        if (!body.sessionId || !body.rating) {
            return NextResponse.json({ error: 'Session ID and rating are required' }, { status: 400 });
        }

        if (body.rating < 1 || body.rating > 5) {
            return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
        }

        try {
            const newFeedback = await prisma.sessionFeedback.create({
                data: {
                    sessionId: body.sessionId,
                    rating: body.rating,
                    comment: body.comment,
                    metadata: body.metadata,
                },
                select: feedbackSelectFields,
            });

            await cache.deleteByPrefix('feedback:');
            return NextResponse.json(newFeedback, { status: 201 });
        } catch (error) {
            console.error('Error creating feedback:', error);
            return NextResponse.json({ error: 'Failed to create feedback' }, { status: 500 });
        }
    });
} 