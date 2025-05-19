import { withApiMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { getPaginationParams } from '@/lib/api-utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';

// Define a constant for feedback selection fields
const feedbackSelectFields = {
    id: true,
    sessionId: true,
    rating: true,
    comment: true,
    metadata: true,
    createdAt: true,
    updatedAt: true,
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
} as const;

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const { page, limit, offset, search } = getPaginationParams(req);
        const sessionId = req.query.sessionId as string | undefined;

        const where = {
            OR: search
                ? [
                    { comment: { contains: search, mode: Prisma.QueryMode.insensitive } },
                ]
                : undefined,
            sessionId: sessionId || undefined,
        };

        const cacheKey = `feedback:${page}:${limit}:${search}:${sessionId}`;
        const cached = await cache.get(cacheKey);
        if (cached) return res.status(200).json(cached);

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
        return res.status(200).json(response);
    }

    if (req.method === 'POST') {
        let body;
        try {
            body = req.body;
        } catch {
            return res.status(400).json({ error: 'Invalid JSON in request body' });
        }

        if (!body.sessionId || !body.rating) {
            return res.status(400).json({ error: 'Session and rating are required' });
        }

        if (body.rating < 1 || body.rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        try {
            const feedback = await prisma.sessionFeedback.create({
                data: {
                    sessionId: body.sessionId,
                    rating: body.rating,
                    comment: body.comment,
                },
                select: feedbackSelectFields,
            });

            await cache.deleteByPrefix('feedback:');
            return res.status(201).json(feedback);
        } catch (error) {
            console.error('Error creating feedback:', error);
            return res.status(500).json({ error: 'Failed to create feedback' });
        }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default function wrappedHandler(req: NextApiRequest, res: NextApiResponse) {
    return withApiMiddleware(req, res, () => handler(req, res));
} 