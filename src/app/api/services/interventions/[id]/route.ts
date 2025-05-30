import { withRouteMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { NextRequest, NextResponse } from 'next/server';
import { interventionSelectFields } from '@/lib/select-fields';
import { BaseStatus } from '@prisma/client';
import { badRequest, internalError, notFound, ok } from '@/lib/response';

type Params = Promise<{ id: string }>;

export async function GET(
    request: NextRequest,
    { params }: { params: Params }
) {
    return withRouteMiddleware(request, async () => {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: 'Intervention ID is required' }, { status: 400 });
        }
        const intervention = await prisma.intervention.findUnique({
            where: { id },
            select: {
                ...interventionSelectFields,
                service: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        if (!intervention) {
            return NextResponse.json({ error: 'Intervention not found' }, { status: 404 });
        }
        return NextResponse.json(intervention);
    });
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Params }
) {
    return withRouteMiddleware(request, async () => {
        const { id } = await params;

        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }

        if (!body.name || !body.serviceId) {
            return NextResponse.json({ error: 'Name and service are required' }, { status: 400 });
        }

        try {
            const updated = await prisma.intervention.update({
                where: { id },
                data: {
                    name: body.name,
                    description: body.description,
                    serviceId: body.serviceId,
                    status: body.status as BaseStatus,
                    duration: body.duration,
                    capacity: body.capacity,
                    prerequisites: body.prerequisites,
                    isPublic: body.isPublic,
                    price: body.price,
                    metadata: body.metadata,
                    serviceProviderId: body.serviceProviderId,
                },
                select: {
                    ...interventionSelectFields,
                    service: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });

            await cache.delete(`intervention:${id}`);
            await cache.deleteByPrefix('interventions:');

            return NextResponse.json(updated);
        } catch (error) {
            console.error('Error updating intervention:', error);
            return NextResponse.json({ error: 'Failed to update intervention' }, { status: 500 });
        }
    });
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Params }
) {
    return withRouteMiddleware(request, async () => {
        const { id } = await params;
        if (!id) return badRequest("Intervention ID is required");

        try {
            const result = await prisma.$transaction(async (tx) => {
                const existing = await tx.intervention.findUnique({ where: { id } });
                if (!existing) throw new Error("NOT_FOUND");

                const updated = await tx.intervention.update({
                    where: { id },
                    data: { deletedAt: new Date() },
                });

                // Optional: soft-delete related records
                // await tx.interventionLog.updateMany({ where: { interventionId: id }, data: { deletedAt: new Date() } });

                return updated;
            });

            return ok({ success: true, id: result.id });
        } catch (error) {
            if ((error as Error).message === "NOT_FOUND") {
                return notFound("Intervention not found");
            }

            console.error("Delete transaction failed:", error);
            return internalError("Failed to delete intervention");
        }
    });
} 