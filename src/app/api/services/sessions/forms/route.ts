import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import type { SessionFormData } from '@/types/session-booking';
import { withAuth } from '@/middleware/auth';

const prisma = new PrismaClient();

export const POST = withAuth(async (request: Request) => {
    try {
        const body = await request.json();
        const formData: Omit<SessionFormData, 'submittedAt'> = body;
        const userId = request.headers.get('x-user-id');
        const userRole = request.headers.get('x-user-role');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID not found in request' },
                { status: 401 }
            );
        }

        // Only counselors can submit session forms
        if (userRole !== 'COUNSELOR') {
            return NextResponse.json(
                { error: 'Only counselors can submit session forms' },
                { status: 403 }
            );
        }

        // Verify the session exists and belongs to the counselor
        const session = await prisma.serviceSession.findFirst({
            where: {
                id: formData.sessionId,
                providerId: formData.counselorId,
                status: 'COMPLETED'
            }
        });

        if (!session) {
            return NextResponse.json(
                { error: 'Session not found or unauthorized' },
                { status: 404 }
            );
        }

        // Create session form
        const form = await prisma.sessionForm.create({
            data: {
                sessionId: formData.sessionId,
                counselorId: formData.counselorId,
                formData: formData.formData,
                status: formData.status,
                expiresAt: formData.expiresAt,
                submittedAt: new Date()
            },
            include: {
                session: {
                    include: {
                        staff: {
                            include: {
                                profile: true
                            }
                        },
                        provider: {
                            include: {
                                profile: true
                            }
                        }
                    }
                }
            }
        });

        return NextResponse.json(form);
    } catch (error) {
        console.error('Error creating session form:', error);
        return NextResponse.json(
            { error: 'Failed to create session form' },
            { status: 500 }
        );
    }
});

export const GET = withAuth(async (request: Request) => {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');
        const counselorId = searchParams.get('counselorId');
        const userId = request.headers.get('x-user-id');
        const userRole = request.headers.get('x-user-role');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID not found in request' },
                { status: 401 }
            );
        }

        // Build the where clause
        const whereClause: any = {};

        if (sessionId) {
            whereClause.sessionId = sessionId;
        }

        if (counselorId) {
            // If requesting specific counselor's forms
            if (userRole !== 'ADMIN') {
                // Non-admins can only see their own forms
                const counselor = await prisma.serviceProvider.findFirst({
                    where: {
                        id: counselorId,
                        type: 'COUNSELOR',
                        status: 'ACTIVE'
                    }
                });

                if (!counselor) {
                    return NextResponse.json(
                        { error: 'Counselor not found or unauthorized' },
                        { status: 404 }
                    );
                }
            }
            whereClause.counselorId = counselorId;
        }

        const forms = await prisma.sessionForm.findMany({
            where: whereClause,
            include: {
                session: {
                    include: {
                        staff: {
                            include: {
                                profile: true
                            }
                        },
                        provider: {
                            include: {
                                profile: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                submittedAt: 'desc'
            }
        });

        return NextResponse.json(forms);
    } catch (error) {
        console.error('Error fetching session forms:', error);
        return NextResponse.json(
            { error: 'Failed to fetch session forms' },
            { status: 500 }
        );
    }
}); 