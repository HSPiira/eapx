import { withApiMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { NextApiRequest, NextApiResponse } from 'next';

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
    const { id } = req.query;

    if (typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid feedback ID' });
    }

    if (req.method === 'GET') {
        const cacheKey = `feedback:${id}`;
        const cached = await cache.get(cacheKey);
        if (cached) return res.status(200).json(cached);

        const feedback = await prisma.sessionFeedback.findUnique({
            where: { id },
            select: feedbackSelectFields,
        });

        if (!feedback) {
            return res.status(404).json({ error: 'Feedback not found' });
        }

        await cache.set(cacheKey, feedback);
        return res.status(200).json(feedback);
    }

    if (req.method === 'PUT') {
        let body;
        try {
            body = req.body;
        } catch {
            return res.status(400).json({ error: 'Invalid JSON in request body' });
        }

        if (!body.rating) {
            return res.status(400).json({ error: 'Rating is required' });
        }

        if (body.rating < 1 || body.rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
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
            return res.status(200).json(updatedFeedback);
        } catch (error) {
            console.error('Error updating feedback:', error);
            return res.status(500).json({ error: 'Failed to update feedback' });
        }
    }

    if (req.method === 'DELETE') {
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
            return res.status(200).json(deletedFeedback);
        } catch (error) {
            console.error('Error deleting feedback:', error);
            return res.status(500).json({ error: 'Failed to delete feedback' });
        }
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default function wrappedHandler(req: NextApiRequest, res: NextApiResponse) {
    return withApiMiddleware(req, res, () => handler(req, res));
} 