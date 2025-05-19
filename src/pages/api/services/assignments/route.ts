import { withApiMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { getPaginationParams } from '@/lib/api-utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { AssignmentStatus, Frequency, Prisma } from '@prisma/client';

// Define a constant for assignment selection fields
const assignmentSelectFields = {
    id: true,
    serviceId: true,
    contractId: true,
    clientId: true,
    status: true,
    startDate: true,
    endDate: true,
    frequency: true,
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
    contract: {
        select: {
            id: true,
            startDate: true,
            endDate: true,
            status: true,
        },
    },
    client: {
        select: {
            id: true,
            name: true,
        },
    },
} as const;

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const { page, limit, offset, search, status } = getPaginationParams(req);
        const serviceId = req.query.serviceId as string | undefined;
        const contractId = req.query.contractId as string | undefined;
        const clientId = req.query.clientId as string | undefined;

        if (status && status !== 'all' && !Object.values(AssignmentStatus).includes(status as AssignmentStatus)) {
            return res.status(400).json({
                error: `Invalid status value. Must be one of: ${Object.values(AssignmentStatus).join(', ')}`
            });
        }

        const where: Prisma.ServiceAssignmentWhereInput = {
            deletedAt: null,
            OR: search ? [
                { service: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } },
                { contract: { id: { contains: search, mode: Prisma.QueryMode.insensitive } } },
                { client: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } }
            ] : undefined,
            status: status && status !== 'all' ? status as AssignmentStatus : undefined,
            serviceId: serviceId || undefined,
            contractId: contractId || undefined,
            clientId: clientId || undefined,
        };

        const cacheKey = `assignments:${page}:${limit}:${search}:${status}:${serviceId}:${contractId}:${clientId}`;
        const cached = await cache.get(cacheKey);
        if (cached) return res.status(200).json(cached);

        const totalCount = await prisma.serviceAssignment.count({ where });
        const assignments = await prisma.serviceAssignment.findMany({
            where,
            select: assignmentSelectFields,
            orderBy: { createdAt: 'desc' },
            skip: offset,
            take: limit,
        });

        const response = {
            data: assignments,
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

        if (!body.serviceId || !body.contractId || !body.startDate) {
            return res.status(400).json({ error: 'Service, contract, and start date are required' });
        }

        if (body.status && !Object.values(AssignmentStatus).includes(body.status)) {
            return res.status(400).json({
                error: `Invalid status value. Must be one of: ${Object.values(AssignmentStatus).join(', ')}`
            });
        }

        if (body.frequency && !Object.values(Frequency).includes(body.frequency)) {
            return res.status(400).json({
                error: `Invalid frequency value. Must be one of: ${Object.values(Frequency).join(', ')}`
            });
        }

        const startDate = new Date(body.startDate);
        if (isNaN(startDate.getTime())) {
            return res.status(400).json({ error: 'Invalid startDate' });
        }

        const endDate = body.endDate ? new Date(body.endDate) : undefined;
        if (endDate && isNaN(endDate.getTime())) {
            return res.status(400).json({ error: 'Invalid endDate' });
        }

        try {
            const assignment = await prisma.serviceAssignment.create({
                data: {
                    serviceId: body.serviceId,
                    contractId: body.contractId,
                    clientId: body.clientId,
                    status: (body.status || 'PENDING') as AssignmentStatus,
                    startDate,
                    endDate,
                    frequency: body.frequency as Frequency,
                    metadata: body.metadata,
                },
                select: assignmentSelectFields,
            });

            await cache.deleteByPrefix('assignments:');
            return res.status(201).json(assignment);
        } catch (error) {
            console.error('Error creating assignment:', error);
            return res.status(500).json({ error: 'Failed to create assignment' });
        }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default function wrappedHandler(req: NextApiRequest, res: NextApiResponse) {
    return withApiMiddleware(req, res, () => handler(req, res));
} 