import { NextResponse } from 'next/server';
import { withApiMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { AssignmentStatus, Frequency } from '@prisma/client';

export async function GET(
    _request: Request,
    { params }: { params: { id: string } }
) {
    return withApiMiddleware(_request, async () => {
        const { id } = params;

        // Check cache first
        const cacheKey = `service-assignment:${id}`;
        const cached = await cache.get(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        const assignment = await prisma.serviceAssignment.findUnique({
            where: { id },
            select: {
                id: true,
                serviceId: true,
                contractId: true,
                clientId: true,
                status: true,
                startDate: true,
                endDate: true,
                frequency: true,
                metadata: true,
                createdAt: true,
                updatedAt: true,
                service: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },
                contract: {
                    select: {
                        id: true,
                        startDate: true,
                        endDate: true,
                        status: true,
                    },
                },
                client: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!assignment) {
            return NextResponse.json(
                { error: 'Assignment not found' },
                { status: 404 }
            );
        }

        // Cache the result
        await cache.set(cacheKey, assignment);

        return NextResponse.json(assignment);
    });
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    return withApiMiddleware(request, async (request: Request) => {
        const { id } = params;
        let body;

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: 'Invalid JSON in request body' },
                { status: 400 }
            );
        }

        // Validate required fields
        if (!body.serviceId || !body.contractId || !body.startDate) {
            return NextResponse.json(
                { error: 'Service, contract, and start date are required' },
                { status: 400 }
            );
        }

        // Update assignment
        const updatedAssignment = await prisma.serviceAssignment.update({
            where: { id },
            data: {
                serviceId: body.serviceId,
                contractId: body.contractId,
                clientId: body.clientId,
                status: (body.status || 'PENDING') as AssignmentStatus,
                startDate: new Date(body.startDate),
                endDate: body.endDate ? new Date(body.endDate) : undefined,
                frequency: body.frequency as Frequency,
                metadata: body.metadata,
            },
            select: {
                id: true,
                serviceId: true,
                contractId: true,
                clientId: true,
                status: true,
                startDate: true,
                endDate: true,
                frequency: true,
                metadata: true,
                createdAt: true,
                updatedAt: true,
                service: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },
                contract: {
                    select: {
                        id: true,
                        startDate: true,
                        endDate: true,
                        status: true,
                    },
                },
                client: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        // Invalidate caches
        await cache.delete(`service-assignment:${id}`);
        await cache.invalidateByTags(['service-assignments']);

        return NextResponse.json(updatedAssignment);
    });
}

export async function DELETE(
    _request: Request,
    { params }: { params: { id: string } }
) {
    return withApiMiddleware(_request, async () => {
        const { id } = params;

        // Check if assignment has sessions
        const sessionCount = await prisma.serviceSession.count({
            where: {
                service: {
                    assignments: {
                        some: {
                            id: id
                        }
                    }
                }
            }
        });

        if (sessionCount > 0) {
            return NextResponse.json(
                { error: 'Cannot delete assignment with associated sessions' },
                { status: 400 }
            );
        }

        // Soft delete the assignment
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

        // Invalidate caches
        await cache.delete(`service-assignment:${id}`);
        await cache.invalidateByTags(['service-assignments']);

        return NextResponse.json(deletedAssignment);
    });
} 