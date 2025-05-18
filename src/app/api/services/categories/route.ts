import { NextResponse } from 'next/server';
import { withApiMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { getPaginationParams } from '@/lib/api-utils';

export async function GET(request: Request) {
    return withApiMiddleware(request, async (request) => {
        const { page, limit, offset, search } = getPaginationParams(request);

        // Build where clause
        const where: any = {
            deletedAt: null,
        };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Get total count for pagination
        const totalCount = await prisma.serviceCategory.count({ where });

        // Generate cache key
        const cacheKey = `service-categories:${page}:${limit}:${search}`;

        // Check cache first
        const cached = await cache.get(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        // Fetch categories with pagination
        const categories = await prisma.serviceCategory.findMany({
            where,
            select: {
                id: true,
                name: true,
                description: true,
                metadata: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        services: true,
                    },
                },
            },
            skip: offset,
            take: limit,
            orderBy: {
                createdAt: 'desc',
            },
        });

        const response = {
            data: categories,
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
    return withApiMiddleware(request, async (request) => {
        let body;
        try {
            body = await request.json();
        } catch (error) {
            return NextResponse.json(
                { error: 'Invalid JSON in request body' },
                { status: 400 }
            );
        }

        // Validate required fields
        if (!body.name) {
            return NextResponse.json(
                { error: 'Name is required' },
                { status: 400 }
            );
        }

        // Create new category
        const newCategory = await prisma.serviceCategory.create({
            data: {
                name: body.name,
                description: body.description,
                metadata: body.metadata,
            },
            select: {
                id: true,
                name: true,
                description: true,
                metadata: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        services: true,
                    },
                },
            },
        });

        // Invalidate cache
        await cache.deleteByPrefix('service-categories:');

        return NextResponse.json(newCategory, { status: 201 });
    });
} 