import { withRouteMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { NextRequest, NextResponse } from 'next/server';
import { sessionSelectFields } from '@/lib/select-fields';
import { parseRequestBody, validateSessionData } from '@/lib/api-utils';

type Params = Promise<{ id: string }>;

export async function GET(
    request: NextRequest,
    { params }: { params: Params }
) {
    return withRouteMiddleware(request, async () => {
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
    return withRouteMiddleware(request, async () => {
        const { id } = await params;

        const { body, error: parseError } = await parseRequestBody(request);
        if (parseError) {
            return NextResponse.json({ error: parseError }, { status: 400 });
        }

        const validationResult = validateSessionData(body);
        if (!validationResult.isValid) {
            return NextResponse.json({ error: validationResult.error }, { status: 400 });
        }

        try {
            const updatedSession = await prisma.serviceSession.update({
                where: { id },
                data: {
                    ...validationResult.data!,
                    scheduledAt: validationResult.data!.scheduledAt || undefined,
                    completedAt: validationResult.data!.completedAt || undefined,
                    rescheduleCount: validationResult.data!.rescheduleCount || undefined,
                    duration: validationResult.data!.duration || undefined,
                    notes: validationResult.data!.notes || undefined,
                    feedback: validationResult.data!.feedback || undefined,
                    location: validationResult.data!.location || undefined,
                    cancellationReason: validationResult.data!.cancellationReason || undefined,
                    isGroupSession: validationResult.data!.isGroupSession || undefined,
                    metadata: validationResult.data!.metadata ? JSON.parse(JSON.stringify(validationResult.data!.metadata)) : undefined,
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
    return withRouteMiddleware(request, async () => {
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