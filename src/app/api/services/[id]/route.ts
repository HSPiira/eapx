import { withRouteMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { NextRequest, NextResponse } from 'next/server';
import { serviceSelectFields } from '@/lib/select-fields/services';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    return withRouteMiddleware(request, async (session) => {
        // Check cache first
        const cacheKey = `service:${id}`;
        const cached = await cache.get(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        const service = await prisma.service.findUnique({
            where: { id },
            select: serviceSelectFields,
        });

        if (!service) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }

        await cache.set(cacheKey, service);
        return NextResponse.json(service);
    });
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    return withRouteMiddleware(request, async (session) => {
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }

        if (!body.name || !body.categoryId) {
            return NextResponse.json({ error: 'Name and category are required' }, { status: 400 });
        }

        try {
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
                select: serviceSelectFields,
            });

            await cache.delete(`service:${id}`);
            await cache.invalidateByTags(['services']);

            return NextResponse.json(updatedService);
        } catch (error) {
            console.error('Error updating service:', error);
            return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
        }
    });
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    return withRouteMiddleware(request, async (session) => {
        try {
            const deletedService = await prisma.service.update({
                where: { id },
                data: { deletedAt: new Date() },
                select: { id: true, name: true },
            });

            await cache.delete(`service:${id}`);
            await cache.invalidateByTags(['services']);

            return NextResponse.json(deletedService);
        } catch (error) {
            console.error('Error deleting service:', error);
            return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
        }
    });
} 