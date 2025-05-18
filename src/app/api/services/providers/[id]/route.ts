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
        const cacheKey = `service-provider:${id}`;
        const cached = await cache.get(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        const provider = await prisma.serviceProvider.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                type: true,
                contactEmail: true,
                contactPhone: true,
                location: true,
                qualifications: true,
                specializations: true,
                availability: true,
                rating: true,
                isVerified: true,
                status: true,
                metadata: true,
                createdAt: true,
                updatedAt: true,
                services: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        status: true,
                        isPublic: true,
                    },
                },
                sessions: {
                    select: {
                        id: true,
                        scheduledAt: true,
                        status: true,
                        duration: true,
                    },
                    orderBy: {
                        scheduledAt: 'desc',
                    },
                    take: 10,
                },
                _count: {
                    select: {
                        services: true,
                        sessions: true,
                    },
                },
            },
        });

        if (!provider) {
            return NextResponse.json(
                { error: 'Provider not found' },
                { status: 404 }
            );
        }

        // Cache the result
        await cache.set(cacheKey, provider);

        return NextResponse.json(provider);
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
        } catch (error) {
            return NextResponse.json(
                { error: 'Invalid JSON in request body' },
                { status: 400 }
            );
        }

        // Validate required fields
        if (!body.name || !body.type) {
            return NextResponse.json(
                { error: 'Name and type are required' },
                { status: 400 }
            );
        }

        // Update provider
        const updatedProvider = await prisma.serviceProvider.update({
            where: { id },
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
            select: {
                id: true,
                name: true,
                type: true,
                contactEmail: true,
                contactPhone: true,
                location: true,
                qualifications: true,
                specializations: true,
                availability: true,
                rating: true,
                isVerified: true,
                status: true,
                metadata: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        services: true,
                        sessions: true,
                    },
                },
            },
        });

        // Invalidate caches
        await cache.delete(`service-provider:${id}`);
        await cache.invalidateByTags(['service-providers']);

        return NextResponse.json(updatedProvider);
    });
}

export async function DELETE(
    _request: Request,
    { params }: { params: { id: string } }
) {
    return withApiMiddleware(_request, async () => {
        const { id } = params;

        // Check if provider has services or sessions
        const providerWithRelations = await prisma.serviceProvider.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        services: true,
                        sessions: true,
                    },
                },
            },
        });

        if (providerWithRelations?._count.services > 0 || providerWithRelations?._count.sessions > 0) {
            return NextResponse.json(
                { error: 'Cannot delete provider with associated services or sessions' },
                { status: 400 }
            );
        }

        // Soft delete the provider
        const deletedProvider = await prisma.serviceProvider.update({
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
        await cache.delete(`service-provider:${id}`);
        await cache.invalidateByTags(['service-providers']);

        return NextResponse.json(deletedProvider);
    });
} 