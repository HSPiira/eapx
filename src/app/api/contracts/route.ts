import { NextResponse } from 'next/server';
import { cache } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { ContractStatus, PaymentStatus, Frequency } from '@prisma/client';
import { withApiMiddleware } from '@/middleware/api-middleware';
import { getPaginationParams } from '@/lib/api-utils';

// GET /api/contracts
export async function GET(request: Request) {
    return withApiMiddleware(request, async (request) => {
        const { page, limit, offset, search, status } = getPaginationParams(request);

        // Cache key based on all query parameters
        const cacheKey = `contracts:${request.url.search}`;

        // Try to get from cache first
        const cachedData = await cache.get(cacheKey);
        if (cachedData) {
            return NextResponse.json(cachedData);
        }

        // Get total count for pagination metadata
        const where = {
            ...(search && {
                OR: [
                    { client: { name: { contains: search } } },
                    { notes: { contains: search } }
                ]
            }),
            ...(status && { status: status as ContractStatus })
        };

        const totalCount = await prisma.contract.count({ where });

        // Fetch contracts with pagination
        const contracts = await prisma.contract.findMany({
            where,
            select: {
                id: true,
                clientId: true,
                startDate: true,
                endDate: true,
                renewalDate: true,
                billingRate: true,
                isRenewable: true,
                isAutoRenew: true,
                paymentStatus: true,
                paymentFrequency: true,
                paymentTerms: true,
                currency: true,
                lastBillingDate: true,
                nextBillingDate: true,
                documentUrl: true,
                status: true,
                signedBy: true,
                signedAt: true,
                terminationReason: true,
                notes: true,
                createdAt: true,
                updatedAt: true,
                client: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            skip: offset,
            take: limit,
            orderBy: {
                createdAt: 'desc',
            },
        });

        const response = {
            data: contracts,
            metadata: {
                total: totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit)
            }
        };

        // Cache the results
        await cache.set(cacheKey, response);

        return NextResponse.json(response);
    });
}

// POST /api/contracts
export async function POST(request: Request) {
    return withApiMiddleware(request, async (request) => {
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: 'Invalid JSON payload' },
                { status: 400 }
            );
        }

        // Input validation
        if (!body.clientId || !body.startDate || !body.endDate || !body.billingRate) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate billing rate
        const rate = Number(body.billingRate);
        if (!Number.isFinite(rate) || rate <= 0) {
            return NextResponse.json(
                { error: 'Invalid billing rate - must be a positive number' },
                { status: 400 }
            );
        }

        // Validate payment frequency
        if (body.paymentFrequency && !Object.values(Frequency).includes(body.paymentFrequency)) {
            return NextResponse.json(
                { error: 'Invalid payment frequency' },
                { status: 400 }
            );
        }

        // Validate payment terms (string validation)
        if (body.paymentTerms && typeof body.paymentTerms !== 'string') {
            return NextResponse.json(
                { error: 'Payment terms must be a string' },
                { status: 400 }
            );
        }

        // Validate currency (string validation)
        if (body.currency && typeof body.currency !== 'string') {
            return NextResponse.json(
                { error: 'Currency must be a string' },
                { status: 400 }
            );
        }

        // Validate dates
        const startDate = new Date(body.startDate);
        const endDate = new Date(body.endDate);
        const renewalDate = body.renewalDate ? new Date(body.renewalDate) : null;

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) ||
            (renewalDate && isNaN(renewalDate.getTime()))) {
            return NextResponse.json(
                { error: 'Invalid date format' },
                { status: 400 }
            );
        }

        if (endDate <= startDate) {
            return NextResponse.json(
                { error: 'End date must be after start date' },
                { status: 400 }
            );
        }

        if (renewalDate && renewalDate <= endDate) {
            return NextResponse.json(
                { error: 'Renewal date must be after end date' },
                { status: 400 }
            );
        }

        // Create new contract
        const newContract = await prisma.contract.create({
            data: {
                clientId: body.clientId,
                startDate,
                endDate,
                renewalDate,
                billingRate: rate,
                isRenewable: body.isRenewable ?? true,
                isAutoRenew: body.isAutoRenew ?? false,
                paymentStatus: PaymentStatus.PENDING,
                paymentFrequency: body.paymentFrequency,
                paymentTerms: body.paymentTerms,
                currency: body.currency || 'UGX',
                status: ContractStatus.ACTIVE,
                notes: body.notes,
            },
            select: {
                id: true,
                clientId: true,
                startDate: true,
                endDate: true,
                renewalDate: true,
                billingRate: true,
                isRenewable: true,
                isAutoRenew: true,
                paymentStatus: true,
                paymentFrequency: true,
                paymentTerms: true,
                currency: true,
                lastBillingDate: true,
                nextBillingDate: true,
                documentUrl: true,
                status: true,
                signedBy: true,
                signedAt: true,
                terminationReason: true,
                notes: true,
                createdAt: true,
                updatedAt: true,
                client: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        // Invalidate cache
        await cache.deleteByPrefix('contracts:');

        return NextResponse.json(newContract, { status: 201 });
    });
} 