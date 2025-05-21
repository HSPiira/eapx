import { withRouteMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { BaseStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { clientSelectFields } from '@/lib/select-fields/clients';
import { clientSchema } from '@/lib/validation/clients';

type Params = Promise<{ id: string }>;

export async function GET(
    request: NextRequest,
    { params }: { params: Params }
) {
    return withRouteMiddleware(request, async () => {
        const { id } = await params;
        const client = await prisma.client.findUnique({
            where: {
                id: id,
                deletedAt: null,
            },
            select: clientSelectFields,
        });

        if (!client) {
            return NextResponse.json(
                { error: 'Client not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(client);
    });
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Params }
) {
    return withRouteMiddleware(request, async ({ }) => {
        const { id } = await params;
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }

        const existingClient = await prisma.client.findUnique({
            where: { id: id },
        });

        if (!existingClient) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        // Validate the request body
        const validationResult = clientSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json({
                error: 'Validation failed',
                details: validationResult.error.errors,
            }, { status: 400 });
        }

        const updatedClient = await prisma.client.update({
            where: { id: id },
            data: {
                name: body.name,
                email: body.email,
                phone: body.phone,
                website: body.website,
                address: body.address,
                billingAddress: body.billingAddress,
                taxId: body.taxId,
                contactPerson: body.contactPerson,
                contactEmail: body.contactEmail,
                contactPhone: body.contactPhone,
                industryId: body.industryId,
                status: body.status as BaseStatus,
                preferredContactMethod: body.preferredContactMethod,
                timezone: body.timezone,
                isVerified: body.isVerified,
                notes: body.notes,
                metadata: body.metadata,
            },
            select: clientSelectFields,
        });

        await cache.deleteByPrefix('clients:');
        return NextResponse.json(updatedClient);
    });
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Params }
) {
    return withRouteMiddleware(request, async () => {
        const { id } = await params;
        const existingClient = await prisma.client.findUnique({
            where: { id: id },
        });

        if (!existingClient) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        // Soft delete by setting deletedAt
        await prisma.client.update({
            where: { id: id },
            data: { deletedAt: new Date() },
        });

        await cache.deleteByPrefix('clients:');
        return NextResponse.json({ message: 'Client deleted successfully' });
    });
} 