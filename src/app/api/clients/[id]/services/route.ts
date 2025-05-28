import { withRouteMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { getPaginationParams } from '@/lib/api-utils';
import { AssignmentStatus, Frequency, Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Create Zod enums from Prisma enums
const assignmentStatusEnum = z.enum(Object.values(AssignmentStatus) as [string, ...string[]]);
const frequencyEnum = z.enum(Object.values(Frequency) as [string, ...string[]]);

type Params = Promise<{ id: string }>;

// Validation schema for service assignment creation/update
const serviceAssignmentSchema = z.object({
    serviceId: z.string(),
    status: assignmentStatusEnum.optional(),
    startDate: z.string().transform(str => new Date(str)),
    endDate: z.string().transform(str => new Date(str)).optional().nullable(),
    frequency: frequencyEnum,
    metadata: z.record(z.unknown()).optional().nullable(),
});

export async function GET(
    request: NextRequest,
    { params }: { params: Params }
) {
    return withRouteMiddleware(request, async () => {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const { page, limit, offset, search, status } = getPaginationParams(searchParams);
        const categoryId = searchParams.get('categoryId') || undefined;
        const hasSessions = searchParams.get('hasSessions') === 'true' ? true :
            searchParams.get('hasSessions') === 'false' ? false : undefined;

        if (status && status !== 'all') {
            if (!Object.values(AssignmentStatus).includes(status as AssignmentStatus)) {
                return NextResponse.json({
                    error: `Invalid status value. Must be one of: ${Object.values(AssignmentStatus).join(', ')}`,
                }, { status: 400 });
            }
        }

        const where: Prisma.ServiceAssignmentWhereInput = {
            contract: {
                clientId: id,
            },
            deletedAt: null,
            OR: search
                ? [
                    { service: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } },
                    { service: { description: { contains: search, mode: Prisma.QueryMode.insensitive } } },
                ]
                : undefined,
            status: status && status !== 'all' ? (status as AssignmentStatus) : undefined,
            service: {
                // Remove categoryId filter
            },
            ...(hasSessions !== undefined && {
                service: {
                    ServiceSession: hasSessions ? { some: {} } : { none: {} },
                },
            }),
        };

        const cacheKey = `clients:${id}:services:${page}:${limit}:${search}:${status}:${categoryId}:${hasSessions}`;
        const cached = await cache.get(cacheKey);
        if (cached) return NextResponse.json(cached);

        const totalCount = await prisma.serviceAssignment.count({ where });
        const services = await prisma.serviceAssignment.findMany({
            where,
            include: {
                service: {
                    include: {
                        ServiceSession: true,
                    },
                },
            },
            skip: offset,
            take: limit,
            orderBy: { createdAt: 'desc' },
        });

        const response = {
            data: services,
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

export async function POST(
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

        // Validate request body
        const validationResult = serviceAssignmentSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json({
                error: 'Validation failed',
                details: validationResult.error.errors,
            }, { status: 400 });
        }

        // Check if service exists
        const service = await prisma.service.findUnique({
            where: { id: body.serviceId },
        });

        if (!service) {
            return NextResponse.json({
                error: 'Service not found',
            }, { status: 404 });
        }

        // Get active contract for the client
        const contract = await prisma.contract.findFirst({
            where: {
                clientId: id,
                status: 'ACTIVE',
                deletedAt: null,
            },
        });

        if (!contract) {
            return NextResponse.json({
                error: 'No active contract found for this client',
            }, { status: 400 });
        }

        const newServiceAssignment = await prisma.serviceAssignment.create({
            data: {
                contractId: contract.id,
                serviceId: body.serviceId,
                status: body.status || 'PENDING',
                startDate: body.startDate,
                endDate: body.endDate,
                frequency: body.frequency,
                metadata: body.metadata,
            },
            include: {
                service: {
                    include: {
                        ServiceSession: true,
                    },
                },
            },
        });

        await cache.deleteByPrefix(`clients:${id}:services:`);
        return NextResponse.json(newServiceAssignment, { status: 201 });
    });
} 