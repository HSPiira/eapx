import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { withRouteMiddleware } from '@/middleware/api-middleware';
import { getPaginationParams } from '@/lib/api-utils';
import { isAdmin } from '@/lib/auth-utils';
import { ContractStatus, PaymentStatus } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { contractSelectFields } from '@/lib/select-fields';

export async function GET(request: NextRequest) {
    return withRouteMiddleware(request, async (session) => {
        // Authorization - Check if user is admin
        if (!(await isAdmin(session))) {
            return NextResponse.json(
                { error: 'Forbidden - Admin access required' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const { page, limit, offset, search } = getPaginationParams(searchParams);
        const clientId = searchParams.get('clientId');
        const statusParam = searchParams.get('status');
        const paymentStatusParam = searchParams.get('paymentStatus');

        // Cache key based on parameters
        const cacheKey = `contracts:${page}:${limit}:${search}:${clientId}:${statusParam}:${paymentStatusParam}`;

        // Try to get from cache first
        const cachedData = await cache.get(cacheKey);
        if (cachedData) {
            return NextResponse.json(cachedData);
        }

        // Build where clause
        const where: Prisma.ContractWhereInput = {
            deletedAt: null,
            ...(search ? {
                OR: [
                    { notes: { contains: search, mode: 'insensitive' } },
                    { client: { name: { contains: search, mode: 'insensitive' } } }
                ]
            } : {}),
            ...(clientId ? { clientId } : {}),
            ...(statusParam && statusParam !== 'all' ? { status: statusParam as ContractStatus } : {}),
            ...(paymentStatusParam && paymentStatusParam !== 'all' ? { paymentStatus: paymentStatusParam as PaymentStatus } : {})
        };

        // Get total count for pagination metadata
        const totalCount = await prisma.contract.count({ where });

        // Fetch contracts with pagination
        const contracts = await prisma.contract.findMany({
            where,
            select: contractSelectFields,
            skip: offset,
            take: limit,
            orderBy: {
                createdAt: 'desc'
            }
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
        await cache.set(cacheKey, response, { tags: ['contracts'] });

        return NextResponse.json(response);
    });
}

export async function POST(request: NextRequest) {
    return withRouteMiddleware(request, async (session) => {
        // Authorization - Check if user is admin
        if (!(await isAdmin(session))) {
            return NextResponse.json(
                { error: 'Forbidden - Admin access required' },
                { status: 403 }
            );
        }

        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }

        // Validate required fields
        if (!body.clientId) {
            return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
        }

        if (!body.startDate || !body.endDate) {
            return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 });
        }

        // Validate dates
        const startDate = new Date(body.startDate);
        const endDate = new Date(body.endDate);
        const renewalDate = body.renewalDate ? new Date(body.renewalDate) : null;

        if (isNaN(startDate.getTime())) {
            return NextResponse.json(
                { error: 'Invalid start date format' },
                { status: 400 }
            );
        }

        if (isNaN(endDate.getTime())) {
            return NextResponse.json(
                { error: 'Invalid end date format' },
                { status: 400 }
            );
        }

        if (renewalDate && isNaN(renewalDate.getTime())) {
            return NextResponse.json(
                { error: 'Invalid renewal date format' },
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

        try {
            // Create contract
            const newContract = await prisma.contract.create({
                data: {
                    clientId: body.clientId,
                    startDate,
                    endDate,
                    renewalDate,
                    billingRate: body.billingRate ? parseFloat(body.billingRate) : 0,
                    isRenewable: body.isRenewable ?? true,
                    isAutoRenew: body.isAutoRenew ?? false,
                    paymentStatus: body.paymentStatus || PaymentStatus.PENDING,
                    paymentFrequency: body.paymentFrequency,
                    paymentTerms: body.paymentTerms,
                    currency: body.currency || 'UGX',
                    status: body.status || ContractStatus.ACTIVE,
                    notes: body.notes,
                },
                select: contractSelectFields
            });

            // Invalidate cache
            await cache.invalidateByTags(['contracts']);

            return NextResponse.json(newContract, { status: 201 });
        } catch (error) {
            console.error('Error creating contract:', error);
            return NextResponse.json({ error: 'Failed to create contract' }, { status: 500 });
        }
    });
} 