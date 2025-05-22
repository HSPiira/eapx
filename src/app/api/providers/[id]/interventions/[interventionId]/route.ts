import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = Promise<{ id: string, interventionId: string }>;

export async function GET(request: NextRequest, { params }: { params: Params }) {
    try {
        const { id: providerId, interventionId } = await params;
        const intervention = await prisma.intervention.findFirst({
            where: {
                id: interventionId,
                serviceProviderId: providerId
            }
        });
        if (!intervention) {
            return NextResponse.json({ error: 'Intervention not found' }, { status: 404 });
        }
        return NextResponse.json(intervention);
    } catch (error) {
        console.error('Error fetching provider intervention:', error);
        return NextResponse.json(
            { error: 'Failed to fetch provider intervention' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest, { params }: { params: Params }) {
    try {
        const { id: providerId, interventionId } = await params;
        const body = await request.json();
        if (!body.name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }
        const updated = await prisma.intervention.update({
            where: { id: interventionId, serviceProviderId: providerId },
            data: {
                name: body.name,
                description: body.description,
                serviceId: body.serviceId,
                status: body.status,
                duration: body.duration,
                capacity: body.capacity,
                prerequisites: body.prerequisites,
                isPublic: body.isPublic,
                price: body.price,
                metadata: body.metadata,
            },
        });
        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating provider intervention:', error);
        return NextResponse.json(
            { error: 'Failed to update provider intervention' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Params }) {
    try {
        const { id: providerId, interventionId } = await params;
        await prisma.intervention.update({
            where: { id: interventionId, serviceProviderId: providerId },
            data: { deletedAt: new Date() }
        });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting provider intervention:', error);
        return NextResponse.json(
            { error: 'Failed to delete provider intervention' },
            { status: 500 }
        );
    }
} 