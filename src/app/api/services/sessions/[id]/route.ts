import { withRouteMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { NextRequest, NextResponse } from 'next/server';
import { SessionStatus } from '@prisma/client';
import { sessionSelectFields } from '@/lib/select-fields';

type Params = Promise<{ id: string }>;

export async function GET(
    request: NextRequest,
    { params }: { params: Params }
) {
    return withRouteMiddleware(request, async (authSession) => {
        const { id } = await params;

        const cacheKey = `session:${id}`;
        const cached = await cache.get(cacheKey);
        if (cached) return NextResponse.json(cached);

        const serviceSession = await prisma.serviceSession.findUnique({
            where: { id, deletedAt: null },
            select: sessionSelectFields,
        });

        if (!serviceSession) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        await cache.set(cacheKey, serviceSession);
        return NextResponse.json(serviceSession);
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

        if (body.status && !Object.values(SessionStatus).includes(body.status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        if (body.scheduledAt) {
            const scheduledAt = new Date(body.scheduledAt);
            if (isNaN(scheduledAt.getTime())) {
                return NextResponse.json({ error: 'Invalid scheduledAt' }, { status: 400 });
            }
            body.scheduledAt = scheduledAt;
        }

        if (body.completedAt) {
            const completedAt = new Date(body.completedAt);
            if (isNaN(completedAt.getTime())) {
                return NextResponse.json({ error: 'Invalid completedAt' }, { status: 400 });
            }
            body.completedAt = completedAt;
        }

        try {
            const updatedSession = await prisma.serviceSession.update({
                where: { id },
                data: {
                    serviceId: body.serviceId,
                    providerId: body.providerId,
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
                },
                select: sessionSelectFields,
            });

            await cache.delete(`session:${id}`);
            await cache.deleteByPrefix('sessions:');
            return NextResponse.json(updatedSession);
        } catch (error) {
            console.error('Error updating session:', error);
            return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
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
            const deletedSession = await prisma.serviceSession.update({
                where: { id },
                data: {
                    deletedAt: new Date(),
                },
                select: {
                    id: true,
                    scheduledAt: true,
                    status: true,
                },
            });

            await cache.delete(`session:${id}`);
            await cache.deleteByPrefix('sessions:');
            return NextResponse.json(deletedSession);
        } catch (error) {
            console.error('Error deleting session:', error);
            return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
        }
    });
} 