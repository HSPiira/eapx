import { withApiMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { NextApiRequest, NextApiResponse } from 'next';
import { AssignmentStatus, Frequency } from '@prisma/client';

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
    const { id } = req.query;

    if (typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid assignment ID' });
    }

    if (req.method === 'GET') {
        const cacheKey = `assignment:${id}`;
        const cached = await cache.get(cacheKey);
        if (cached) return res.status(200).json(cached);

        const assignment = await prisma.serviceAssignment.findUnique({
            where: { id, deletedAt: null },
            select: assignmentSelectFields,
        });

        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        await cache.set(cacheKey, assignment);
        return res.status(200).json(assignment);
    }

    if (req.method === 'PUT') {
        let body;
        try {
            body = req.body;
        } catch {
            return res.status(400).json({ error: 'Invalid JSON in request body' });
        }

        if (!body.serviceId || !body.contractId || !body.startDate) {
            return res.status(400).json({ error: 'Service, contract, and start date are required' });
        }

        if (body.frequency && !Object.values(Frequency).includes(body.frequency)) {
            return res.status(400).json({ error: 'Invalid frequency' });
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
            const updatedAssignment = await prisma.serviceAssignment.update({
                where: { id, deletedAt: null },
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

            await cache.delete(`assignment:${id}`);
            await cache.deleteByPrefix('assignments:');
            return res.status(200).json(updatedAssignment);
        } catch (error) {
            console.error('Error updating assignment:', error);
            return res.status(500).json({ error: 'Failed to update assignment' });
        }
    }

    if (req.method === 'DELETE') {
        try {
            const sessionCount = await prisma.serviceSession.count({
                where: {
                    service: {
                        assignments: {
                            some: {
                                id: id,
                                deletedAt: null,
                            },
                        },
                    },
                },
            });

            if (sessionCount > 0) {
                return res.status(400).json({ error: 'Cannot delete assignment with associated sessions' });
            }

            const deletedAssignment = await prisma.serviceAssignment.update({
                where: { id, deletedAt: null },
                data: {
                    deletedAt: new Date(),
                },
                select: {
                    id: true,
                    startDate: true,
                },
            });

            await cache.delete(`assignment:${id}`);
            await cache.deleteByPrefix('assignments:');
            return res.status(200).json(deletedAssignment);
        } catch (error) {
            console.error('Error deleting assignment:', error);
            return res.status(500).json({ error: 'Failed to delete assignment' });
        }
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default function wrappedHandler(req: NextApiRequest, res: NextApiResponse) {
    return withApiMiddleware(req, res, () => handler(req, res));
} 