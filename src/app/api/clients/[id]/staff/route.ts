import { withRouteMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { getPaginationParams } from '@/lib/api-utils';
import { StaffRole, WorkStatus, Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Create Zod enums from Prisma enums
const staffRoleEnum = z.enum(Object.values(StaffRole) as [string, ...string[]]);
const workStatusEnum = z.enum(Object.values(WorkStatus) as [string, ...string[]]);

// Define Params type for route handlers
type Params = Promise<{ id: string }>;

// Validation schema for staff creation/update
const staffSchema = z.object({
    profileId: z.string(),
    role: staffRoleEnum,
    startDate: z.string().transform(str => new Date(str)),
    endDate: z.string().transform(str => new Date(str)).optional().nullable(),
    status: workStatusEnum.optional(),
    qualifications: z.array(z.string()),
    specializations: z.array(z.string()),
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
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const { page, limit, offset, search, status } = getPaginationParams(searchParams);
        const role = searchParams.get('role') as StaffRole | undefined;
        const hasBeneficiaries = searchParams.get('hasBeneficiaries') === 'true' ? true :
            searchParams.get('hasBeneficiaries') === 'false' ? false : undefined;

        if (status && status !== 'all') {
            if (!Object.values(WorkStatus).includes(status as WorkStatus)) {
                return NextResponse.json({
                    error: `Invalid status value. Must be one of: ${Object.values(WorkStatus).join(', ')}`,
                }, { status: 400 });
            }
        }

        const where: Prisma.StaffWhereInput = {
            clientId: id,
            deletedAt: null,
            OR: search
                ? [
                    { profile: { fullName: { contains: search, mode: Prisma.QueryMode.insensitive } } },
                    { profile: { email: { contains: search, mode: Prisma.QueryMode.insensitive } } },
                ]
                : undefined,
            status: status && status !== 'all' ? (status as WorkStatus) : undefined,
            role: role,
            ...(hasBeneficiaries !== undefined && {
                beneficiaries: hasBeneficiaries ? { some: {} } : { none: {} },
            }),
        };

        const cacheKey = `clients:${id}:staff:${page}:${limit}:${search}:${status}:${role}:${hasBeneficiaries}`;
        const cached = await cache.get(cacheKey);
        if (cached) return NextResponse.json(cached);

        const totalCount = await prisma.staff.count({ where });
        const staff = await prisma.staff.findMany({
            where,
            include: {
                profile: true,
                beneficiaries: true,
                ServiceSession: true,
            },
            skip: offset,
            take: limit,
            orderBy: { createdAt: 'desc' },
        });

        const response = {
            data: staff,
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

export async function POST(
    request: NextRequest,
    { params }: { params: Params }
) {
    return withRouteMiddleware(request, async () => {
        const { id } = await params;
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }

        // Validate request body
        const validationResult = staffSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json({
                error: 'Validation failed',
                details: validationResult.error.errors,
            }, { status: 400 });
        }

        // Check if profile exists
        const profile = await prisma.profile.findUnique({
            where: { id: body.profileId },
        });

        if (!profile) {
            return NextResponse.json({
                error: 'Profile not found',
            }, { status: 404 });
        }

        if (!profile.userId) {
            return NextResponse.json({
                error: 'Profile has no associated user',
            }, { status: 400 });
        }

        const newStaff = await prisma.staff.create({
            data: {
                clientId: id,
                userId: profile.userId,
                profileId: body.profileId,
                role: body.role,
                startDate: body.startDate,
                endDate: body.endDate,
                status: body.status || 'ACTIVE',
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
        return NextResponse.json(newStaff, { status: 201 });
    });
} 