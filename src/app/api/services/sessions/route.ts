import { NextResponse } from 'next/server';
import { withApiMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { getPaginationParams } from '@/lib/api-utils';
import { SessionStatus, Prisma } from '@prisma/client';

// Define a constant for session selection fields
const sessionSelectFields = {
    id: true,
    serviceId: true,
    providerId: true,
    staffId: true,
    beneficiaryId: true,
    scheduledAt: true,
    completedAt: true,
    status: true,
    notes: true,
    feedback: true,
    duration: true,
    location: true,
    cancellationReason: true,
    rescheduleCount: true,
    isGroupSession: true,
    metadata: true,
    createdAt: true,
    updatedAt: true,
    service: {
        select: {
            id: true,
            name: true,
            description: true,
        },
    },
    provider: {
        select: {
            id: true,
            name: true,
            type: true,
        },
    },
    staff: {
        select: {
            id: true,
            profile: {
                select: {
                    fullName: true,
                },
            },
        },
    },
    beneficiary: {
        select: {
            id: true,
            profile: {
                select: {
                    fullName: true,
                },
            },
        },
    },
    SessionFeedback: {
        select: {
            id: true,
            rating: true,
            comment: true,
        },
    },
} as const;

export async function GET(request: Request) {
    return withApiMiddleware(request, async (request: Request) => {
        const { page, limit, offset, search, status } = getPaginationParams(request);
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const serviceId = searchParams.get('serviceId');
        const providerId = searchParams.get('providerId');
        const beneficiaryId = searchParams.get('beneficiaryId');

        // Build where clause
        const where: Prisma.ServiceSessionWhereInput = {
            deletedAt: null,
            OR: search ? [
                { service: { name: { contains: search, mode: 'insensitive' } } },
                { provider: { name: { contains: search, mode: 'insensitive' } } },
                { beneficiary: { profile: { fullName: { contains: search, mode: 'insensitive' } } } }
            ] : undefined,
            status: status && status !== 'all' ? status as SessionStatus : undefined,
            serviceId: serviceId || undefined,
            providerId: providerId || undefined,
            beneficiaryId: beneficiaryId || undefined,
        };

        if (startDate) {
            where.scheduledAt = {
                gte: new Date(startDate),
                ...(where.scheduledAt as Prisma.DateTimeFilter | undefined || {}),
            };
        }

        if (endDate) {
            where.scheduledAt = {
                lte: new Date(endDate),
                ...(where.scheduledAt as Prisma.DateTimeFilter | undefined || {}),
            };
        }

        // Get total count for pagination
        const totalCount = await prisma.serviceSession.count({ where });

        // Generate cache key
        const cacheKey = `service-sessions:${page}:${limit}:${search}:${status}:${startDate}:${endDate}`;

        // Check cache first
        const cached = await cache.get(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        // Fetch sessions with pagination
        const sessions = await prisma.serviceSession.findMany({
            where,
            select: sessionSelectFields,
            skip: offset,
            take: limit,
            orderBy: {
                scheduledAt: 'desc',
            },
        });

        const response = {
            data: sessions,
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
        } catch {
            return NextResponse.json(
                { error: 'Invalid JSON in request body' },
                { status: 400 }
            );
        }

        // Validate required fields
        if (!body.serviceId || !body.providerId || !body.scheduledAt) {
            return NextResponse.json(
                { error: 'Service, provider, and scheduled date are required' },
                { status: 400 }
            );
        }

        // Create new session
        const newSession = await prisma.serviceSession.create({
            data: {
                serviceId: body.serviceId,
                providerId: body.providerId,
                staffId: body.staffId,
                beneficiaryId: body.beneficiaryId,
                scheduledAt: new Date(body.scheduledAt),
                status: body.status || 'SCHEDULED',
                notes: body.notes,
                duration: body.duration,
                location: body.location,
                isGroupSession: body.isGroupSession || false,
                metadata: body.metadata,
            },
            select: sessionSelectFields,
        });

        // Invalidate cache
        await cache.deleteByPrefix('service-sessions:');

        return NextResponse.json(newSession, { status: 201 });
    });
} 