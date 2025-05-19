import { NextResponse } from 'next/server';
import { withApiMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { getPaginationParams } from '@/lib/api-utils';
import { BaseStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';

// Define a constant for service selection fields
const serviceSelectFields = {
    id: true,
    name: true,
    description: true,
    categoryId: true,
    status: true,
    duration: true,
    capacity: true,
    prerequisites: true,
    isPublic: true,
    price: true,
    metadata: true,
    createdAt: true,
    updatedAt: true,
    category: {
        select: {
            id: true,
            name: true,
        },
    },
    ServiceProvider: {
        select: {
            id: true,
            name: true,
            type: true,
        },
    },
} as const;

export async function GET(request: Request) {
    return withApiMiddleware(request, async (request: Request) => {
        const { page, limit, offset, search, status } = getPaginationParams(request);
        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get('categoryId');

        // Validate status parameter
        if (status && status !== 'all') {
            if (!Object.values(BaseStatus).includes(status as BaseStatus)) {
                return NextResponse.json(
                    { error: `Invalid status value. Must be one of: ${Object.values(BaseStatus).join(', ')}` },
                    { status: 400 }
                );
            }
        }

        // Build where clause
        const where: Prisma.ServiceWhereInput = {
            deletedAt: null,
            OR: search ? [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ] as Prisma.ServiceWhereInput[] : undefined,
            categoryId: categoryId || undefined,
            status: status && status !== 'all' ? status as BaseStatus : undefined
        };

        // Generate cache key _before_ potentially expensive DB calls  
        const cacheKey = `services:${page}:${limit}:${search}:${status}`;

        // Check cache first  
        const cached = await cache.get(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        // Get total count for pagination  
        const totalCount = await prisma.service.count({ where });

        // Fetch services with pagination
        const services = await prisma.service.findMany({
            where,
            select: serviceSelectFields,
            skip: offset,
            take: limit,
            orderBy: {
                createdAt: 'desc',
            },
        });

        const response = {
            data: services,
            metadata: {
                total: totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit)
            }
        };

        // Cache the results
        await cache.set(cacheKey, response);

        return NextResponse.json(response);
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
        if (!body.name || !body.categoryId) {
            return NextResponse.json(
                { error: 'Name and category are required' },
                { status: 400 }
            );
        }

        // Create new service
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

        // Invalidate cache
        await cache.deleteByPrefix('services:');

        return NextResponse.json(newService, { status: 201 });
    });
} 