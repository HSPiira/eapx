import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = Promise<{ id: string }>;

export async function GET(request: NextRequest, { params }: { params: Params }) {
    try {
        const { id: providerId } = await params;
        const sessions = await prisma.careSession.findMany({
            where: {
                providerId: providerId
            },
            orderBy: { scheduledAt: 'desc' },
        });
        return NextResponse.json(sessions);
    } catch (error) {
        console.error('Error fetching provider sessions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch provider sessions' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest, { params }: { params: Params }) {
    try {
        const { id: providerId } = await params;
        const body = await request.json();
        if (!body.scheduledAt) {
            return NextResponse.json({ error: 'scheduledAt is required' }, { status: 400 });
        }
        const session = await prisma.careSession.create({
            data: {
                providerId: providerId,
                interventionId: body.interventionId,
                clientId: body.clientId,
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
        return NextResponse.json(session);
    } catch (error) {
        console.error('Error creating provider session:', error);
        return NextResponse.json(
            { error: 'Failed to create provider session' },
            { status: 500 }
        );
    }
} 