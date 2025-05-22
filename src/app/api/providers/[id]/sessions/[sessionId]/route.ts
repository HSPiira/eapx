import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = Promise<{ id: string, sessionId: string }>;

export async function GET(request: NextRequest, { params }: { params: Params }) {
    try {
        const { id: providerId, sessionId } = await params;
        const session = await prisma.serviceSession.findFirst({
            where: {
                id: sessionId,
                providerId: providerId
            }
        });
        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }
        return NextResponse.json(session);
    } catch (error) {
        console.error('Error fetching provider session:', error);
        return NextResponse.json(
            { error: 'Failed to fetch provider session' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest, { params }: { params: Params }) {
    try {
        const { id: providerId, sessionId } = await params;
        const body = await request.json();
        if (!body.scheduledAt) {
            return NextResponse.json({ error: 'scheduledAt is required' }, { status: 400 });
        }
        const updated = await prisma.serviceSession.update({
            where: { id: sessionId, providerId: providerId },
            data: {
                serviceId: body.serviceId,
                staffId: body.staffId,
                beneficiaryId: body.beneficiaryId,
                scheduledAt: body.scheduledAt,
                completedAt: body.completedAt,
                status: body.status,
                notes: body.notes,
                feedback: body.feedback,
                duration: body.duration,
                location: body.location,
                cancellationReason: body.cancellationReason,
                rescheduleCount: body.rescheduleCount,
                isGroupSession: body.isGroupSession,
                metadata: body.metadata,
                checkInTime: body.checkInTime,
                checkOutTime: body.checkOutTime,
                followUpRequired: body.followUpRequired,
                followUpDate: body.followUpDate,
                providerStaffId: body.providerStaffId,
            },
        });
        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating provider session:', error);
        return NextResponse.json(
            { error: 'Failed to update provider session' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Params }) {
    try {
        const { id: providerId, sessionId } = await params;
        await prisma.serviceSession.update({
            where: { id: sessionId, providerId: providerId },
            data: { deletedAt: new Date() }
        });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting provider session:', error);
        return NextResponse.json(
            { error: 'Failed to delete provider session' },
            { status: 500 }
        );
    }
} 