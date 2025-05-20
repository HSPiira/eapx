import { withRouteMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { getPaginationParams } from '@/lib/api-utils';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma, SessionStatus } from '@prisma/client';
import { sessionSelectFields } from '@/lib/select-fields';
import type { SessionRequest } from '@/types/session-booking';

export async function GET(request: NextRequest) {
    return withRouteMiddleware(request, async () => {
        const { searchParams } = new URL(request.url);
        const { page, limit, offset, search } = getPaginationParams(searchParams);
        const status = searchParams.get('status') as SessionStatus | undefined;
        const serviceId = searchParams.get('serviceId') || undefined;
        const providerId = searchParams.get('providerId') || undefined;
        const beneficiaryId = searchParams.get('beneficiaryId') || undefined;
        const staffId = searchParams.get('staffId') || undefined;
        const userId = request.headers.get('x-user-id');
        const userRole = request.headers.get('x-user-role');

        if (status && !Object.values(SessionStatus).includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        // Build the where clause based on user role and filters
        const where: Prisma.ServiceSessionWhereInput = {
            OR: search
                ? [
                    { service: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } },
                    { provider: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } },
                    { beneficiary: { profile: { fullName: { contains: search, mode: Prisma.QueryMode.insensitive } } } },
                ]
                : undefined,
            status: status || undefined,
            serviceId: serviceId || undefined,
            providerId: providerId || undefined,
            beneficiaryId: beneficiaryId || undefined,
            deletedAt: null,
        };

        // If not admin, only show sessions for the authenticated user's staff
        if (userRole !== 'ADMIN' && userId) {
            const staff = await prisma.staff.findFirst({
                where: { userId }
            });
            if (!staff) {
                return NextResponse.json(
                    { error: 'Staff member not found' },
                    { status: 404 }
                );
            }
            where.staffId = staff.id;
        } else if (staffId) {
            where.staffId = staffId;
        }

        const cacheKey = `sessions:${page}:${limit}:${search}:${status}:${serviceId}:${providerId}:${beneficiaryId}:${staffId}`;
        const cached = await cache.get(cacheKey);
        if (cached) return NextResponse.json(cached);

        const totalCount = await prisma.serviceSession.count({ where });
        const sessions = await prisma.serviceSession.findMany({
            where,
            select: sessionSelectFields,
            skip: offset,
            take: limit,
            orderBy: { scheduledAt: 'desc' },
        });

        const response = {
            data: sessions,
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

        const userId = request.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json(
                { error: 'User ID not found in request' },
                { status: 401 }
            );
        }

        // Handle session request from staff
        if (body.staffId) {
            // Validate staff exists and belongs to the authenticated user
            const staff = await prisma.staff.findFirst({
                where: {
                    id: body.staffId,
                    userId: userId
                }
            });

            if (!staff) {
                return NextResponse.json(
                    { error: 'Staff member not found or unauthorized' },
                    { status: 404 }
                );
            }

            // Validate counselor if specified
            if (body.preferredCounselorId) {
                const counselor = await prisma.serviceProvider.findUnique({
                    where: { id: body.preferredCounselorId }
                });

                if (!counselor) {
                    return NextResponse.json(
                        { error: 'Preferred counselor not found' },
                        { status: 404 }
                    );
                }
            }

            // Get the default counseling service
            const counselingService = await prisma.service.findFirst({
                where: {
                    name: 'Counseling Session',
                    status: 'ACTIVE'
                }
            });

            if (!counselingService) {
                return NextResponse.json(
                    { error: 'Counseling service not found' },
                    { status: 404 }
                );
            }

            // Create the session request
            const session = await prisma.serviceSession.create({
                data: {
                    staffId: body.staffId,
                    providerId: body.preferredCounselorId || '',
                    serviceId: counselingService.id,
                    scheduledAt: body.preferredDate || new Date(),
                    status: 'SCHEDULED',
                    duration: 60, // Default 1-hour session
                    metadata: {
                        requestMethod: body.requestMethod,
                        requestNotes: body.requestNotes
                    }
                },
                select: sessionSelectFields,
            });

            await cache.deleteByPrefix('sessions:');
            return NextResponse.json(session);
        }

        // Handle direct session creation
        if (!body.serviceId || !body.providerId || !body.beneficiaryId || !body.scheduledAt) {
            return NextResponse.json({ error: 'Service, provider, beneficiary, and scheduled date are required' }, { status: 400 });
        }

        const scheduledAt = new Date(body.scheduledAt);
        if (isNaN(scheduledAt.getTime())) {
            return NextResponse.json({ error: 'Invalid scheduledAt' }, { status: 400 });
        }

        try {
            const newSession = await prisma.serviceSession.create({
                data: {
                    serviceId: body.serviceId,
                    providerId: body.providerId,
                    beneficiaryId: body.beneficiaryId,
                    scheduledAt,
                    status: SessionStatus.SCHEDULED,
                    notes: body.notes,
                    feedback: body.feedback,
                    duration: body.duration,
                    location: body.location,
                    isGroupSession: body.isGroupSession || false,
                    metadata: body.metadata,
                },
                select: sessionSelectFields,
            });

            await cache.deleteByPrefix('sessions:');
            return NextResponse.json(newSession, { status: 201 });
        } catch (error) {
            console.error('Error creating session:', error);
            return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
        }
    });
} 