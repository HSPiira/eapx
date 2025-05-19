import { withRouteMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { getPaginationParams } from '@/lib/api-utils';
import { isAdmin } from '@/lib/auth-utils';
import { industrySelectFields } from '@/lib/select-fields';

export async function GET(request: NextRequest) {
    return withRouteMiddleware(request, async ({ session }) => {
        // Authorization - Check if user is admin
        if (!(await isAdmin(session))) {
            return NextResponse.json(
                {
                    error: 'Forbidden - Admin access required',
                    details: 'Your account does not have the required admin role to access this resource.',
                    code: 'MISSING_ADMIN_ROLE'
                },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const { page, limit, offset, search } = getPaginationParams(searchParams);
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
            select: industrySelectFields,
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

export async function POST(request: NextRequest) {
    return withRouteMiddleware(request, async ({ session }) => {
        // Authorization - Check if user is admin
        if (!(await isAdmin(session))) {
            return NextResponse.json(
                {
                    error: 'Forbidden - Admin access required',
                    details: 'Your account does not have the required admin role to access this resource.',
                    code: 'MISSING_ADMIN_ROLE'
                },
                { status: 403 }
            );
        }

        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }

        if (!body.name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
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

        try {
            const newIndustry = await prisma.industry.create({
                data: {
                    name: body.name,
                    code: body.code,
                    description: body.description,
                    parentId: body.parentId,
                    externalId: body.externalId,
                    metadata: body.metadata
                },
                select: industrySelectFields
            });

            // Invalidate cache
            await cache.invalidateByTags(['industries']);

            return NextResponse.json(newIndustry, { status: 201 });
        } catch (error) {
            console.error('Error creating industry:', error);
            return NextResponse.json({ error: 'Failed to create industry' }, { status: 500 });
        }
    });
}

// PUT /api/industries
export async function PUT(request: NextRequest) {
    return withRouteMiddleware(request, async ({ session }) => {
        // Authorization - Check if user is admin
        if (!(await isAdmin(session))) {
            return NextResponse.json(
                {
                    error: 'Forbidden - Admin access required',
                    details: 'Your account does not have the required admin role to access this resource.',
                    code: 'MISSING_ADMIN_ROLE'
                },
                { status: 403 }
            );
        }

        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }

        if (!body.name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
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

        try {
            const updatedIndustry = await prisma.industry.update({
                where: { id: body.id, deletedAt: null },
                data: {
                    name: body.name,
                    code: body.code,
                    description: body.description,
                    parentId: body.parentId,
                    externalId: body.externalId,
                    metadata: body.metadata
                },
                select: industrySelectFields
            });

            // Invalidate caches
            await cache.delete(`industry:${body.id}`);
            await cache.invalidateByTags(['industries']);

            return NextResponse.json(updatedIndustry);
        } catch (error) {
            console.error('Error updating industry:', error);
            return NextResponse.json({ error: 'Failed to update industry' }, { status: 500 });
        }
    });
}

// DELETE /api/industries
export async function DELETE(request: NextRequest) {
    return withRouteMiddleware(request, async ({ session }) => {
        // Authorization - Check if user is admin
        if (!(await isAdmin(session))) {
            return NextResponse.json(
                {
                    error: 'Forbidden - Admin access required',
                    details: 'Your account does not have the required admin role to access this resource.',
                    code: 'MISSING_ADMIN_ROLE'
                },
                { status: 403 }
            );
        }

        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }

        if (!body.id) {
            return NextResponse.json({ error: 'Industry ID is required' }, { status: 400 });
        }

        try {
            // Check if industry has children
            const hasChildren = await prisma.industry.findFirst({
                where: { parentId: body.id, deletedAt: null }
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
                    industryId: body.id,
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
                where: { id: body.id, deletedAt: null },
                data: {
                    deletedAt: new Date()
                }
            });

            // Invalidate caches
            await cache.delete(`industry:${body.id}`);
            await cache.invalidateByTags(['industries']);

            return new NextResponse(null, { status: 204 });
        } catch (error) {
            console.error('Error deleting industry:', error);
            return NextResponse.json({ error: 'Failed to delete industry' }, { status: 500 });
        }
    });
} 