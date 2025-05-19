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
        const cacheKey = `service:${id}`;
        const cached = await cache.get(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        const service = await prisma.service.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                description: true,
                categoryId: true,
                status: true,
                duration: true,
                capacity: true,
                prerequisites: true,
                isPublic: true,
                price: true,
                metadata: true,
                createdAt: true,
                updatedAt: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                ServiceProvider: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },
            },
        });

        if (!service) {
            return NextResponse.json(
                { error: 'Service not found' },
                { status: 404 }
            );
        }

        // Cache the result
        await cache.set(cacheKey, service);

        return NextResponse.json(service);
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
        if (!body.name || !body.categoryId) {
            return NextResponse.json(
                { error: 'Name and category are required' },
                { status: 400 }
            );
        }

        // Update service
        const updatedService = await prisma.service.update({
            where: { id },
            data: {
                name: body.name,
                description: body.description,
                categoryId: body.categoryId,
                status: body.status,
                duration: body.duration,
                capacity: body.capacity,
                prerequisites: body.prerequisites,
                isPublic: body.isPublic,
                price: body.price,
                metadata: body.metadata,
                serviceProviderId: body.serviceProviderId,
            },
            select: {
                id: true,
                name: true,
                description: true,
                categoryId: true,
                status: true,
                duration: true,
                capacity: true,
                prerequisites: true,
                isPublic: true,
                price: true,
                metadata: true,
                createdAt: true,
                updatedAt: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                ServiceProvider: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },
            },
        });

        // Invalidate caches
        await cache.delete(`service:${id}`);
        await cache.invalidateByTags(['services']);

        return NextResponse.json(updatedService);
    });
}

export async function DELETE(
    _request: Request,
    { params }: { params: { id: string } }
) {
    return withApiMiddleware(_request, async () => {
        const { id } = params;

        // Soft delete the service
        const deletedService = await prisma.service.update({
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
        await cache.delete(`service:${id}`);
        await cache.invalidateByTags(['services']);

        return NextResponse.json(deletedService);
    });
} 