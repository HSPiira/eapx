import { withRouteMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { StaffRole, WorkStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

type Params = Promise<{ id: string; staffId: string }>;

// Create Zod enums from Prisma enums
const staffRoleEnum = z.enum(Object.values(StaffRole) as [string, ...string[]]);
const workStatusEnum = z.enum(Object.values(WorkStatus) as [string, ...string[]]);

// Validation schema for staff update
const staffUpdateSchema = z.object({
    role: staffRoleEnum.optional(),
    startDate: z.string().transform(str => new Date(str)).optional(),
    endDate: z.string().transform(str => new Date(str)).optional().nullable(),
    status: workStatusEnum.optional(),
    qualifications: z.array(z.string()).optional(),
    specializations: z.array(z.string()).optional(),
    preferredWorkingHours: z.record(z.unknown()).optional().nullable(),
    emergencyContactName: z.string().optional().nullable(),
    emergencyContactPhone: z.string().optional().nullable(),
    emergencyContactEmail: z.string().email().optional().nullable(),
    metadata: z.record(z.unknown()).optional().nullable(),
});

export async function GET(
    request: NextRequest,
    { params }: { params: Params }
) {
    return withRouteMiddleware(request, async () => {
        const { id, staffId } = await params;
        const staff = await prisma.staff.findFirst({
            where: {
                id: staffId,
                clientId: id,
                deletedAt: null,
            },
            include: {
                profile: true,
                beneficiaries: true,
                ServiceSession: true,
            },
        });

        if (!staff) {
            return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
        }

        return NextResponse.json(staff);
    });
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Params }
) {
    return withRouteMiddleware(request, async () => {
        const { id, staffId } = await params;
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }

        // Validate request body
        const validationResult = staffUpdateSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json({
                error: 'Validation failed',
                details: validationResult.error.errors,
            }, { status: 400 });
        }

        const staff = await prisma.staff.findFirst({
            where: {
                id: staffId,
                clientId: id,
                deletedAt: null,
            },
        });

        if (!staff) {
            return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
        }

        const updatedStaff = await prisma.staff.update({
            where: { id: staffId },
            data: {
                role: body.role,
                startDate: body.startDate,
                endDate: body.endDate,
                status: body.status,
                qualifications: body.qualifications,
                specializations: body.specializations,
                preferredWorkingHours: body.preferredWorkingHours,
                emergencyContactName: body.emergencyContactName,
                emergencyContactPhone: body.emergencyContactPhone,
                emergencyContactEmail: body.emergencyContactEmail,
                metadata: body.metadata,
            },
            include: {
                profile: true,
                beneficiaries: true,
                ServiceSession: true,
            },
        });

        await cache.deleteByPrefix(`clients:${id}:staff:`);
        return NextResponse.json(updatedStaff);
    });
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Params }
) {
    return withRouteMiddleware(request, async () => {
        const { id, staffId } = await params;
        const staff = await prisma.staff.findFirst({
            where: {
                id: staffId,
                clientId: id,
                deletedAt: null,
            },
            include: {
                ServiceSession: true,
                beneficiaries: true,
            },
        });

        if (!staff) {
            return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
        }

        // Check if staff has any service sessions
        if (staff.ServiceSession.length > 0) {
            return NextResponse.json({
                error: 'Cannot delete staff with active service sessions',
            }, { status: 400 });
        }

        // Check if staff has any beneficiaries
        if (staff.beneficiaries.length > 0) {
            return NextResponse.json({
                error: 'Cannot delete staff with associated beneficiaries',
            }, { status: 400 });
        }

        await prisma.staff.update({
            where: { id: staffId },
            data: { deletedAt: new Date() },
        });

        await cache.deleteByPrefix(`clients:${id}:staff:`);
        return NextResponse.json({ message: 'Staff deleted successfully' });
    });
} 