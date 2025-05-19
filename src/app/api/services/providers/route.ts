import { withRouteMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { getPaginationParams } from '@/lib/api-utils';
import { WorkStatus, ServiceProviderType, Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { providerSelectFields } from '@/lib/select-fields';

export async function GET(request: NextRequest) {
    return withRouteMiddleware(request, async (session) => {
        const { searchParams } = new URL(request.url);
        const { page, limit, offset, search } = getPaginationParams(searchParams);
        const statusParam = searchParams.get('status') || '';
        const typeParam = searchParams.get('type') || '';

        // Validate status and type parameters
        if (statusParam && statusParam !== 'all') {
            if (!Object.values(WorkStatus).includes(statusParam as WorkStatus)) {
                return NextResponse.json({
                    error: `Invalid status value. Must be one of: ${Object.values(WorkStatus).join(', ')}`
                }, { status: 400 });
            }
        }

        if (typeParam && typeParam !== 'all') {
            if (!Object.values(ServiceProviderType).includes(typeParam as ServiceProviderType)) {
                return NextResponse.json({
                    error: `Invalid type value. Must be one of: ${Object.values(ServiceProviderType).join(', ')}`
                }, { status: 400 });
            }
        }

        // Build where clause
        const where: Prisma.ServiceProviderWhereInput = {
            deletedAt: null,
            OR: search ? [
                { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
                { contactEmail: { contains: search, mode: Prisma.QueryMode.insensitive } },
                { contactPhone: { contains: search, mode: Prisma.QueryMode.insensitive } }
            ] : undefined,
            type: typeParam && typeParam !== 'all' ? typeParam as ServiceProviderType : undefined,
            status: statusParam && statusParam !== 'all' ? statusParam as WorkStatus : undefined
        };

        // Generate cache key and check cache
        const cacheKey = `service-providers:${page}:${limit}:${search}:${statusParam}:${typeParam}`;
        const cached = await cache.get(cacheKey);
        if (cached) return NextResponse.json(cached);

        const totalCount = await prisma.serviceProvider.count({ where });
        const providers = await prisma.serviceProvider.findMany({
            where,
            select: providerSelectFields,
            skip: offset,
            take: limit,
            orderBy: {
                createdAt: 'desc',
            },
        });

        const response = {
            data: providers,
            metadata: {
                total: totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit)
            }
        };

        await cache.set(cacheKey, response);
        return NextResponse.json(response);
    });
}

export async function POST(request: NextRequest) {
    return withRouteMiddleware(request, async (session) => {
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }

        if (!body.name || !body.type) {
            return NextResponse.json({ error: 'Name and type are required' }, { status: 400 });
        }

        if (!Object.values(ServiceProviderType).includes(body.type)) {
            return NextResponse.json({
                error: `Invalid type value. Must be one of: ${Object.values(ServiceProviderType).join(', ')}`
            }, { status: 400 });
        }

        try {
            const newProvider = await prisma.serviceProvider.create({
                data: {
                    name: body.name,
                    type: body.type,
                    contactEmail: body.contactEmail,
                    contactPhone: body.contactPhone,
                    location: body.location,
                    qualifications: body.qualifications || [],
                    specializations: body.specializations || [],
                    availability: body.availability,
                    rating: body.rating,
                    isVerified: body.isVerified || false,
                    status: (body.status && Object.values(WorkStatus).includes(body.status)) ? body.status : WorkStatus.ACTIVE,
                    metadata: body.metadata,
                },
                select: providerSelectFields,
            });

            await cache.deleteByPrefix('service-providers:');
            return NextResponse.json(newProvider, { status: 201 });
        } catch (error) {
            console.error('Error creating provider:', error);
            return NextResponse.json({ error: 'Failed to create provider' }, { status: 500 });
        }
    });
} 