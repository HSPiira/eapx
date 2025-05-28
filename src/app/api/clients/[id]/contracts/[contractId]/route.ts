import { withRouteMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { ContractStatus, PaymentStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

type Params = Promise<{ id: string; contractId: string }>;

// Create Zod enums from Prisma enums
const contractStatusEnum = z.enum(Object.values(ContractStatus) as [string, ...string[]]);
const paymentStatusEnum = z.enum(Object.values(PaymentStatus) as [string, ...string[]]);

// Validation schema for contract update
const contractUpdateSchema = z.object({
    startDate: z.string().transform(str => new Date(str)).optional(),
    endDate: z.string().transform(str => new Date(str)).optional(),
    renewalDate: z.string().transform(str => new Date(str)).optional().nullable(),
    billingRate: z.number().positive().optional(),
    isRenewable: z.boolean().optional(),
    isAutoRenew: z.boolean().optional(),
    paymentStatus: paymentStatusEnum.optional(),
    paymentFrequency: z.string().optional().nullable(),
    paymentTerms: z.string().optional().nullable(),
    currency: z.string().optional(),
    documentUrl: z.string().url().optional().nullable(),
    status: contractStatusEnum.optional(),
    signedBy: z.string().optional().nullable(),
    signedAt: z.string().transform(str => new Date(str)).optional().nullable(),
    terminationReason: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
});

export async function GET(
    request: NextRequest,
    { params }: { params: Params }
) {
    return withRouteMiddleware(request, async () => {
        const { id, contractId } = await params;
        const contract = await prisma.contract.findFirst({
            where: {
                id: contractId,
                clientId: id,
                deletedAt: null,
            },
            include: {
                documents: true,
                kpis: true,
                serviceAssignments: {
                    include: {
                        service: true,
                    },
                },
            },
        });

        if (!contract) {
            return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
        }

        return NextResponse.json(contract);
    });
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Params }
) {
    return withRouteMiddleware(request, async () => {
        const { id, contractId } = await params;
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }

        // Validate request body
        const validationResult = contractUpdateSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json({
                error: 'Validation failed',
                details: validationResult.error.errors,
            }, { status: 400 });
        }

        const contract = await prisma.contract.findFirst({
            where: {
                id: contractId,
                clientId: id,
                deletedAt: null,
            },
        });

        if (!contract) {
            return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
        }

        const updatedContract = await prisma.contract.update({
            where: { id: contractId },
            data: {
                startDate: body.startDate,
                endDate: body.endDate,
                renewalDate: body.renewalDate,
                billingRate: body.billingRate,
                isRenewable: body.isRenewable,
                isAutoRenew: body.isAutoRenew,
                paymentStatus: body.paymentStatus,
                paymentFrequency: body.paymentFrequency,
                paymentTerms: body.paymentTerms,
                currency: body.currency,
                documentUrl: body.documentUrl,
                status: body.status,
                signedBy: body.signedBy,
                signedAt: body.signedAt,
                terminationReason: body.terminationReason,
                notes: body.notes,
            },
            include: {
                documents: true,
                kpis: true,
                serviceAssignments: {
                    include: {
                        service: true,
                    },
                },
            },
        });

        await cache.deleteByPrefix(`clients:${id}:contracts:`);
        return NextResponse.json(updatedContract);
    });
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Params }
) {
    return withRouteMiddleware(request, async () => {
        const { id, contractId } = await params;
        const contract = await prisma.contract.findFirst({
            where: {
                id: contractId,
                clientId: id,
                deletedAt: null,
            },
            include: {
                serviceAssignments: true,
            },
        });

        if (!contract) {
            return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
        }

        // Check if contract has any service assignments
        if (contract.serviceAssignments.length > 0) {
            return NextResponse.json({
                error: 'Cannot delete contract with active service assignments',
            }, { status: 400 });
        }

        await prisma.contract.update({
            where: { id: contractId },
            data: { deletedAt: new Date() },
        });

        await cache.deleteByPrefix(`clients:${id}:contracts:`);
        return NextResponse.json({ message: 'Contract deleted successfully' });
    });
} 