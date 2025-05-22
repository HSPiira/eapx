import { withRouteMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { NextRequest, NextResponse } from 'next/server';
import { AssignmentStatus, Frequency } from '@prisma/client';
import { assignmentSelectFields } from '@/lib/select-fields';
import { isAdmin } from '@/lib/auth-utils';
import { validateDate, validateRequiredFields, validateEnumValue } from '@/lib/api-utils';

type Params = Promise<{ id: string }>;

export async function GET(
    request: NextRequest,
    { params }: { params: Params }
) {
    return withRouteMiddleware(request, async ({ session }) => {
        if (!(await isAdmin(session))) {
            return NextResponse.json(
                { error: 'Forbidden - Admin access required' },
                { status: 403 }
            );
        }

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
    return withRouteMiddleware(request, async ({ session }) => {
        if (!(await isAdmin(session))) {
            return NextResponse.json(
                { error: 'Forbidden - Admin access required' },
                { status: 403 }
            );
        }

        const { id } = await params;

        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }

        // Validate required fields
        const requiredFieldsResult = validateRequiredFields(body, ['serviceId', 'contractId', 'startDate']);
        if (!requiredFieldsResult.isValid) {
            return NextResponse.json({ error: requiredFieldsResult.error }, { status: 400 });
        }

        // Validate status if provided
        const statusResult = validateEnumValue(body.status, AssignmentStatus, 'status');
        if (!statusResult.isValid) {
            return NextResponse.json({ error: statusResult.error }, { status: 400 });
        }

        // Validate frequency if provided
        const frequencyResult = validateEnumValue(body.frequency, Frequency, 'frequency');
        if (!frequencyResult.isValid) {
            return NextResponse.json({ error: frequencyResult.error }, { status: 400 });
        }

        // Validate dates
        const startDateResult = validateDate(body.startDate, 'start date');
        if (!startDateResult.isValid) {
            return NextResponse.json({ error: startDateResult.error }, { status: 400 });
        }

        const endDateResult = validateDate(body.endDate, 'end date');
        if (!endDateResult.isValid) {
            return NextResponse.json({ error: endDateResult.error }, { status: 400 });
        }

        try {
            const updatedAssignment = await prisma.serviceAssignment.update({
                where: { id },
                data: {
                    serviceId: body.serviceId,
                    contractId: body.contractId,
                    clientId: body.clientId,
                    status: (body.status || 'PENDING') as AssignmentStatus,
                    ...(startDateResult.date && { startDate: startDateResult.date }),
                    ...(endDateResult.date && { endDate: endDateResult.date }),
                    frequency: body.frequency as Frequency,
                    metadata: body.metadata,
                },
                select: assignmentSelectFields,
            });

            await cache.delete(`assignment:${id}`);
            await cache.invalidateByTags(['assignments']);
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
    return withRouteMiddleware(request, async ({ session }) => {
        if (!(await isAdmin(session))) {
            return NextResponse.json(
                { error: 'Forbidden - Admin access required' },
                { status: 403 }
            );
        }

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
            await cache.invalidateByTags(['assignments']);
            return NextResponse.json(deletedAssignment);
        } catch (error) {
            console.error('Error deleting assignment:', error);
            return NextResponse.json({ error: 'Failed to delete assignment' }, { status: 500 });
        }
    });
} 