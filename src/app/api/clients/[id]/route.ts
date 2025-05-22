import { withRouteMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { NextRequest, NextResponse } from 'next/server';
import { clientSelectFields } from '@/lib/select-fields/clients';
import { withAuth } from '@/middleware/auth';

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

export const PUT = withAuth(async (request: NextRequest, ...args: unknown[]) => {
    try {
        const userId = request.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: 'User ID not found' }, { status: 401 });
        }

        const { id } = (args[0] as { params: { id: string } }).params;
        const body = await request.json();

        const updatedClient = await prisma.client.update({
            where: { id },
            data: body
        });

        await cache.deleteByPrefix('clients:');
        return NextResponse.json(updatedClient);
    } catch (error) {
        console.error('Error updating client:', error);
        return NextResponse.json(
            { error: 'Failed to update client' },
            { status: 500 }
        );
    }
});

export const DELETE = withAuth(async (request: NextRequest, ...args: unknown[]) => {
    try {
        const userId = request.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: 'User ID not found' }, { status: 401 });
        }

        const { id } = (args[0] as { params: { id: string } }).params;

        const existingClient = await prisma.client.findUnique({
            where: { id },
        });

        if (!existingClient) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        await prisma.client.delete({
            where: { id },
        });

        await cache.deleteByPrefix('clients:');
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting client:', error);
        return NextResponse.json(
            { error: 'Failed to delete client' },
            { status: 500 }
        );
    }
}); 