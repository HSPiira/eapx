import { withRouteMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { getPaginationParams, validateDate, validateRequiredFields, validateEnumValue } from '@/lib/api-utils';
import { NextRequest, NextResponse } from 'next/server';
import { AssignmentStatus, Frequency, Prisma } from '@prisma/client';
import { assignmentSelectFields } from '@/lib/select-fields';

export async function GET(request: NextRequest) {
    return withRouteMiddleware(request, async () => {
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
    return withRouteMiddleware(request, async () => {
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
            const newAssignment = await prisma.serviceAssignment.create({
                data: {
                    serviceId: body.serviceId,
                    contractId: body.contractId,
                    clientId: body.clientId,
                    status: (body.status || 'PENDING') as AssignmentStatus,
                    startDate: startDateResult.date!,
                    endDate: endDateResult.date,
                    frequency: body.frequency as Frequency,
                    metadata: body.metadata,
                },
                select: assignmentSelectFields,
            });

            await cache.invalidateByTags(['assignments']);
            return NextResponse.json(newAssignment, { status: 201 });
        } catch (error) {
            console.error('Error creating assignment:', error);
            return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 });
        }
    });
} 