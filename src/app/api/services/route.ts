import { withRouteMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { getPaginationParams } from '@/lib/api-utils';
import { BaseStatus, Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { serviceSelectFields } from '@/lib/select-fields/services';

export async function GET(request: NextRequest) {
    return withRouteMiddleware(request, async () => {
        const { searchParams } = new URL(request.url);
        const { page, limit, offset, search, status } = getPaginationParams(searchParams);
        const categoryId = searchParams.get('categoryId') || undefined;

        if (status && status !== 'all') {
            if (!Object.values(BaseStatus).includes(status as BaseStatus)) {
                return NextResponse.json({
                    error: `Invalid status value. Must be one of: ${Object.values(BaseStatus).join(', ')}`,
                }, { status: 400 });
            }
        }

        const where: Prisma.ServiceWhereInput = {
            deletedAt: null,
            OR: search
                ? [
                    { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
                    { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
                ]
                : undefined,
            categoryId: categoryId || undefined,
            status: status && status !== 'all' ? (status as BaseStatus) : undefined,
        };

        const cacheKey = `services:${page}:${limit}:${search}:${status}`;
        const cached = await cache.get(cacheKey);
        if (cached) return NextResponse.json(cached);

        const totalCount = await prisma.service.count({ where });
        const services = await prisma.service.findMany({
            where,
            select: serviceSelectFields,
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

export async function POST(request: NextRequest) {
    return withRouteMiddleware(request, async () => {
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }

        if (!body.name || !body.categoryId) {
            return NextResponse.json({ error: 'Name and category are required' }, { status: 400 });
        }

        const newService = await prisma.service.create({
            data: {
                name: body.name,
                description: body.description,
                categoryId: body.categoryId,
                status: (body.status || 'ACTIVE') as BaseStatus,
                duration: body.duration,
                capacity: body.capacity,
                prerequisites: body.prerequisites,
                isPublic: body.isPublic ?? true,
                price: body.price,
                metadata: body.metadata,
                serviceProviderId: body.serviceProviderId,
            },
            select: serviceSelectFields,
        });

        await cache.deleteByPrefix('services:');
        return NextResponse.json(newService, { status: 201 });
    });
}