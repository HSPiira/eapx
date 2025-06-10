import { withRouteMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { AssignmentStatus, Frequency } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

type Params = Promise<{ id: string; serviceId: string }>;

// Create Zod enums from Prisma enums
const assignmentStatusEnum = z.enum(Object.values(AssignmentStatus) as [string, ...string[]]);
const frequencyEnum = z.enum(Object.values(Frequency) as [string, ...string[]]);

// Validation schema for service assignment update
const serviceAssignmentUpdateSchema = z.object({
    status: assignmentStatusEnum.optional(),
    startDate: z.string().transform(str => new Date(str)).optional(),
    endDate: z.string().transform(str => new Date(str)).optional().nullable(),
    frequency: frequencyEnum.optional(),
    metadata: z.record(z.unknown()).optional().nullable(),
});

export async function GET(
    request: NextRequest,
    { params }: { params: Params }
) {
    return withRouteMiddleware(request, async () => {
        const { id, serviceId } = await params;
        const serviceAssignment = await prisma.serviceAssignment.findFirst({
            where: {
                id: serviceId,
                contract: {
                    clientId: id,
                },
                deletedAt: null,
            },
            include: {
                service: {
                    include: {
                        CareSession: true,
                    },
                },
                contract: true,
            },
        });

        if (!serviceAssignment) {
            return NextResponse.json({ error: 'Service assignment not found' }, { status: 404 });
        }

        return NextResponse.json(serviceAssignment);
    });
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Params }
) {
    return withRouteMiddleware(request, async () => {
        const { id, serviceId } = await params;
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }

        // Validate request body
        const validationResult = serviceAssignmentUpdateSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json({
                error: 'Validation failed',
                details: validationResult.error.errors,
            }, { status: 400 });
        }

        const serviceAssignment = await prisma.serviceAssignment.findFirst({
            where: {
                id: serviceId,
                contract: {
                    clientId: id,
                },
                deletedAt: null,
            },
        });

        if (!serviceAssignment) {
            return NextResponse.json({ error: 'Service assignment not found' }, { status: 404 });
        }

        const updatedServiceAssignment = await prisma.serviceAssignment.update({
            where: { id: serviceId },
            data: {
                status: body.status,
                startDate: body.startDate,
                endDate: body.endDate,
                frequency: body.frequency,
                metadata: body.metadata,
            },
            include: {
                service: {
                    include: {
                        CareSession: true,
                    },
                },
                contract: true,
            },
        });

        await cache.deleteByPrefix(`clients:${id}:services:`);
        return NextResponse.json(updatedServiceAssignment);
    });
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Params }
) {
    return withRouteMiddleware(request, async () => {
        const { id, serviceId } = await params;
        const serviceAssignment = await prisma.serviceAssignment.findFirst({
            where: {
                id: serviceId,
                contract: {
                    clientId: id,
                },
                deletedAt: null,
            },
            include: {
                service: {
                    include: {
                        CareSession: true,
                    },
                },
            },
        });

        if (!serviceAssignment) {
            return NextResponse.json({ error: 'Service assignment not found' }, { status: 404 });
        }

        // Check if service has any sessions
        if (serviceAssignment.service.CareSession.length > 0) {
            return NextResponse.json({
                error: 'Cannot delete service assignment with active sessions',
            }, { status: 400 });
        }

        await prisma.serviceAssignment.update({
            where: { id: serviceId },
            data: { deletedAt: new Date() },
        });

        await cache.deleteByPrefix(`clients:${id}:services:`);
        return NextResponse.json({ message: 'Service assignment deleted successfully' });
    });
} 