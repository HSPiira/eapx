import { withRouteMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { NextRequest, NextResponse } from 'next/server';
import { categorySelectFields, categoryWithServicesSelectFields } from '@/lib/select-fields';


type Params = Promise<{ id: string }>;

export async function GET(
    request: NextRequest,
    { params }: { params: Params }
) {
    return withRouteMiddleware(request, async () => {
        const { id } = await params;

        const cacheKey = `category:${id}`;
        const cached = await cache.get(cacheKey);
        if (cached) return NextResponse.json(cached);

        const category = await prisma.serviceCategory.findUnique({
            where: { id },
            select: categoryWithServicesSelectFields,
        });

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        await cache.set(cacheKey, category);
        return NextResponse.json(category);
    });
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Params }
) {
    return withRouteMiddleware(request, async () => {
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

        try {
            const updatedCategory = await prisma.serviceCategory.update({
                where: { id },
                data: {
                    name: body.name,
                    description: body.description,
                    metadata: body.metadata,
                },
                select: categorySelectFields,
            });

            await cache.delete(`category:${id}`);
            await cache.deleteByPrefix('categories:');

            return NextResponse.json(updatedCategory);
        } catch (error) {
            console.error('Error updating category:', error);
            return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
        }
    });
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Params }
) {
    return withRouteMiddleware(request, async () => {
        const { id } = await params;

        try {
            const deletedCategory = await prisma.serviceCategory.update({
                where: { id },
                data: { deletedAt: new Date() },
                select: { id: true, name: true },
            });

            await cache.delete(`category:${id}`);
            await cache.deleteByPrefix('categories:');

            return NextResponse.json(deletedCategory);
        } catch (error) {
            console.error('Error deleting category:', error);
            return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
        }
    });
} 