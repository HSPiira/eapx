import { withRouteMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { getPaginationParams } from '@/lib/api-utils';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { serviceSelectFields } from '@/lib/select-fields';

export async function GET(request: NextRequest) {
    return withRouteMiddleware(request, async () => {
        const { searchParams } = new URL(request.url);
        const { page, limit, offset, search } = getPaginationParams(searchParams);

        const where = {
            deletedAt: null,
            OR: search
                ? [
                    { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
                    { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
                ]
                : undefined,
        };

        const cacheKey = `services:${page}:${limit}:${search}`;
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

        if (!body.name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const newService = await prisma.service.create({
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
                deletedAt: true,
            },
        });

        await cache.deleteByPrefix('services:');
        return NextResponse.json(newService, { status: 201 });
    });
}