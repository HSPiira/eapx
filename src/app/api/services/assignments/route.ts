import { withRouteMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { getPaginationParams } from '@/lib/api-utils';
import { NextRequest, NextResponse } from 'next/server';
import { AssignmentStatus, Frequency, Prisma } from '@prisma/client';
import { assignmentSelectFields } from '@/lib/select-fields';

export async function GET(request: NextRequest) {
    return withRouteMiddleware(request, async (session) => {
        const { searchParams } = new URL(request.url);
        const { page, limit, offset, search, status } = getPaginationParams(searchParams);
        const serviceId = searchParams.get('serviceId') || undefined;
        const contractId = searchParams.get('contractId') || undefined;
        const clientId = searchParams.get('clientId') || undefined;

        if (status && status !== 'all') {
            if (!Object.values(AssignmentStatus).includes(status as AssignmentStatus)) {
                return NextResponse.json({
                    error: `Invalid status value. Must be one of: ${Object.values(AssignmentStatus).join(', ')}`,
                }, { status: 400 });
            }
        }

        const where: Prisma.ServiceAssignmentWhereInput = {
            deletedAt: null,
            OR: search
                ? [
                    { service: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } },
                    { client: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } },
                ]
                : undefined,
            serviceId: serviceId || undefined,
            contractId: contractId || undefined,
            clientId: clientId || undefined,
            status: status && status !== 'all' ? (status as AssignmentStatus) : undefined,
        };

        const cacheKey = `assignments:${page}:${limit}:${search}:${status}:${serviceId}:${contractId}:${clientId}`;
        const cached = await cache.get(cacheKey);
        if (cached) return NextResponse.json(cached);

        const totalCount = await prisma.serviceAssignment.count({ where });
        const assignments = await prisma.serviceAssignment.findMany({
            where,
            select: assignmentSelectFields,
            skip: offset,
            take: limit,
            orderBy: { createdAt: 'desc' },
        });

        const response = {
            data: assignments,
            metadata: {
                total: totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit),
            },
        };

        await cache.set(cacheKey, response);
        return NextResponse.json(response);
    });
}

export async function POST(request: NextRequest) {
    return withRouteMiddleware(request, async (session) => {
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }

        if (!body.serviceId || !body.contractId || !body.startDate) {
            return NextResponse.json({ error: 'Service, contract, and start date are required' }, { status: 400 });
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
            const newAssignment = await prisma.serviceAssignment.create({
                data: {
                    serviceId: body.serviceId,
                    contractId: body.contractId,
                    clientId: body.clientId,
                    status: (body.status || 'PENDING') as AssignmentStatus,
                    startDate,
                    endDate,
                    frequency: body.frequency,
                    metadata: body.metadata,
                },
                select: assignmentSelectFields,
            });

            await cache.deleteByPrefix('assignments:');
            return NextResponse.json(newAssignment, { status: 201 });
        } catch (error) {
            console.error('Error creating assignment:', error);
            return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 });
        }
    });
} 