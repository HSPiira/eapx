import { withRouteMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { getPaginationParams } from '@/lib/api-utils';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { categorySelectFields } from '@/lib/select-fields';

export async function GET(request: NextRequest) {
    return withRouteMiddleware(request, async () => {
        const { searchParams } = new URL(request.url);
        const { page, limit, offset, search } = getPaginationParams(searchParams);

        const where: Prisma.ServiceCategoryWhereInput = {
            OR: search
                ? [
                    { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
                    { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
                ]
                : undefined,
            deletedAt: null,
        };

        const cacheKey = `categories:${page}:${limit}:${search}`;
        const cached = await cache.get(cacheKey);
        if (cached) return NextResponse.json(cached);

        const totalCount = await prisma.serviceCategory.count({ where });
        const categories = await prisma.serviceCategory.findMany({
            where,
            select: categorySelectFields,
            skip: offset,
            take: limit,
            orderBy: { name: 'asc' },
        });

        const response = {
            data: categories,
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

        if (!body.name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        try {
            const category = await prisma.serviceCategory.create({
                data: {
                    name: body.name,
                    description: body.description,
                    metadata: body.metadata,
                },
                select: categorySelectFields,
            });

            await cache.deleteByPrefix('categories:');
            return NextResponse.json(category, { status: 201 });
        } catch (error) {
            console.error('Error creating category:', error);
            return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
        }
    });
} 