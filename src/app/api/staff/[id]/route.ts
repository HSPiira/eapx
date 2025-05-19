import { NextResponse } from 'next/server';
import { auth } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { StaffRole, WorkStatus } from '@prisma/client';
import { Parentheses } from 'lucide-react';

type Params = Promise<{ id: string }>;

const updateStaffSchema = z.object({
    fullName: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    role: z.nativeEnum(StaffRole).optional(),
    status: z.nativeEnum(WorkStatus).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    qualifications: z.array(z.string()).optional(),
    specializations: z.array(z.string()).optional(),
    emergencyContactName: z.string().optional(),
    emergencyContactPhone: z.string().optional(),
    emergencyContactEmail: z.string().email().optional(),
    notes: z.string().optional(),
});

export async function GET(
    req: Request,
    { params }: { params: Params }
) {
    try {
        const session = await auth();
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { id } = await params;
        const staff = await prisma.staff.findUnique({
            where: {
                id: id,
                deletedAt: null,
            },
            include: {
                profile: true,
                client: {
                    select: {
                        name: true,
                    },
                },
                beneficiaries: {
                    include: {
                        profile: true,
                    },
                },
                ServiceSession: {
                    include: {
                        service: true,
                        beneficiary: {
                            include: {
                                profile: true,
                            },
                        },
                    },
                },
            },
        });

        if (!staff) {
            return new NextResponse('Staff not found', { status: 404 });
        }

        return NextResponse.json(staff);
    } catch (error) {
        console.error('[STAFF_GET]', error);
        return new NextResponse('Internal error', { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Params }
) {
    try {
        const session = await auth();
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const validatedData = updateStaffSchema.parse(body);

        // Get the staff member to update
        const staff = await prisma.staff.findUnique({
            where: {
                id: id,
                deletedAt: null,
            },
            include: {
                profile: true,
            },
        });

        if (!staff) {
            return new NextResponse('Staff not found', { status: 404 });
        }

        // Update profile if profile fields are provided
        if (validatedData.fullName || validatedData.email || validatedData.phone) {
            await prisma.profile.update({
                where: {
                    id: staff.profileId,
                },
                data: {
                    fullName: validatedData.fullName,
                    email: validatedData.email,
                    phone: validatedData.phone,
                },
            });
        }

        // Update staff member
        const updatedStaff = await prisma.staff.update({
            where: {
                id: id,
            },
            data: {
                role: validatedData.role,
                status: validatedData.status,
                startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
                endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
                qualifications: validatedData.qualifications,
                specializations: validatedData.specializations,
                emergencyContactName: validatedData.emergencyContactName,
                emergencyContactPhone: validatedData.emergencyContactPhone,
                emergencyContactEmail: validatedData.emergencyContactEmail,
            },
            include: {
                profile: true,
                client: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        return NextResponse.json(updatedStaff);
    } catch (error) {
        console.error('[STAFF_PATCH]', error);
        if (error instanceof z.ZodError) {
            return new NextResponse('Invalid request data', { status: 422 });
        }
        return new NextResponse('Internal error', { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Params }
) {
    try {
        const session = await auth();
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { id } = await params;
        const staff = await prisma.staff.findUnique({
            where: {
                id: id,
                deletedAt: null,
            },
        });

        if (!staff) {
            return new NextResponse('Staff not found', { status: 404 });
        }

        // Soft delete the staff member
        await prisma.staff.update({
            where: {
                id: id,
            },
            data: {
                deletedAt: new Date(),
            },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('[STAFF_DELETE]', error);
        return new NextResponse('Internal error', { status: 500 });
    }
} 