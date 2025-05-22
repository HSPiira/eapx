import { withRouteMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { NextRequest, NextResponse } from 'next/server';

type Params = Promise<{ id: string }>;

// GET /api/providers/[id]
export async function GET(request: NextRequest, { params }: { params: Params }) {
    return withRouteMiddleware(request, async () => {
        const { id } = await params;
        const cacheKey = `provider:${id}`;
        const cached = await cache.get(cacheKey);
        if (cached) return NextResponse.json(cached);

        const provider = await prisma.serviceProvider.findUnique({
            where: { id, deletedAt: null },
        });

        if (!provider) {
            return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
        }

        await cache.set(cacheKey, provider);
        return NextResponse.json(provider);
    });
}

// PUT /api/providers/[id]
export async function PUT(request: NextRequest, { params }: { params: Params }) {
    return withRouteMiddleware(request, async () => {
        const { id } = await params;
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }

        // Example: Require name
        if (!body.name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        // Check for duplicate name (excluding self)
        const existingProvider = await prisma.serviceProvider.findFirst({
            where: {
                name: body.name,
                id: { not: id },
                deletedAt: null
            }
        });
        if (existingProvider) {
            return NextResponse.json(
                { error: 'Provider with this name already exists' },
                { status: 400 }
            );
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
                    rating: body.rating,
                    isVerified: body.isVerified,
                    metadata: body.metadata,
                    status: body.status,
                    deletedAt: body.deletedAt
                },
            });
            await cache.delete(`provider:${id}`);
            await cache.invalidateByTags(['providers']);
            return NextResponse.json(updatedProvider);
        } catch (error) {
            console.error('Error updating provider:', error);
            return NextResponse.json({ error: 'Failed to update provider' }, { status: 500 });
        }
    });
}

// DELETE /api/providers/[id]
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
    return withRouteMiddleware(request, async () => {
        const { id } = await params;
        try {
            const deletedProvider = await prisma.serviceProvider.update({
                where: { id, deletedAt: null },
                data: {
                    deletedAt: new Date()
                },
                select: {
                    id: true,
                    name: true,
                    type: true
                }
            });
            await cache.delete(`provider:${id}`);
            await cache.invalidateByTags(['providers']);
            return NextResponse.json(deletedProvider);
        } catch (error) {
            console.error('Error deleting provider:', error);
            return NextResponse.json({ error: 'Failed to delete provider' }, { status: 500 });
        }
    });
} 