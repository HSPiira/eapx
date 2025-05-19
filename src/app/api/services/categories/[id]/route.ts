import { NextResponse } from 'next/server';
import { withApiMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';

export async function GET(
    _request: Request,
    { params }: { params: { id: string } }
) {
    return withApiMiddleware(_request, async () => {
        const { id } = params;

        // Check cache first
        const cacheKey = `service-category:${id}`;
        const cached = await cache.get(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        const category = await prisma.serviceCategory.findUnique({
            where: { id },
            select: {
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
                services: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        status: true,
                        isPublic: true,
                    },
                },
            },
        });

        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        // Cache the result
        await cache.set(cacheKey, category);

        return NextResponse.json(category);
    });
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    return withApiMiddleware(request, async (request) => {
        const { id } = params;
        let body;

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: 'Invalid JSON in request body' },
                { status: 400 }
            );
        }

        // Validate required fields
        if (!body.name) {
            return NextResponse.json(
                { error: 'Name is required' },
                { status: 400 }
            );
        }

        // Update category
        const updatedCategory = await prisma.serviceCategory.update({
            where: { id },
            data: {
                name: body.name,
                description: body.description,
                metadata: body.metadata,
            },
            select: {
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
            },
        });

        // Invalidate caches
        await cache.delete(`service-category:${id}`);
        await cache.invalidateByTags(['service-categories']);

        return NextResponse.json(updatedCategory);
    });
}

export async function DELETE(
    _request: Request,
    { params }: { params: { id: string } }
) {
    return withApiMiddleware(_request, async () => {
        const { id } = params;

        // Check if category has services
        const categoryWithServices = await prisma.serviceCategory.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        services: true,
                    },
                },
            },
        });

        if (categoryWithServices && categoryWithServices._count && categoryWithServices._count.services > 0) {
            return NextResponse.json(
                { error: 'Cannot delete category with associated services' },
                { status: 400 }
            );
        }

        // Soft delete the category
        const deletedCategory = await prisma.serviceCategory.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
            select: {
                id: true,
                name: true,
            },
        });

        // Invalidate caches
        await cache.delete(`service-category:${id}`);
        await cache.invalidateByTags(['service-categories']);

        return NextResponse.json(deletedCategory);
    });
} 