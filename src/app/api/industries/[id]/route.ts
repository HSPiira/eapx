import { withRouteMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth-utils';
import { industrySelectFields } from '@/lib/select-fields';

type Params = Promise<{ id: string }>;

// GET /api/industries/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Params }
) {
    return withRouteMiddleware(request, async (session) => {
        // Authorization - Check if user is admin
        if (!(await isAdmin(session))) {
            return NextResponse.json(
                { error: 'Forbidden - Admin access required' },
                { status: 403 }
            );
        }

        const { id } = await params;

        const cacheKey = `industry:${id}`;
        const cached = await cache.get(cacheKey);
        if (cached) return NextResponse.json(cached);

        const industry = await prisma.industry.findUnique({
            where: { id, deletedAt: null },
            select: industrySelectFields,
        });

        if (!industry) {
            return NextResponse.json({ error: 'Industry not found' }, { status: 404 });
        }

        await cache.set(cacheKey, industry);
        return NextResponse.json(industry);
    });
}

// PUT /api/industries/[id]
export async function PUT(
    request: NextRequest,
    { params }: { params: Params }
) {
    return withRouteMiddleware(request, async (session) => {
        // Authorization - Check if user is admin
        if (!(await isAdmin(session))) {
            return NextResponse.json(
                { error: 'Forbidden - Admin access required' },
                { status: 403 }
            );
        }

        const { id } = await params;

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

        try {
            const updatedIndustry = await prisma.industry.update({
                where: { id, deletedAt: null },
                data: {
                    name: body.name,
                    code: body.code,
                    description: body.description,
                    parentId: body.parentId,
                    externalId: body.externalId,
                    metadata: body.metadata
                },
                select: industrySelectFields,
            });

            await cache.delete(`industry:${id}`);
            await cache.invalidateByTags(['industries']);
            return NextResponse.json(updatedIndustry);
        } catch (error) {
            console.error('Error updating industry:', error);
            return NextResponse.json({ error: 'Failed to update industry' }, { status: 500 });
        }
    });
}

// DELETE /api/industries/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Params }
) {
    return withRouteMiddleware(request, async (session) => {
        // Authorization - Check if user is admin
        if (!(await isAdmin(session))) {
            return NextResponse.json(
                { error: 'Forbidden - Admin access required' },
                { status: 403 }
            );
        }

        const { id } = await params;

        try {
            // Check if industry has children
            const hasChildren = await prisma.industry.findFirst({
                where: { parentId: id, deletedAt: null }
            });

            if (hasChildren) {
                return NextResponse.json(
                    { error: 'Cannot delete industry with child industries' },
                    { status: 400 }
                );
            }

            const deletedIndustry = await prisma.industry.update({
                where: { id, deletedAt: null },
                data: {
                    deletedAt: new Date()
                },
                select: {
                    id: true,
                    name: true,
                    code: true
                }
            });

            await cache.delete(`industry:${id}`);
            await cache.invalidateByTags(['industries']);
            return NextResponse.json(deletedIndustry);
        } catch (error) {
            console.error('Error deleting industry:', error);
            return NextResponse.json({ error: 'Failed to delete industry' }, { status: 500 });
        }
    });
} 