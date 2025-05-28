import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import type { CounselorAvailability } from '@/types/session-booking';
import { withAuth } from '@/middleware/auth';
import { Prisma } from '@prisma/client';
const prisma = new PrismaClient();

export const POST = withAuth(async (request: Request) => {
    try {
        const body = await request.json();
        const availabilityData: Omit<CounselorAvailability, 'id' | 'createdAt' | 'updatedAt' | 'counselor'> = body;
        const userId = request.headers.get('x-user-id');
        const userRole = request.headers.get('x-user-role');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID not found in request' },
                { status: 401 }
            );
        }

        // Only counselors can set their availability
        if (userRole !== 'COUNSELOR') {
            return NextResponse.json(
                { error: 'Only counselors can set availability' },
                { status: 403 }
            );
        }

        // Verify the counselor exists and belongs to the authenticated user
        const counselor = await prisma.serviceProvider.findFirst({
            where: {
                id: availabilityData.counselorId,
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

        // Create availability record
        const availability = await prisma.counselorAvailability.create({
            data: {
                counselorId: availabilityData.counselorId,
                startTime: new Date(availabilityData.startTime),
                endTime: new Date(availabilityData.endTime),
                isAvailable: availabilityData.isAvailable,
                notes: availabilityData.notes,
                // metadata: availabilityData.metadata as unknown as Prisma.JsonNull,
            },
            include: {
                counselor: true
            }
        });

        return NextResponse.json(availability);
    } catch (error) {
        console.error('Error creating counselor availability:', error);
        return NextResponse.json(
            { error: 'Failed to create counselor availability' },
            { status: 500 }
        );
    }
});

export const GET = withAuth(async (request: Request) => {
    try {
        const { searchParams } = new URL(request.url);
        const counselorId = searchParams.get('counselorId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const userId = request.headers.get('x-user-id');
        const userRole = request.headers.get('x-user-role');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID not found in request' },
                { status: 401 }
            );
        }

        // Build the where clause
        const whereClause: Prisma.CounselorAvailabilityWhereInput = {
            deletedAt: null
        };

        if (counselorId) {
            // If requesting specific counselor's availability
            if (userRole !== 'ADMIN') {
                // Non-admins can only see their own availability
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

        if (startDate && endDate) {
            whereClause.startTime = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        const availability = await prisma.counselorAvailability.findMany({
            where: whereClause,
            include: {
                counselor: true
            },
            orderBy: {
                startTime: 'asc'
            }
        });

        return NextResponse.json(availability);
    } catch (error) {
        console.error('Error fetching counselor availability:', error);
        return NextResponse.json(
            { error: 'Failed to fetch counselor availability' },
            { status: 500 }
        );
    }
}); 