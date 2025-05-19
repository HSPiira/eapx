import { withApiMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { NextApiRequest, NextApiResponse } from 'next';

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

// Define a constant for category with services selection fields
const categoryWithServicesSelectFields = {
    ...categorySelectFields,
    services: {
        select: {
            id: true,
            name: true,
            description: true,
            status: true,
            isPublic: true,
        },
    },
} as const;

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid category ID' });
    }

    if (req.method === 'GET') {
        const cacheKey = `category:${id}`;
        const cached = await cache.get(cacheKey);
        if (cached) return res.status(200).json(cached);

        const category = await prisma.serviceCategory.findUnique({
            where: { id, deletedAt: null },
            select: categoryWithServicesSelectFields,
        });

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        await cache.set(cacheKey, category);
        return res.status(200).json(category);
    }

    if (req.method === 'PUT') {
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
            const updatedCategory = await prisma.serviceCategory.update({
                where: { id, deletedAt: null },
                data: {
                    name: body.name,
                    description: body.description,
                    metadata: body.metadata,
                },
                select: categorySelectFields,
            });

            await cache.delete(`category:${id}`);
            await cache.deleteByPrefix('categories:');
            return res.status(200).json(updatedCategory);
        } catch (error) {
            console.error('Error updating category:', error);
            return res.status(500).json({ error: 'Failed to update category' });
        }
    }

    if (req.method === 'DELETE') {
        try {
            const categoryWithServices = await prisma.serviceCategory.findUnique({
                where: { id, deletedAt: null },
                include: {
                    _count: {
                        select: {
                            services: true,
                        },
                    },
                },
            });

            if (!categoryWithServices) {
                return res.status(404).json({ error: 'Category not found' });
            }

            const serviceCount = categoryWithServices._count?.services ?? 0;
            if (serviceCount > 0) {
                return res.status(400).json({ error: 'Cannot delete category with associated services' });
            }

            const deletedCategory = await prisma.serviceCategory.update({
                where: { id, deletedAt: null },
                data: {
                    deletedAt: new Date(),
                },
                select: {
                    id: true,
                    name: true,
                },
            });

            await cache.delete(`category:${id}`);
            await cache.deleteByPrefix('categories:');
            return res.status(200).json(deletedCategory);
        } catch (error) {
            console.error('Error deleting category:', error);
            return res.status(500).json({ error: 'Failed to delete category' });
        }
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default function wrappedHandler(req: NextApiRequest, res: NextApiResponse) {
    return withApiMiddleware(req, res, () => handler(req, res));
} 