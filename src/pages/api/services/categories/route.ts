import { withApiMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { getPaginationParams } from '@/lib/api-utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';

// Define a constant for category selection fields
const categorySelectFields = {
    id: true,
    name: true,
    description: true,
    metadata: true,
    createdAt: true,
    updatedAt: true,
    _count: {
        select: {
            services: true,
        },
    },
} as const;

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const { page, limit, offset, search } = getPaginationParams(req);

        const where: Prisma.ServiceCategoryWhereInput = {
            OR: search
                ? [
                    { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
                    { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
                ]
                : undefined,
            deletedAt: null,
        };

        const cacheKey = `categories:${page}:${limit}:${search}`;
        const cached = await cache.get(cacheKey);
        if (cached) return res.status(200).json(cached);

        const totalCount = await prisma.serviceCategory.count({ where });
        const categories = await prisma.serviceCategory.findMany({
            where,
            select: categorySelectFields,
            skip: offset,
            take: limit,
            orderBy: { name: 'asc' },
        });

        const response = {
            data: categories,
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

        if (!body.name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        try {
            const category = await prisma.serviceCategory.create({
                data: {
                    name: body.name,
                    description: body.description,
                    metadata: body.metadata,
                },
                select: categorySelectFields,
            });

            await cache.deleteByPrefix('categories:');
            return res.status(201).json(category);
        } catch (error) {
            console.error('Error creating category:', error);
            return res.status(500).json({ error: 'Failed to create category' });
        }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default function wrappedHandler(req: NextApiRequest, res: NextApiResponse) {
    return withApiMiddleware(req, res, () => handler(req, res));
} 