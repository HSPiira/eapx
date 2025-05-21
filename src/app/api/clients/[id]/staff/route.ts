import { withRouteMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { getPaginationParams } from '@/lib/api-utils';
import { StaffRole, WorkStatus, Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Create Zod enums from Prisma enums

// Define Params type for route handlers
type Params = Promise<{ id: string }>;

// Validation schema for staff creation/update
const createStaffSchema = z.object({
    profileId: z.string(),
    jobTitle: z.string(),
    companyId: z.string().optional(),
    managementLevel: z.enum(['JUNIOR', 'MID', 'SENIOR', 'EXECUTIVE', 'OTHER']).optional(),
    maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']).optional(),
    startDate: z.string().transform((val) => new Date(val)),
    endDate: z.string().transform((val) => new Date(val)).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED']).optional(),
    qualifications: z.array(z.string()).optional(),
    specializations: z.array(z.string()).optional(),
    preferredWorkingHours: z.any().optional(),
    metadata: z.any().optional(),
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
            ...(role && { role }),
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
                profile: {
                    select: {
                        id: true,
                        fullName: true,
                        preferredName: true,
                        email: true,
                        phone: true,
                        dob: true,
                        gender: true,
                        address: true,
                        nationality: true,
                        bloodType: true,
                        allergies: true,
                        medicalConditions: true,
                        dietaryRestrictions: true,
                        accessibilityNeeds: true,
                        emergencyContactName: true,
                        emergencyContactPhone: true,
                        emergencyContactEmail: true,
                        preferredLanguage: true,
                        preferredContactMethod: true,
                        metadata: true
                    }
                },
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
        const validationResult = createStaffSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json({
                error: 'Validation failed',
                details: validationResult.error.errors,
            }, { status: 400 });
        }

        // Check if profile exists
        const profile = await prisma.profile.findUnique({
            where: { id: validationResult.data.profileId },
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
                profileId: validationResult.data.profileId,
                jobTitle: validationResult.data.jobTitle,
                companyId: validationResult.data.companyId || id,
                managementLevel: validationResult.data.managementLevel || 'JUNIOR',
                maritalStatus: validationResult.data.maritalStatus || 'SINGLE',
                startDate: validationResult.data.startDate,
                endDate: validationResult.data.endDate,
                status: validationResult.data.status || 'ACTIVE',
                qualifications: validationResult.data.qualifications || [],
                specializations: validationResult.data.specializations || [],
                preferredWorkingHours: validationResult.data.preferredWorkingHours,
                metadata: validationResult.data.metadata,
            },
            include: {
                profile: {
                    select: {
                        id: true,
                        fullName: true,
                        preferredName: true,
                        email: true,
                        phone: true,
                        dob: true,
                        gender: true,
                        address: true,
                        nationality: true,
                        bloodType: true,
                        allergies: true,
                        medicalConditions: true,
                        dietaryRestrictions: true,
                        accessibilityNeeds: true,
                        emergencyContactName: true,
                        emergencyContactPhone: true,
                        emergencyContactEmail: true,
                        preferredLanguage: true,
                        preferredContactMethod: true,
                        metadata: true
                    }
                },
                beneficiaries: true,
                ServiceSession: true,
            },
        });

        await cache.deleteByPrefix(`clients:${id}:staff:`);
        return NextResponse.json(newStaff, { status: 201 });
    });
} 