import { withRouteMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { getPaginationParams } from '@/lib/api-utils';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma, BaseStatus } from '@prisma/client';
import { interventionSelectFields } from '@/lib/select-fields';

export async function GET(request: NextRequest) {
    return withRouteMiddleware(request, async () => {
        const { searchParams } = new URL(request.url);
        const { page, limit, offset, search, status } = getPaginationParams(searchParams);
        const serviceId = searchParams.get('serviceId') || undefined;

        if (status && status !== 'all') {
            if (!Object.values(BaseStatus).includes(status as BaseStatus)) {
                return NextResponse.json({
                    error: `Invalid status value. Must be one of: ${Object.values(BaseStatus).join(', ')}`,
                }, { status: 400 });
            }
        }

        const where: Prisma.InterventionWhereInput = {
            deletedAt: null,
            OR: search
                ? [
                    { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
                    { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
                ]
                : undefined,
            serviceId: serviceId || undefined,
            status: status && status !== 'all' ? (status as BaseStatus) : undefined,
        };

        const cacheKey = `interventions:${page}:${limit}:${search}:${status}:${serviceId}`;
        const cached = await cache.get(cacheKey);
        if (cached) return NextResponse.json(cached);

        const totalCount = await prisma.intervention.count({ where });
        const interventions = await prisma.intervention.findMany({
            where,
            select: {
                ...interventionSelectFields,
                service: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            skip: offset,
            take: limit,
            orderBy: { createdAt: 'desc' },
        });

        const response = {
            data: interventions,
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

        if (!body.name || !body.serviceId) {
            return NextResponse.json({ error: 'Name and serviceId are required' }, { status: 400 });
        }

        // Optionally, verify the service exists
        const service = await prisma.service.findUnique({ where: { id: body.serviceId } });
        if (!service) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }

        const newIntervention = await prisma.intervention.create({
            data: {
                name: body.name,
                description: body.description,
                serviceId: body.serviceId,
                status: (body.status || 'ACTIVE') as BaseStatus,
                duration: body.duration,
                capacity: body.capacity,
                prerequisites: body.prerequisites,
                isPublic: body.isPublic ?? true,
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

        await cache.deleteByPrefix('interventions:');
        return NextResponse.json(newIntervention, { status: 201 });
    });
} 