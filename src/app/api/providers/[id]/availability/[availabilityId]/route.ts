import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = Promise<{ id: string, availabilityId: string }>;

export async function GET(request: NextRequest, { params }: { params: Params }) {
    try {
        const { id: providerId, availabilityId } = await params;
        const slot = await prisma.counselorAvailability.findFirst({
            where: {
                id: availabilityId,
                counselorId: providerId
            }
        });
        if (!slot) {
            return NextResponse.json({ error: 'Availability slot not found' }, { status: 404 });
        }
        return NextResponse.json(slot);
    } catch (error) {
        console.error('Error fetching provider availability slot:', error);
        return NextResponse.json(
            { error: 'Failed to fetch provider availability slot' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest, { params }: { params: Params }) {
    try {
        const { id: providerId, availabilityId } = await params;
        const body = await request.json();
        if (!body.startTime || !body.endTime) {
            return NextResponse.json({ error: 'startTime and endTime are required' }, { status: 400 });
        }
        const updated = await prisma.counselorAvailability.update({
            where: { id: availabilityId, counselorId: providerId },
            data: {
                startTime: body.startTime,
                endTime: body.endTime,
                isAvailable: body.isAvailable,
                notes: body.notes,
                metadata: body.metadata,
            },
        });
        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating provider availability slot:', error);
        return NextResponse.json(
            { error: 'Failed to update provider availability slot' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Params }) {
    try {
        const { id: providerId, availabilityId } = await params;
        await prisma.counselorAvailability.update({
            where: { id: availabilityId, counselorId: providerId },
            data: { deletedAt: new Date() }
        });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting provider availability slot:', error);
        return NextResponse.json(
            { error: 'Failed to delete provider availability slot' },
            { status: 500 }
        );
    }
} 