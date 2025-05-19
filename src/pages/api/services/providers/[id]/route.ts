import { withApiMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { NextApiRequest, NextApiResponse } from 'next';
import { providerSelectFields, providerWithRelationsSelectFields } from '@/lib/select-fields';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid provider ID' });
    }

    if (req.method === 'GET') {
        const cacheKey = `provider:${id}`;
        const cached = await cache.get(cacheKey);
        if (cached) return res.status(200).json(cached);

        const provider = await prisma.serviceProvider.findUnique({
            where: { id, deletedAt: null },
            select: providerWithRelationsSelectFields,
        });

        if (!provider) {
            return res.status(404).json({ error: 'Provider not found' });
        }

        await cache.set(cacheKey, provider);
        return res.status(200).json(provider);
    }

    if (req.method === 'PUT') {
        let body;
        try {
            body = req.body;
        } catch {
            return res.status(400).json({ error: 'Invalid JSON in request body' });
        }

        if (!body.name || !body.type) {
            return res.status(400).json({ error: 'Name and type are required' });
        }

        try {
            const updatedProvider = await prisma.serviceProvider.update({
                where: { id, deletedAt: null },
                data: {
                    name: body.name,
                    type: body.type,
                    contactEmail: body.contactEmail,
                    contactPhone: body.contactPhone,
                    location: body.location,
                    qualifications: body.qualifications,
                    specializations: body.specializations,
                    availability: body.availability,
                    rating: body.rating,
                    isVerified: body.isVerified,
                    status: body.status,
                    metadata: body.metadata,
                },
                select: providerSelectFields,
            });

            await cache.delete(`provider:${id}`);
            await cache.deleteByPrefix('providers:');
            return res.status(200).json(updatedProvider);
        } catch (error) {
            console.error('Error updating provider:', error);
            return res.status(500).json({ error: 'Failed to update provider' });
        }
    }

    if (req.method === 'DELETE') {
        try {
            const providerWithRelations = await prisma.serviceProvider.findUnique({
                where: { id, deletedAt: null },
                include: {
                    _count: {
                        select: {
                            services: true,
                            sessions: true,
                        },
                    },
                },
            });

            if (!providerWithRelations) {
                return res.status(404).json({ error: 'Provider not found' });
            }

            const serviceCount = providerWithRelations._count?.services ?? 0;
            const sessionCount = providerWithRelations._count?.sessions ?? 0;
            if (serviceCount > 0 || sessionCount > 0) {
                return res.status(400).json({ error: 'Cannot delete provider with associated services or sessions' });
            }

            const deletedProvider = await prisma.serviceProvider.update({
                where: { id, deletedAt: null },
                data: {
                    deletedAt: new Date(),
                },
                select: {
                    id: true,
                    name: true,
                },
            });

            await cache.delete(`provider:${id}`);
            await cache.deleteByPrefix('providers:');
            return res.status(200).json(deletedProvider);
        } catch (error) {
            console.error('Error deleting provider:', error);
            return res.status(500).json({ error: 'Failed to delete provider' });
        }
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default function wrappedHandler(req: NextApiRequest, res: NextApiResponse) {
    return withApiMiddleware(req, res, () => handler(req, res));
} 