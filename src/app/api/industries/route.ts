import { NextResponse } from 'next/server';
import { auth } from '@/middleware/auth';
import { cache } from '@/lib/cache';
import { rateLimiter } from '@/lib/rate-limiter';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET /api/industries
export async function GET(request: Request) {
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

        // Pagination and filtering
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
        const offset = (page - 1) * limit;
        const search = searchParams.get('search') || '';
        const parentId = searchParams.get('parentId');

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
        await cache.set(cacheKey, response);

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching industries:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

// POST /api/industries
export async function POST(request: Request) {
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
        await cache.delete('industries:1:10'); // Invalidate first page

        return NextResponse.json(newIndustry, { status: 201 });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2003') {
                return NextResponse.json(
                    { error: 'Parent industry not found' },
                    { status: 404 }
                );
            }
        }
        console.error('Error creating industry:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
} 