import { withRouteMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { getPaginationParams } from '@/lib/api-utils';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma, SessionStatus } from '@prisma/client';
import { sessionSelectFields } from '@/lib/select-fields';

export async function GET(request: NextRequest) {
    return withRouteMiddleware(request, async () => {
        const { searchParams } = new URL(request.url);
        const { page, limit, offset, search } = getPaginationParams(searchParams);
        const status = searchParams.get('status') as SessionStatus | undefined;
        const serviceId = searchParams.get('serviceId') || undefined;
        const providerId = searchParams.get('providerId') || undefined;
        const beneficiaryId = searchParams.get('beneficiaryId') || undefined;

        if (status && !Object.values(SessionStatus).includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

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

        const cacheKey = `sessions:${page}:${limit}:${search}:${status}:${serviceId}:${providerId}:${beneficiaryId}`;
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