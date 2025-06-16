import { withRouteMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { getPaginationParams } from '@/lib/api-utils';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma, SessionStatus } from '@prisma/client';
import { sessionSelectFields } from '@/lib/select-fields';
import { sendSessionRequestEmail } from '@/services/email.service';
import { auth } from '@/middleware/auth'; // Auth.js v5 universal import
import { z } from 'zod';

const sessionRequestSchema = z.object({
    clientId: z.string(),
    staffId: z.string(),
    counselorId: z.string().optional(),
    interventionId: z.string(),
    preferredDate: z.string().optional(),
    requestMethod: z.string().optional(),
    requestNotes: z.string().optional(),
    companyId: z.string().optional(),
    sessionMethod: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    sessionType: z.string().optional(),
    companyName: z.string().optional(),
    staffName: z.string().optional(),
    counselorName: z.string().optional(),
    duration: z.number().optional(),
    isGroupSession: z.boolean().optional(),
    staffEmail: z.string().optional(),
    counselorEmail: z.string().optional(),
    adminEmail: z.string().optional(),
    adminName: z.string().optional(),
});

export async function GET(request: NextRequest) {
    return withRouteMiddleware(request, async () => {
        const { searchParams } = new URL(request.url);
        const { page, limit, offset, search } = getPaginationParams(searchParams);
        const status = searchParams.get('status') as SessionStatus | undefined;
        const interventionId = searchParams.get('interventionId') || undefined;
        const providerId = searchParams.get('providerId') || undefined;
        const beneficiaryId = searchParams.get('beneficiaryId') || undefined;

        try {
            if (status && !Object.values(SessionStatus).includes(status)) {
                return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
            }

            // Build the where clause based on user role and filters
            const where: Prisma.CareSessionWhereInput = {
                OR: search
                    ? [
                        { intervention: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } },
                        { provider: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } },
                        { beneficiary: { profile: { fullName: { contains: search, mode: Prisma.QueryMode.insensitive } } } },
                    ]
                    : undefined,
                status: status || undefined,
                interventionId: interventionId || undefined,
                providerId: providerId || undefined,
                beneficiaryId: beneficiaryId || undefined,
                deletedAt: null,
            };

            // Get authenticated user's session
            const session = await auth();
            if (!session?.user?.id) {
                return NextResponse.json(
                    { error: 'User ID not found in session' },
                    { status: 401 }
                );
            }

            // Get user's client ID for tenant isolation
            const staff = await prisma.staff.findFirst({
                where: { userId: session.user.id },
                select: { clientId: true }
            });

            if (!staff?.clientId) {
                return NextResponse.json(
                    { error: 'User not associated with any client' },
                    { status: 401 }
                );
            }

            // Add client ID to where clause for tenant isolation
            where.clientId = staff.clientId;

            const cacheKey = `sessions:${staff.clientId}:${page}:${limit}:${search}:${status}:${interventionId}:${providerId}:${beneficiaryId}`;
            const cached = await cache.get(cacheKey);
            if (cached) return NextResponse.json(cached);

            const totalCount = await prisma.careSession.count({ where });
            const sessions = await prisma.careSession.findMany({
                where,
                select: sessionSelectFields,
                skip: offset,
                take: limit,
                orderBy: { scheduledAt: 'desc' },
            });

            // Get creator information from audit logs
            const sessionIds = sessions.map(s => s.id);
            const auditLogs = await prisma.auditLog.findMany({
                where: {
                    entityType: 'CareSession',
                    entityId: { in: sessionIds },
                    action: 'CREATE'
                },
                select: {
                    entityId: true,
                    userId: true,
                    User: {
                        select: {
                            email: true,
                            profile: {
                                select: {
                                    fullName: true
                                }
                            }
                        }
                    }
                }
            });

            // Map creator information to sessions
            const sessionsWithCreator = sessions.map(session => {
                const auditLog = auditLogs.find(log => log.entityId === session.id);
                return {
                    ...session,
                    creator: auditLog ? {
                        id: auditLog.userId,
                        email: auditLog.User?.email,
                        name: auditLog.User?.profile?.fullName
                    } : null
                };
            });

            const response = {
                data: sessionsWithCreator,
                metadata: {
                    total: totalCount,
                    page,
                    limit,
                    totalPages: Math.ceil(totalCount / limit),
                },
            };

            await cache.set(cacheKey, response);
            return NextResponse.json(response);
        } catch (error) {
            console.error('Error fetching sessions:', error);
            return NextResponse.json(
                { error: 'Failed to fetch sessions' },
                { status: 500 }
            );
        }
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

        try {
            const session = await auth();
            if (!session?.user?.id) {
                return NextResponse.json(
                    { error: 'User ID not found in session' },
                    { status: 401 }
                );
            }

            // DRAFT CREATION: Only clientId provided
            if (body.clientId && Object.keys(body).length === 1) {
                const draft = await prisma.careSession.create({
                    data: {
                        clientId: body.clientId,
                        status: 'UNCONFIRMED',
                    },
                });

                // Create audit log for draft creation
                await prisma.auditLog.create({
                    data: {
                        action: 'CREATE',
                        entityType: 'CareSession',
                        entityId: draft.id,
                        userId: session.user.id,
                        data: { status: 'UNCONFIRMED' }
                    }
                });

                return NextResponse.json({ data: draft }, { status: 201 });
            }

            // Handle session request from staff
            if (body.staffId) {
                // Validate request body
                const validationResult = sessionRequestSchema.safeParse(body);
                if (!validationResult.success) {
                    return NextResponse.json(
                        { error: 'Invalid request body', details: validationResult.error.format() },
                        { status: 400 }
                    );
                }

                const validatedBody = validationResult.data;

                const staff = await prisma.staff.findUnique({
                    where: { id: validatedBody.staffId }
                });
                if (!staff) {
                    return NextResponse.json(
                        { error: 'Staff member not found' },
                        { status: 404 }
                    );
                }

                // Validate counselor if specified
                if (validatedBody.counselorId) {
                    const counselor = await prisma.serviceProvider.findUnique({
                        where: { id: validatedBody.counselorId }
                    });

                    if (!counselor) {
                        return NextResponse.json(
                            { error: 'Preferred counselor not found' },
                            { status: 404 }
                        );
                    }
                }

                // Get the default counseling intervention
                const counselingIntervention = await prisma.intervention.findFirst({
                    where: { id: validatedBody.interventionId }
                });
                if (!counselingIntervention) {
                    return NextResponse.json(
                        { error: 'Counseling intervention not found' },
                        { status: 404 }
                    );
                }

                // Create the session request
                const sessionRequest = await prisma.careSession.create({
                    data: {
                        clientId: validatedBody.clientId,
                        staffId: validatedBody.staffId,
                        providerId: validatedBody.counselorId || null,
                        interventionId: counselingIntervention.id,
                        scheduledAt: validatedBody.preferredDate ? new Date(validatedBody.preferredDate) : new Date(),
                        status: SessionStatus.SCHEDULED,
                        duration: 60,
                        metadata: {
                            requestMethod: validatedBody.requestMethod,
                            requestNotes: validatedBody.requestNotes
                        }
                    },
                    select: sessionSelectFields,
                });

                // Create audit log for session request
                await prisma.auditLog.create({
                    data: {
                        action: 'CREATE',
                        entityType: 'CareSession',
                        entityId: sessionRequest.id,
                        userId: session.user.id,
                        data: {
                            status: SessionStatus.SCHEDULED,
                            requestMethod: validatedBody.requestMethod,
                            requestNotes: validatedBody.requestNotes
                        }
                    }
                });

                // Send email notification
                try {
                    await sendSessionRequestEmail(
                        {
                            companyId: validatedBody.companyId || '',
                            staffId: validatedBody.staffId,
                            counselorId: validatedBody.counselorId || '',
                            interventionId: validatedBody.interventionId,
                            sessionMethod: validatedBody.sessionMethod || '',
                            date: sessionRequest.scheduledAt ? new Date(sessionRequest.scheduledAt).toISOString() : '',
                            startTime: validatedBody.startTime || '',
                            endTime: validatedBody.endTime || '',
                            sessionType: validatedBody.sessionType || '',
                            companyName: validatedBody.companyName || '',
                            staffName: validatedBody.staffName || '',
                            counselorName: validatedBody.counselorName || '',
                            notes: (typeof sessionRequest.metadata === 'object' && sessionRequest.metadata !== null && 'requestNotes' in sessionRequest.metadata && typeof sessionRequest.metadata.requestNotes === 'string') ? sessionRequest.metadata.requestNotes : '',
                            duration: validatedBody.duration || 60,
                            isGroupSession: validatedBody.isGroupSession || false
                        },
                        {
                            staff: { email: validatedBody.staffEmail || '', name: validatedBody.staffName || '' },
                            counselor: { email: validatedBody.counselorEmail || '', name: validatedBody.counselorName || '' },
                            admin: { email: validatedBody.adminEmail || '', name: validatedBody.adminName || '' },
                        }
                    );
                } catch (e) {
                    console.error('Failed to send session request email:', e);
                }

                await cache.deleteByPrefix('sessions:');
                return NextResponse.json(sessionRequest);
            }

            // Handle direct session creation
            if (!body.interventionId || !body.providerId || !body.beneficiaryId || !body.scheduledAt) {
                return NextResponse.json({ error: 'Intervention, provider, beneficiary, and scheduled date are required' }, { status: 400 });
            }

            const scheduledAt = new Date(body.scheduledAt);
            if (isNaN(scheduledAt.getTime())) {
                return NextResponse.json({ error: 'Invalid scheduledAt' }, { status: 400 });
            }

            const newSession = await prisma.careSession.create({
                data: {
                    clientId: body.clientId,
                    interventionId: body.interventionId,
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

            // Create audit log for direct session creation
            await prisma.auditLog.create({
                data: {
                    action: 'CREATE',
                    entityType: 'CareSession',
                    entityId: newSession.id,
                    userId: session.user.id,
                    data: {
                        status: SessionStatus.SCHEDULED,
                        interventionId: body.interventionId,
                        providerId: body.providerId,
                        beneficiaryId: body.beneficiaryId
                    }
                }
            });

            await cache.deleteByPrefix('sessions:');
            return NextResponse.json(newSession, { status: 201 });
        } catch (error) {
            console.error('Error creating session:', error);
            return NextResponse.json(
                { error: 'Failed to create session' },
                { status: 500 }
            );
        }
    });
} 