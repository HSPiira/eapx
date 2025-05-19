import { withApiMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { getPaginationParams } from '@/lib/api-utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { Prisma, SessionStatus } from '@prisma/client';

// Define a constant for session selection fields
const sessionSelectFields = {
    id: true,
    serviceId: true,
    providerId: true,
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
    if (req.method === 'GET') {
        const { page, limit, offset, search } = getPaginationParams(req);
        const status = req.query.status as SessionStatus | undefined;
        const serviceId = req.query.serviceId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const beneficiaryId = req.query.beneficiaryId as string | undefined;

        if (status && !Object.values(SessionStatus).includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const where: Prisma.ServiceSessionWhereInput = {
            OR: search
                ? [
                    { service: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } },
                    { provider: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } },
                    { beneficiary: { profile: { fullName: { contains: search, mode: Prisma.QueryMode.insensitive } } } },
                ]
                : undefined,
            status: status || undefined,
            serviceId: serviceId || undefined,
            providerId: providerId || undefined,
            beneficiaryId: beneficiaryId || undefined,
            deletedAt: null,
        };

        const cacheKey = `sessions:${page}:${limit}:${search}:${status}:${serviceId}:${providerId}:${beneficiaryId}`;
        const cached = await cache.get(cacheKey);
        if (cached) return res.status(200).json(cached);

        const totalCount = await prisma.serviceSession.count({ where });
        const sessions = await prisma.serviceSession.findMany({
            where,
            select: sessionSelectFields,
            skip: offset,
            take: limit,
            orderBy: { scheduledAt: 'desc' },
        });

        const response = {
            data: sessions,
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

        if (!body.serviceId || !body.providerId || !body.beneficiaryId || !body.scheduledAt) {
            return res.status(400).json({ error: 'Service, provider, beneficiary, and scheduled date are required' });
        }

        const scheduledAt = new Date(body.scheduledAt);
        if (isNaN(scheduledAt.getTime())) {
            return res.status(400).json({ error: 'Invalid scheduledAt' });
        }

        try {
            const session = await prisma.serviceSession.create({
                data: {
                    serviceId: body.serviceId,
                    providerId: body.providerId,
                    beneficiaryId: body.beneficiaryId,
                    scheduledAt,
                    status: SessionStatus.SCHEDULED,
                    notes: body.notes,
                    feedback: body.feedback,
                    duration: body.duration,
                    location: body.location,
                    isGroupSession: body.isGroupSession || false,
                    metadata: body.metadata,
                },
                select: sessionSelectFields,
            });

            await cache.deleteByPrefix('sessions:');
            return res.status(201).json(session);
        } catch (error) {
            console.error('Error creating session:', error);
            return res.status(500).json({ error: 'Failed to create session' });
        }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default function wrappedHandler(req: NextApiRequest, res: NextApiResponse) {
    return withApiMiddleware(req, res, () => handler(req, res));
} 