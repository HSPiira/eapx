import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { withRouteMiddleware } from '@/middleware/api-middleware';
import { getPaginationParams, parseRequestBody, validateContractData } from '@/lib/api-utils';
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

        const { body, error: parseError } = await parseRequestBody(request);
        if (parseError) {
            return NextResponse.json({ error: parseError }, { status: 400 });
        }

        const validationResult = validateContractData(body);
        if (!validationResult.isValid) {
            return NextResponse.json({ error: validationResult.error }, { status: 400 });
        }

        try {
            // Create contract
            const newContract = await prisma.contract.create({
                data: validationResult.data!,
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