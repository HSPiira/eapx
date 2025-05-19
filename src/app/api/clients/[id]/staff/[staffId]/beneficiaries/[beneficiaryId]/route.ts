import { withRouteMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { BaseStatus, RelationType, Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

type Params = Promise<{ id: string; staffId: string; beneficiaryId: string }>;

// Create Zod enums from Prisma enums
const baseStatusEnum = z.enum(Object.values(BaseStatus) as [string, ...string[]]);
const relationTypeEnum = z.enum(Object.values(RelationType) as [string, ...string[]]);

// Validation schema for beneficiary update
const beneficiaryUpdateSchema = z.object({
    relation: relationTypeEnum.optional(),
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
        const { id, staffId, beneficiaryId } = await params;
        const beneficiary = await prisma.beneficiary.findFirst({
            where: {
                id: beneficiaryId,
                staffId,
                staff: {
                    clientId: id,
                },
                deletedAt: null,
            },
            include: {
                profile: true,
                guardian: true,
                userLink: true,
                ServiceSession: true,
            },
        });

        if (!beneficiary) {
            return NextResponse.json({ error: 'Beneficiary not found' }, { status: 404 });
        }

        return NextResponse.json(beneficiary);
    });
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Params }
) {
    return withRouteMiddleware(request, async () => {
        const { id, staffId, beneficiaryId } = await params;
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }

        // Validate request body
        const validationResult = beneficiaryUpdateSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json({
                error: 'Validation failed',
                details: validationResult.error.errors,
            }, { status: 400 });
        }

        const beneficiary = await prisma.beneficiary.findFirst({
            where: {
                id: beneficiaryId,
                staffId,
                staff: {
                    clientId: id,
                },
                deletedAt: null,
            },
        });

        if (!beneficiary) {
            return NextResponse.json({ error: 'Beneficiary not found' }, { status: 404 });
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

        const updatedBeneficiary = await prisma.beneficiary.update({
            where: { id: beneficiaryId },
            data: {
                relation: body.relation,
                isStaffLink: body.isStaffLink,
                guardianId: body.guardianId,
                userLinkId: body.userLinkId,
                status: body.status,
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
        return NextResponse.json(updatedBeneficiary);
    });
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Params }
) {
    return withRouteMiddleware(request, async () => {
        const { id, staffId, beneficiaryId } = await params;
        const beneficiary = await prisma.beneficiary.findFirst({
            where: {
                id: beneficiaryId,
                staffId,
                staff: {
                    clientId: id,
                },
                deletedAt: null,
            },
            include: {
                ServiceSession: true,
            },
        });

        if (!beneficiary) {
            return NextResponse.json({ error: 'Beneficiary not found' }, { status: 404 });
        }

        // Check if beneficiary has any service sessions
        if (beneficiary.ServiceSession.length > 0) {
            return NextResponse.json({
                error: 'Cannot delete beneficiary with active service sessions',
            }, { status: 400 });
        }

        await prisma.beneficiary.update({
            where: { id: beneficiaryId },
            data: { deletedAt: new Date() },
        });

        await cache.deleteByPrefix(`clients:${id}:staff:${staffId}:beneficiaries:`);
        return NextResponse.json({ message: 'Beneficiary deleted successfully' });
    });
} 