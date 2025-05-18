import { NextResponse } from 'next/server';
import { withApiMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';

export async function GET(
    _request: Request,
    { params }: { params: { id: string } }
) {
    return withApiMiddleware(_request, async () => {
        const { id } = params;

        // Check cache first
        const cacheKey = `service-session:${id}`;
        const cached = await cache.get(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        const session = await prisma.serviceSession.findUnique({
            where: { id },
            select: {
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
                        createdAt: true,
                    },
                },
            },
        });

        if (!session) {
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            );
        }

        // Cache the result
        await cache.set(cacheKey, session);

        return NextResponse.json(session);
    });
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    return withApiMiddleware(request, async (request) => {
        const { id } = params;
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
        if (!body.serviceId || !body.providerId || !body.scheduledAt) {
            return NextResponse.json(
                { error: 'Service, provider, and scheduled date are required' },
                { status: 400 }
            );
        }

        // Update session
        const updatedSession = await prisma.serviceSession.update({
            where: { id },
            data: {
                serviceId: body.serviceId,
                providerId: body.providerId,
                staffId: body.staffId,
                beneficiaryId: body.beneficiaryId,
                scheduledAt: new Date(body.scheduledAt),
                completedAt: body.completedAt ? new Date(body.completedAt) : undefined,
                status: body.status,
                notes: body.notes,
                feedback: body.feedback,
                duration: body.duration,
                location: body.location,
                cancellationReason: body.cancellationReason,
                rescheduleCount: body.rescheduleCount,
                isGroupSession: body.isGroupSession,
                metadata: body.metadata,
            },
            select: {
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
            },
        });

        // Invalidate caches
        await cache.delete(`service-session:${id}`);
        await cache.invalidateByTags(['service-sessions']);

        return NextResponse.json(updatedSession);
    });
}

export async function DELETE(
    _request: Request,
    { params }: { params: { id: string } }
) {
    return withApiMiddleware(_request, async () => {
        const { id } = params;

        // Check if session has feedback
        const sessionWithFeedback = await prisma.serviceSession.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        SessionFeedback: true,
                    },
                },
            },
        });

        if (sessionWithFeedback?._count.SessionFeedback > 0) {
            return NextResponse.json(
                { error: 'Cannot delete session with associated feedback' },
                { status: 400 }
            );
        }

        // Soft delete the session
        const deletedSession = await prisma.serviceSession.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
            select: {
                id: true,
                scheduledAt: true,
            },
        });

        // Invalidate caches
        await cache.delete(`service-session:${id}`);
        await cache.invalidateByTags(['service-sessions']);

        return NextResponse.json(deletedSession);
    });
} 