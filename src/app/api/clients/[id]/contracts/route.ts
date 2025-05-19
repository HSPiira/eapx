import { withRouteMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { getPaginationParams } from '@/lib/api-utils';
import { ContractStatus, PaymentStatus, Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Create Zod enums from Prisma enums
const contractStatusEnum = z.enum(Object.values(ContractStatus) as [string, ...string[]]);
const paymentStatusEnum = z.enum(Object.values(PaymentStatus) as [string, ...string[]]);

// Validation schema for contract creation/update
const contractSchema = z.object({
    startDate: z.string().transform(str => new Date(str)),
    endDate: z.string().transform(str => new Date(str)),
    renewalDate: z.string().transform(str => new Date(str)).optional().nullable(),
    billingRate: z.number().positive(),
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
    { params }: { params: { id: string } }
) {
    return withRouteMiddleware(request, async () => {
        const { searchParams } = new URL(request.url);
        const { page, limit, offset, search, status } = getPaginationParams(searchParams);
        const paymentStatus = searchParams.get('paymentStatus') as PaymentStatus | undefined;
        const isRenewable = searchParams.get('isRenewable') === 'true' ? true :
            searchParams.get('isRenewable') === 'false' ? false : undefined;
        const isAutoRenew = searchParams.get('isAutoRenew') === 'true' ? true :
            searchParams.get('isAutoRenew') === 'false' ? false : undefined;

        if (status && status !== 'all') {
            if (!Object.values(ContractStatus).includes(status as ContractStatus)) {
                return NextResponse.json({
                    error: `Invalid status value. Must be one of: ${Object.values(ContractStatus).join(', ')}`,
                }, { status: 400 });
            }
        }

        const where: Prisma.ContractWhereInput = {
            clientId: params.id,
            deletedAt: null,
            OR: search
                ? [
                    { notes: { contains: search, mode: Prisma.QueryMode.insensitive } },
                    { paymentTerms: { contains: search, mode: Prisma.QueryMode.insensitive } },
                ]
                : undefined,
            status: status && status !== 'all' ? (status as ContractStatus) : undefined,
            paymentStatus: paymentStatus,
            isRenewable: isRenewable,
            isAutoRenew: isAutoRenew,
        };

        const cacheKey = `clients:${params.id}:contracts:${page}:${limit}:${search}:${status}:${paymentStatus}:${isRenewable}:${isAutoRenew}`;
        const cached = await cache.get(cacheKey);
        if (cached) return NextResponse.json(cached);

        const totalCount = await prisma.contract.count({ where });
        const contracts = await prisma.contract.findMany({
            where,
            include: {
                documents: true,
                kpis: true,
                serviceAssignments: {
                    include: {
                        service: true,
                    },
                },
            },
            skip: offset,
            take: limit,
            orderBy: { createdAt: 'desc' },
        });

        const response = {
            data: contracts,
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
    { params }: { params: { id: string } }
) {
    return withRouteMiddleware(request, async () => {
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }

        // Validate request body
        const validationResult = contractSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json({
                error: 'Validation failed',
                details: validationResult.error.errors,
            }, { status: 400 });
        }

        const newContract = await prisma.contract.create({
            data: {
                clientId: params.id,
                startDate: body.startDate,
                endDate: body.endDate,
                renewalDate: body.renewalDate,
                billingRate: body.billingRate,
                isRenewable: body.isRenewable ?? true,
                isAutoRenew: body.isAutoRenew ?? false,
                paymentStatus: body.paymentStatus || 'PENDING',
                paymentFrequency: body.paymentFrequency,
                paymentTerms: body.paymentTerms,
                currency: body.currency || 'UGX',
                documentUrl: body.documentUrl,
                status: body.status || 'ACTIVE',
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

        await cache.deleteByPrefix(`clients:${params.id}:contracts:`);
        return NextResponse.json(newContract, { status: 201 });
    });
} 