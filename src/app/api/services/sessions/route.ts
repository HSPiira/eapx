import { withRouteMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { getPaginationParams } from '@/lib/api-utils';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma, SessionStatus } from '@prisma/client';
import { sessionSelectFields } from '@/lib/select-fields';
import { sendSessionRequestEmail } from '@/services/email.service';
import { auth } from '@/middleware/auth'; // Auth.js v5 universal import

export async function GET(request: NextRequest) {
    return withRouteMiddleware(request, async () => {
        const { searchParams } = new URL(request.url);
        const { page, limit, offset, search } = getPaginationParams(searchParams);
        const status = searchParams.get('status') as SessionStatus | undefined;
        const serviceId = searchParams.get('serviceId') || undefined;
        const providerId = searchParams.get('providerId') || undefined;
        const beneficiaryId = searchParams.get('beneficiaryId') || undefined;
        const staffId = searchParams.get('staffId') || undefined;
        request.headers.get('x-user-role');
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
        // if (userRole !== 'ADMIN') {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'User ID not found in session' },
                { status: 401 }
            );
        }
        const userId = session.user.id;
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
        // } else if (staffId) {
        //     where.staffId = staffId;
        // }

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
            console.log('body', body);
        } catch {
            return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }

        // Use Auth.js v5 universal auth() to get session
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'User ID not found in session' },
                { status: 401 }
            );
        }
        // Handle session request from staff
        if (body.staffId) {
            // Only check that the staff exists
            const staff = await prisma.staff.findUnique({
                where: { id: body.staffId }
            });
            if (!staff) {
                return NextResponse.json(
                    { error: 'Staff member not found' },
                    { status: 404 }
                );
            }

            // Validate counselor if specified
            if (body.counselorId) {
                console.log('body.counselorId', body.counselorId);
                const counselor = await prisma.serviceProvider.findUnique({
                    where: { id: body.counselorId }
                });
                console.log('counselor', counselor);

                if (!counselor) {
                    return NextResponse.json(
                        { error: 'Preferred counselor not found' },
                        { status: 404 }
                    );
                }
            }
            console.log('counselorId', body.counselorId);

            // Get the default counseling intervention
            const counselingIntervention = await prisma.intervention.findFirst({
                where: { id: body.interventionId }
            });
            if (!counselingIntervention) {
                return NextResponse.json(
                    { error: 'Counseling intervention not found' },
                    { status: 404 }
                );
            }
            console.log('counselingIntervention', counselingIntervention);
            // Create the session request
            const sessionRequest = await prisma.serviceSession.create({
                data: {
                    staffId: body.staffId,
                    providerId: body.counselorId || '',
                    serviceId: counselingIntervention.id, // Use Intervention id
                    scheduledAt: body.preferredDate || new Date(),
                    status: SessionStatus.SCHEDULED,
                    duration: 60, // Default 1-hour session
                    metadata: {
                        requestMethod: body.requestMethod,
                        requestNotes: body.requestNotes
                    }
                },
                select: sessionSelectFields,
            });
            console.log('sessionRequest', sessionRequest);

            // Send email notification (replace mock data with real mapping as needed)
            try {
                await sendSessionRequestEmail(
                    {
                        companyId: body.companyId,
                        staffId: body.staffId,
                        counselorId: body.counselorId,
                        interventionId: body.interventionId,
                        sessionMethod: body.sessionMethod,
                        date: new Date(sessionRequest.scheduledAt).toISOString(),
                        startTime: body.startTime,
                        endTime: body.endTime,
                        sessionType: body.sessionType,
                        companyName: body.companyName,
                        staffName: body.staffName,
                        counselorName: body.counselorName,
                        notes: (typeof sessionRequest.metadata === 'object' && sessionRequest.metadata !== null && 'requestNotes' in sessionRequest.metadata && typeof sessionRequest.metadata.requestNotes === 'string') ? sessionRequest.metadata.requestNotes : '',
                        duration: body.duration,
                        isGroupSession: body.isGroupSession
                    },
                    {
                        staff: { email: body.staffEmail, name: body.staffName },
                        counselor: { email: body.counselorEmail, name: body.counselorName },
                        admin: { email: body.adminEmail, name: body.adminName }, // TODO: Map real admin
                    }
                );
                console.log('email sent');
            } catch (e) {
                console.error('Failed to send session request email:', e);
            }

            await cache.deleteByPrefix('sessions:');
            return NextResponse.json(sessionRequest);
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