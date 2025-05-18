import { NextResponse } from 'next/server';
import { withApiMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { getPaginationParams } from '@/lib/api-utils';
import { WorkStatus, ServiceProviderType } from '@prisma/client';

export async function GET(request: Request) {
    return withApiMiddleware(request, async (request: Request) => {
        const { page, limit, offset, search, status } = getPaginationParams(request);
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') as ServiceProviderType | null;

        // Build where clause
        const where: any = {
            deletedAt: null,
        };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { contactEmail: { contains: search, mode: 'insensitive' } },
                { contactPhone: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (status) {
            where.status = status as WorkStatus;
        }

        if (type) {
            where.type = type;
        }

        // Get total count for pagination
        const totalCount = await prisma.serviceProvider.count({ where });

        // Generate cache key
        const cacheKey = `service-providers:${page}:${limit}:${search}:${status}:${type}`;

        // Check cache first
        const cached = await cache.get(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        // Fetch providers with pagination
        const providers = await prisma.serviceProvider.findMany({
            where,
            select: {
                id: true,
                name: true,
                type: true,
                contactEmail: true,
                contactPhone: true,
                location: true,
                qualifications: true,
                specializations: true,
                availability: true,
                rating: true,
                isVerified: true,
                status: true,
                metadata: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        services: true,
                        sessions: true,
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
            data: providers,
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
        if (!body.name || !body.type) {
            return NextResponse.json(
                { error: 'Name and type are required' },
                { status: 400 }
            );
        }

        // Create new provider
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
                status: body.status || 'ACTIVE',
                metadata: body.metadata,
            },
            select: {
                id: true,
                name: true,
                type: true,
                contactEmail: true,
                contactPhone: true,
                location: true,
                qualifications: true,
                specializations: true,
                availability: true,
                rating: true,
                isVerified: true,
                status: true,
                metadata: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        services: true,
                        sessions: true,
                    },
                },
            },
        });

        // Invalidate cache
        await cache.deleteByPrefix('service-providers:');

        return NextResponse.json(newProvider, { status: 201 });
    });
} 