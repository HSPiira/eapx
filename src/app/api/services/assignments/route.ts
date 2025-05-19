import { NextResponse } from 'next/server';
import { withApiMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { AssignmentStatus, Frequency, Prisma } from '@prisma/client';
import { getPaginationParams } from '@/lib/api-utils';

export async function GET(request: Request) {
    return withApiMiddleware(request, async (request: Request) => {
        const { page, limit, offset, search, status } = getPaginationParams(request);
        const { searchParams } = new URL(request.url);
        const serviceId = searchParams.get('serviceId');
        const contractId = searchParams.get('contractId');
        const clientId = searchParams.get('clientId');

        // Check cache first
        const cacheKey = `service-assignments:${page}:${limit}:${search}:${status}:${serviceId}:${contractId}:${clientId}`;
        const cached = await cache.get(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        // Build where clause
        const where: Prisma.ServiceAssignmentWhereInput = {
            deletedAt: null,
            OR: search ? [
                { service: { name: { contains: search, mode: 'insensitive' } } },
                { contract: { name: { contains: search, mode: 'insensitive' } } },
                { client: { name: { contains: search, mode: 'insensitive' } } }
            ] as Prisma.ServiceAssignmentWhereInput[] : undefined,
            status: status && status !== 'all' ? status as AssignmentStatus : undefined,
            serviceId: serviceId || undefined,
            contractId: contractId || undefined,
            clientId: clientId || undefined,
        };

        // Get total count
        const total = await prisma.serviceAssignment.count({ where });

        // Get assignments
        const assignments = await prisma.serviceAssignment.findMany({
            where,
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
            orderBy: { createdAt: 'desc' },
            skip: offset,
            take: limit,
        });

        const result = {
            data: assignments,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        };

        // Cache the result
        await cache.set(cacheKey, result);

        return NextResponse.json(result);
    });
}

export async function POST(request: Request) {
    return withApiMiddleware(request, async (request: Request) => {
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

        // Create assignment
        const assignment = await prisma.serviceAssignment.create({
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
        await cache.invalidateByTags(['service-assignments']);

        return NextResponse.json(assignment);
    });
} 