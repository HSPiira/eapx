import { NextResponse } from 'next/server';
import { auth } from '@/middleware/auth';
import { cache } from '@/lib/cache';
import { rateLimiter } from '@/lib/rate-limiter';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { withApiMiddleware } from '@/middleware/api-middleware';
import { getPaginationParams } from '@/lib/api-utils';
import { isAdmin } from '@/lib/auth-utils';

// GET /api/industries
export async function GET(request: Request) {
    return withApiMiddleware(request, async (request) => {
        // Authorization - Check if user is admin
        const session = await auth();
        if (!(await isAdmin(session))) {
            return NextResponse.json(
                { error: 'Forbidden - Admin access required' },
                { status: 403 }
            );
        }

        const { page, limit, offset, search } = getPaginationParams(request);
        const parentId = new URL(request.url).searchParams.get('parentId');

        // Cache key based on parameters
        const cacheKey = `industries:${page}:${limit}:${search}:${parentId}`;

        // Try to get from cache first
        const cachedData = await cache.get(cacheKey);
        if (cachedData) {
            return NextResponse.json(cachedData);
        }

        // Build where clause
        const where: Prisma.IndustryWhereInput = {
            deletedAt: null,
            ...(search ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { code: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ]
            } : {}),
            ...(parentId ? { parentId } : { parentId: null })
        };

        // Get total count for pagination metadata
        const totalCount = await prisma.industry.count({ where });

        // Fetch industries with pagination
        const industries = await prisma.industry.findMany({
            where,
            select: {
                id: true,
                name: true,
                code: true,
                description: true,
                parentId: true,
                externalId: true,
                metadata: true,
                createdAt: true,
                updatedAt: true,
                parent: {
                    select: {
                        id: true,
                        name: true,
                        code: true
                    }
                },
                children: {
                    select: {
                        id: true,
                        name: true,
                        code: true
                    }
                }
            },
            skip: offset,
            take: limit,
            orderBy: {
                name: 'asc'
            }
        });

        const response = {
            data: industries,
            metadata: {
                total: totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit)
            }
        };

        // Cache the results
        await cache.set(cacheKey, response, { tags: ['industries'] });

        return NextResponse.json(response);
    });
}

// POST /api/industries
export async function POST(request: Request) {
    return withApiMiddleware(request, async (request) => {
        // Authorization - Check if user is admin
        const session = await auth();
        if (!(await isAdmin(session))) {
            return NextResponse.json(
                { error: 'Forbidden - Admin access required' },
                { status: 403 }
            );
        }

        const body = await request.json();

        // Input validation
        if (!body.name) {
            return NextResponse.json(
                { error: 'Name is required' },
                { status: 400 }
            );
        }

        // Check for duplicate name
        const existingIndustry = await prisma.industry.findFirst({
            where: {
                name: body.name,
                deletedAt: null
            }
        });

        if (existingIndustry) {
            return NextResponse.json(
                { error: 'Industry with this name already exists' },
                { status: 400 }
            );
        }

        // Create new industry
        const newIndustry = await prisma.industry.create({
            data: {
                name: body.name,
                code: body.code,
                description: body.description,
                parentId: body.parentId,
                externalId: body.externalId,
                metadata: body.metadata
            },
            select: {
                id: true,
                name: true,
                code: true,
                description: true,
                parentId: true,
                externalId: true,
                metadata: true,
                createdAt: true,
                updatedAt: true,
                parent: {
                    select: {
                        id: true,
                        name: true,
                        code: true
                    }
                }
            }
        });

        // Invalidate cache
        await cache.invalidateByTags(['industries']);

        return NextResponse.json(newIndustry, { status: 201 });
    });
}

// PUT /api/industries
export async function PUT(request: Request) {
    try {
        // Rate limiting
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        if (!(await rateLimiter.isAllowed(ip))) {
            return NextResponse.json(
                { error: 'Too many requests' },
                { status: 429 }
            );
        }

        // Authentication
        const session = await auth();
        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Authorization - Check if user is admin
        if (!(await isAdmin(session))) {
            return NextResponse.json(
                { error: 'Forbidden - Admin access required' },
                { status: 403 }
            );
        }

        // ... rest of PUT implementation ...
    } catch (error) {
        console.error('Error updating industry:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

// DELETE /api/industries
export async function DELETE(request: Request) {
    try {
        // Rate limiting
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        if (!(await rateLimiter.isAllowed(ip))) {
            return NextResponse.json(
                { error: 'Too many requests' },
                { status: 429 }
            );
        }

        // Authentication
        const session = await auth();
        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Authorization - Check if user is admin
        if (!(await isAdmin(session))) {
            return NextResponse.json(
                { error: 'Forbidden - Admin access required' },
                { status: 403 }
            );
        }

        // ... rest of DELETE implementation ...
    } catch (error) {
        console.error('Error deleting industry:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
} 