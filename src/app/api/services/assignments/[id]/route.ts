import { withRouteMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { NextRequest, NextResponse } from 'next/server';
import { AssignmentStatus, Frequency } from '@prisma/client';
import { assignmentSelectFields } from '@/lib/select-fields';

type Params = Promise<{ id: string }>;

export async function GET(
    request: NextRequest,
    { params }: { params: Params }
) {
    return withRouteMiddleware(request, async (session) => {
        const { id } = await params;

        const cacheKey = `assignment:${id}`;
        const cached = await cache.get(cacheKey);
        if (cached) return NextResponse.json(cached);

        const assignment = await prisma.serviceAssignment.findUnique({
            where: { id },
            select: assignmentSelectFields,
        });

        if (!assignment) {
            return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
        }

        await cache.set(cacheKey, assignment);
        return NextResponse.json(assignment);
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

        if (!body.serviceId || !body.contractId || !body.startDate) {
            return NextResponse.json({ error: 'Service, contract, and start date are required' }, { status: 400 });
        }

        if (body.frequency && !Object.values(Frequency).includes(body.frequency)) {
            return NextResponse.json({ error: 'Invalid frequency' }, { status: 400 });
        }

        const startDate = new Date(body.startDate);
        if (isNaN(startDate.getTime())) {
            return NextResponse.json({ error: 'Invalid startDate' }, { status: 400 });
        }

        const endDate = body.endDate ? new Date(body.endDate) : undefined;
        if (endDate && isNaN(endDate.getTime())) {
            return NextResponse.json({ error: 'Invalid endDate' }, { status: 400 });
        }

        try {
            const updatedAssignment = await prisma.serviceAssignment.update({
                where: { id },
                data: {
                    serviceId: body.serviceId,
                    contractId: body.contractId,
                    clientId: body.clientId,
                    status: (body.status || 'PENDING') as AssignmentStatus,
                    startDate,
                    endDate,
                    frequency: body.frequency as Frequency,
                    metadata: body.metadata,
                },
                select: assignmentSelectFields,
            });

            await cache.delete(`assignment:${id}`);
            await cache.deleteByPrefix('assignments:');
            return NextResponse.json(updatedAssignment);
        } catch (error) {
            console.error('Error updating assignment:', error);
            return NextResponse.json({ error: 'Failed to update assignment' }, { status: 500 });
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
            const sessionCount = await prisma.serviceSession.count({
                where: {
                    service: {
                        assignments: {
                            some: {
                                id: id,
                            },
                        },
                    },
                },
            });

            if (sessionCount > 0) {
                return NextResponse.json({ error: 'Cannot delete assignment with associated sessions' }, { status: 400 });
            }

            const deletedAssignment = await prisma.serviceAssignment.update({
                where: { id },
                data: {
                    deletedAt: new Date(),
                },
                select: {
                    id: true,
                    startDate: true,
                },
            });

            await cache.delete(`assignment:${id}`);
            await cache.deleteByPrefix('assignments:');
            return NextResponse.json(deletedAssignment);
        } catch (error) {
            console.error('Error deleting assignment:', error);
            return NextResponse.json({ error: 'Failed to delete assignment' }, { status: 500 });
        }
    });
} 