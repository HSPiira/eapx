import { NextResponse } from 'next/server';
import { auth } from '@/middleware/auth';
import { cache } from '@/lib/cache';
import { rateLimiter } from '@/lib/rate-limiter';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET /api/industries/[id]
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;

        // Try to get from cache first
        const cacheKey = `industry:${id}`;
        const cachedIndustry = await cache.get(cacheKey);
        if (cachedIndustry) {
            return NextResponse.json(cachedIndustry);
        }

        // Fetch industry from database
        const industry = await prisma.industry.findUnique({
            where: { id },
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
            }
        });

        if (!industry) {
            return NextResponse.json(
                { error: 'Industry not found' },
                { status: 404 }
            );
        }

        // Cache the result
        await cache.set(cacheKey, industry);

        return NextResponse.json(industry);
    } catch (error) {
        console.error('Error fetching industry:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

// PUT /api/industries/[id]
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;
        const body = await request.json();

        // Input validation
        if (!body.name) {
            return NextResponse.json(
                { error: 'Name is required' },
                { status: 400 }
            );
        }

        // Check for duplicate name (excluding current industry)
        const existingIndustry = await prisma.industry.findFirst({
            where: {
                name: body.name,
                id: { not: id },
                deletedAt: null
            }
        });

        if (existingIndustry) {
            return NextResponse.json(
                { error: 'Industry with this name already exists' },
                { status: 400 }
            );
        }

        // Update industry
        const updatedIndustry = await prisma.industry.update({
            where: { id },
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
                },
                children: {
                    select: {
                        id: true,
                        name: true,
                        code: true
                    }
                }
            }
        });

        // Invalidate caches
        await cache.delete(`industry:${id}`);
        await cache.delete('industries:1:10'); // Invalidate first page of industries list

        return NextResponse.json(updatedIndustry);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return NextResponse.json(
                    { error: 'Industry not found' },
                    { status: 404 }
                );
            }
            if (error.code === 'P2003') {
                return NextResponse.json(
                    { error: 'Parent industry not found' },
                    { status: 404 }
                );
            }
        }
        console.error('Error updating industry:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

// DELETE /api/industries/[id]
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;

        // Check if industry has children
        const hasChildren = await prisma.industry.findFirst({
            where: {
                parentId: id,
                deletedAt: null
            }
        });

        if (hasChildren) {
            return NextResponse.json(
                { error: 'Cannot delete industry with child industries' },
                { status: 400 }
            );
        }

        // Check if industry is used by any clients
        const hasClients = await prisma.client.findFirst({
            where: {
                industryId: id,
                deletedAt: null
            }
        });

        if (hasClients) {
            return NextResponse.json(
                { error: 'Cannot delete industry that is assigned to clients' },
                { status: 400 }
            );
        }

        // Soft delete industry
        await prisma.industry.update({
            where: { id },
            data: {
                deletedAt: new Date()
            }
        });

        // Invalidate caches
        await cache.delete(`industry:${id}`);
        await cache.delete('industries:1:10'); // Invalidate first page of industries list

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return NextResponse.json(
                    { error: 'Industry not found' },
                    { status: 404 }
                );
            }
        }
        console.error('Error deleting industry:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
} 