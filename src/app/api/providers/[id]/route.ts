import { withRouteMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { NextRequest, NextResponse } from 'next/server';
import { providerUpdateSchema } from '@/lib/validation/providers';

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

export async function PATCH(request: NextRequest, { params }: { params: Params }) {
    try {
        const body = await request.json();
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 });
        }

        // Log the incoming request data
        console.log('PATCH request for provider:', { id, body });

        // Convert empty strings to null for nullable fields
        ['contactPhone', 'location', 'rating'].forEach((field) => {
            if (body[field] === '') body[field] = null;
        });

        // Validate the request body
        const parseResult = providerUpdateSchema.safeParse(body);
        if (!parseResult.success) {
            console.error('Validation failed:', parseResult.error.flatten());
            return NextResponse.json({
                error: 'Validation failed',
                details: parseResult.error.flatten()
            }, { status: 400 });
        }

        const data = parseResult.data;

        // Only update provided fields
        const dataToUpdate: Record<string, unknown> = {};
        (Object.keys(data) as Array<keyof typeof data>).forEach((key) => {
            if (data[key] !== undefined) {
                dataToUpdate[key] = data[key];
            }
        });

        // Log the data being sent to Prisma
        console.log('Updating provider with data:', dataToUpdate);

        const updatedProvider = await prisma.serviceProvider.update({
            where: { id },
            data: dataToUpdate,
        });

        // Log the successful update
        console.log('Provider updated successfully:', updatedProvider);

        return NextResponse.json(updatedProvider);
    } catch (error) {
        // Log the full error details
        console.error('Error updating provider:', error);

        // Return a more detailed error response
        return NextResponse.json({
            error: 'Failed to update provider',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
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