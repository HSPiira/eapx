import { withApiMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { NextApiRequest, NextApiResponse } from 'next';
import { SessionStatus } from '@prisma/client';

// Define a constant for session selection fields
const sessionSelectFields = {
    id: true,
    serviceId: true,
    providerId: true,
    staffId: true,
    beneficiaryId: true,
    scheduledAt: true,
    completedAt: true,
    status: true,
    notes: true,
    feedback: true,
    duration: true,
    location: true,
    cancellationReason: true,
    rescheduleCount: true,
    isGroupSession: true,
    metadata: true,
    createdAt: true,
    updatedAt: true,
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
    staff: {
        select: {
            id: true,
            profile: {
                select: {
                    fullName: true,
                },
            },
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
} as const;

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid session ID' });
    }

    if (req.method === 'GET') {
        const cacheKey = `session:${id}`;
        const cached = await cache.get(cacheKey);
        if (cached) return res.status(200).json(cached);

        const session = await prisma.serviceSession.findUnique({
            where: { id, deletedAt: null },
            select: sessionSelectFields,
        });

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        await cache.set(cacheKey, session);
        return res.status(200).json(session);
    }

    if (req.method === 'PUT') {
        let body;
        try {
            body = req.body;
        } catch {
            return res.status(400).json({ error: 'Invalid JSON in request body' });
        }

        if (!body.serviceId || !body.providerId || !body.scheduledAt) {
            return res.status(400).json({ error: 'Service, provider, and scheduled date are required' });
        }

        if (body.status && !Object.values(SessionStatus).includes(body.status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const scheduledAt = new Date(body.scheduledAt);
        if (isNaN(scheduledAt.getTime())) {
            return res.status(400).json({ error: 'Invalid scheduledAt' });
        }

        const completedAt = body.completedAt ? new Date(body.completedAt) : undefined;
        if (completedAt && isNaN(completedAt.getTime())) {
            return res.status(400).json({ error: 'Invalid completedAt' });
        }

        try {
            const session = await prisma.serviceSession.update({
                where: { id, deletedAt: null },
                data: {
                    serviceId: body.serviceId,
                    providerId: body.providerId,
                    staffId: body.staffId,
                    beneficiaryId: body.beneficiaryId,
                    scheduledAt,
                    completedAt,
                    status: body.status as SessionStatus,
                    notes: body.notes,
                    feedback: body.feedback,
                    duration: body.duration,
                    location: body.location,
                    cancellationReason: body.cancellationReason,
                    rescheduleCount: body.rescheduleCount,
                    isGroupSession: body.isGroupSession,
                    metadata: body.metadata,
                },
                select: sessionSelectFields,
            });

            await cache.delete(`session:${id}`);
            await cache.deleteByPrefix('sessions:');
            return res.status(200).json(session);
        } catch (error) {
            console.error('Error updating session:', error);
            return res.status(500).json({ error: 'Failed to update session' });
        }
    }

    if (req.method === 'DELETE') {
        try {
            const sessionWithFeedback = await prisma.serviceSession.findUnique({
                where: { id, deletedAt: null },
                include: {
                    _count: {
                        select: {
                            SessionFeedback: true,
                        },
                    },
                },
            });

            if (!sessionWithFeedback) {
                return res.status(404).json({ error: 'Session not found' });
            }

            const feedbackCount = sessionWithFeedback._count?.SessionFeedback ?? 0;
            if (feedbackCount > 0) {
                return res.status(400).json({ error: 'Cannot delete session with associated feedback' });
            }

            const deletedSession = await prisma.serviceSession.update({
                where: { id, deletedAt: null },
                data: {
                    deletedAt: new Date(),
                },
                select: {
                    id: true,
                    scheduledAt: true,
                },
            });

            await cache.delete(`session:${id}`);
            await cache.deleteByPrefix('sessions:');
            return res.status(200).json(deletedSession);
        } catch (error) {
            console.error('Error deleting session:', error);
            return res.status(500).json({ error: 'Failed to delete session' });
        }
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default function wrappedHandler(req: NextApiRequest, res: NextApiResponse) {
    return withApiMiddleware(req, res, () => handler(req, res));
} 