import { withRouteMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { getPaginationParams } from '@/lib/api-utils';
import { BaseStatus, RelationType, Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

type Params = Promise<{ id: string; staffId: string }>;

// Create Zod enums from Prisma enums
const baseStatusEnum = z.enum(Object.values(BaseStatus) as [string, ...string[]]);
const relationTypeEnum = z.enum(Object.values(RelationType) as [string, ...string[]]);

// Validation schema for beneficiary creation
const beneficiarySchema = z.object({
    profileId: z.string(),
    relation: relationTypeEnum,
    isStaffLink: z.boolean().optional(),
    guardianId: z.string().optional().nullable(),
    userLinkId: z.string().optional().nullable(),
    status: baseStatusEnum.optional(),
    lastServiceDate: z.string().transform(str => new Date(str)).optional().nullable(),
    preferredLanguage: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
});

export async function GET(
    request: NextRequest,
    { params }: { params: Params }
) {
    return withRouteMiddleware(request, async () => {
        const { id, staffId } = await params;
        const { searchParams } = new URL(request.url);
        const { page, limit, offset, search, status } = getPaginationParams(searchParams);
        const relation = searchParams.get('relation') || undefined;
        const hasServiceSessions = searchParams.get('hasServiceSessions') === 'true' ? true :
            searchParams.get('hasServiceSessions') === 'false' ? false : undefined;

        if (status && status !== 'all') {
            if (!Object.values(BaseStatus).includes(status as BaseStatus)) {
                return NextResponse.json({
                    error: `Invalid status value. Must be one of: ${Object.values(BaseStatus).join(', ')}`,
                }, { status: 400 });
            }
        }

        if (relation && !Object.values(RelationType).includes(relation as RelationType)) {
            return NextResponse.json({
                error: `Invalid relation value. Must be one of: ${Object.values(RelationType).join(', ')}`,
            }, { status: 400 });
        }

        const where: Prisma.BeneficiaryWhereInput = {
            staffId,
            staff: {
                clientId: id,
            },
            deletedAt: null,
            OR: search
                ? [
                    { profile: { fullName: { contains: search, mode: Prisma.QueryMode.insensitive } } },
                    { profile: { preferredName: { contains: search, mode: Prisma.QueryMode.insensitive } } },
                ]
                : undefined,
            status: status && status !== 'all' ? (status as BaseStatus) : undefined,
            relation: relation as RelationType | undefined,
            ...(hasServiceSessions !== undefined && {
                ServiceSession: hasServiceSessions ? { some: {} } : { none: {} },
            }),
        };

        const cacheKey = `clients:${id}:staff:${staffId}:beneficiaries:${page}:${limit}:${search}:${status}:${relation}:${hasServiceSessions}`;
        const cached = await cache.get(cacheKey);
        if (cached) return NextResponse.json(cached);

        const totalCount = await prisma.beneficiary.count({ where });
        const beneficiaries = await prisma.beneficiary.findMany({
            where,
            include: {
                profile: true,
                guardian: true,
                userLink: true,
                ServiceSession: true,
            },
            skip: offset,
            take: limit,
            orderBy: { createdAt: 'desc' },
        });

        const response = {
            data: beneficiaries,
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
        const { id, staffId } = await params;
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }

        // Validate request body
        const validationResult = beneficiarySchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json({
                error: 'Validation failed',
                details: validationResult.error.errors,
            }, { status: 400 });
        }

        // Check if staff exists and belongs to the client
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

        // Check if profile exists
        const profile = await prisma.profile.findUnique({
            where: { id: body.profileId },
        });

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        // Check if profile is already linked to a beneficiary
        const existingBeneficiary = await prisma.beneficiary.findUnique({
            where: { profileId: body.profileId },
        });

        if (existingBeneficiary) {
            return NextResponse.json({
                error: 'Profile is already linked to a beneficiary',
            }, { status: 400 });
        }

        // Check if guardian exists if provided
        if (body.guardianId) {
            const guardian = await prisma.user.findUnique({
                where: { id: body.guardianId },
            });

            if (!guardian) {
                return NextResponse.json({ error: 'Guardian not found' }, { status: 404 });
            }
        }

        // Check if user link exists if provided
        if (body.userLinkId) {
            const userLink = await prisma.user.findUnique({
                where: { id: body.userLinkId },
            });

            if (!userLink) {
                return NextResponse.json({ error: 'User link not found' }, { status: 404 });
            }
        }

        const newBeneficiary = await prisma.beneficiary.create({
            data: {
                profileId: body.profileId,
                staffId,
                relation: body.relation,
                isStaffLink: body.isStaffLink || false,
                guardianId: body.guardianId,
                userLinkId: body.userLinkId,
                status: body.status || 'ACTIVE',
                lastServiceDate: body.lastServiceDate,
                preferredLanguage: body.preferredLanguage,
                notes: body.notes,
            },
            include: {
                profile: true,
                guardian: true,
                userLink: true,
                ServiceSession: true,
            },
        });

        await cache.deleteByPrefix(`clients:${id}:staff:${staffId}:beneficiaries:`);
        return NextResponse.json(newBeneficiary, { status: 201 });
    });
} 