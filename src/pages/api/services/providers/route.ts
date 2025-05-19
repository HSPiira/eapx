import { withApiMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { getPaginationParams } from '@/lib/api-utils';
import { WorkStatus, ServiceProviderType, Prisma } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { providerSelectFields } from '@/lib/select-fields';

// Define a constant for provider selection fields


async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const { page, limit, offset, search, status } = getPaginationParams(req);
        const type = req.query.type as string | undefined;

        // Validate status and type parameters
        if (status && status !== 'all' && !Object.values(WorkStatus).includes(status as WorkStatus)) {
            return res.status(400).json({
                error: `Invalid status value. Must be one of: ${Object.values(WorkStatus).join(', ')}`
            });
        }

        if (type && type !== 'all' && !Object.values(ServiceProviderType).includes(type as ServiceProviderType)) {
            return res.status(400).json({
                error: `Invalid type value. Must be one of: ${Object.values(ServiceProviderType).join(', ')}`
            });
        }

        // Build where clause
        const where: Prisma.ServiceProviderWhereInput = {
            deletedAt: null,
            OR: search ? [
                { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
                { contactEmail: { contains: search, mode: Prisma.QueryMode.insensitive } },
                { contactPhone: { contains: search, mode: Prisma.QueryMode.insensitive } }
            ] : undefined,
            type: type && type !== 'all' ? type as ServiceProviderType : undefined,
            status: status && status !== 'all' ? status as WorkStatus : undefined
        };

        // Generate cache key and check cache
        const cacheKey = `service-providers:${page}:${limit}:${search}:${status}:${type}`;
        const cached = await cache.get(cacheKey);
        if (cached) return res.status(200).json(cached);

        const totalCount = await prisma.serviceProvider.count({ where });
        const providers = await prisma.serviceProvider.findMany({
            where,
            select: providerSelectFields,
            skip: offset,
            take: limit,
            orderBy: {
                createdAt: 'desc',
            },
        });

        const response = {
            data: providers,
            metadata: {
                total: totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit)
            }
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

        if (!body.name || !body.type) {
            return res.status(400).json({ error: 'Name and type are required' });
        }

        if (!Object.values(ServiceProviderType).includes(body.type)) {
            return res.status(400).json({
                error: `Invalid type value. Must be one of: ${Object.values(ServiceProviderType).join(', ')}`
            });
        }

        const newProvider = await prisma.serviceProvider.create({
            data: {
                name: body.name,
                type: body.type,
                contactEmail: body.contactEmail,
                contactPhone: body.contactPhone,
                location: body.location,
                qualifications: body.qualifications || [],
                specializations: body.specializations || [],
                availability: body.availability,
                rating: body.rating,
                isVerified: body.isVerified || false,
                status: (body.status && Object.values(WorkStatus).includes(body.status)) ? body.status : WorkStatus.ACTIVE,
                metadata: body.metadata,
            },
            select: providerSelectFields,
        });

        await cache.deleteByPrefix('service-providers:');
        return res.status(201).json(newProvider);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default function wrappedHandler(req: NextApiRequest, res: NextApiResponse) {
    return withApiMiddleware(req, res, () => handler(req, res));
} 