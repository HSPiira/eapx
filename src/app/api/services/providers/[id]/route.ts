import { withRouteMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { NextRequest, NextResponse } from 'next/server';
import { WorkStatus, ServiceProviderType } from '@prisma/client';
import { providerSelectFields } from '@/lib/select-fields';

type Params = Promise<{ id: string }>;

export async function GET(
    request: NextRequest,
    { params }: { params: Params }
) {
    return withRouteMiddleware(request, async (session) => {
        const { id } = await params;

        const cacheKey = `provider:${id}`;
        const cached = await cache.get(cacheKey);
        if (cached) return NextResponse.json(cached);

        const provider = await prisma.serviceProvider.findUnique({
            where: { id, deletedAt: null },
            select: providerSelectFields,
        });

        if (!provider) {
            return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
        }

        await cache.set(cacheKey, provider);
        return NextResponse.json(provider);
    });
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Params }
) {
    return withRouteMiddleware(request, async (session) => {
        const { id } = await params;

        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }

        if (!body.name || !body.type) {
            return NextResponse.json({ error: 'Name and type are required' }, { status: 400 });
        }

        if (!Object.values(ServiceProviderType).includes(body.type)) {
            return NextResponse.json({
                error: `Invalid type value. Must be one of: ${Object.values(ServiceProviderType).join(', ')}`
            }, { status: 400 });
        }

        if (body.status && !Object.values(WorkStatus).includes(body.status)) {
            return NextResponse.json({
                error: `Invalid status value. Must be one of: ${Object.values(WorkStatus).join(', ')}`
            }, { status: 400 });
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
                    qualifications: body.qualifications || [],
                    specializations: body.specializations || [],
                    availability: body.availability,
                    rating: body.rating,
                    isVerified: body.isVerified,
                    status: body.status,
                    metadata: body.metadata,
                },
                select: providerSelectFields,
            });

            await cache.delete(`provider:${id}`);
            await cache.deleteByPrefix('service-providers:');
            return NextResponse.json(updatedProvider);
        } catch (error) {
            console.error('Error updating provider:', error);
            return NextResponse.json({ error: 'Failed to update provider' }, { status: 500 });
        }
    });
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Params }
) {
    return withRouteMiddleware(request, async (session) => {
        const { id } = await params;

        try {
            const deletedProvider = await prisma.serviceProvider.update({
                where: { id, deletedAt: null },
                data: {
                    deletedAt: new Date(),
                },
                select: {
                    id: true,
                    name: true,
                    type: true,
                    status: true,
                },
            });

            await cache.delete(`provider:${id}`);
            await cache.deleteByPrefix('service-providers:');
            return NextResponse.json(deletedProvider);
        } catch (error) {
            console.error('Error deleting provider:', error);
            return NextResponse.json({ error: 'Failed to delete provider' }, { status: 500 });
        }
    });
} 