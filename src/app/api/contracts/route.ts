import { NextResponse } from 'next/server';
import { auth } from '@/middleware/auth';
import { cache } from '@/lib/cache';
import { rateLimiter } from '@/lib/rate-limiter';
import { prisma } from '@/lib/prisma';
import { Prisma, ContractStatus, PaymentStatus } from '@prisma/client';

// GET /api/contracts
export async function GET(request: Request) {
    try {
        // Rate limiting
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        if (!(await rateLimiter.isAllowed(ip))) {
            return NextResponse.json(
                { error: 'Too many requests' },
                { status: 429 }
            );
        }

        // Authentication
        const session = await auth();
        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Pagination
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
        const offset = (page - 1) * limit;

        // Cache key based on pagination parameters
        const cacheKey = `contracts:${page}:${limit}`;

        // Try to get from cache first
        const cachedData = await cache.get(cacheKey);
        if (cachedData) {
            return NextResponse.json(cachedData);
        }

        // Get total count for pagination metadata
        const totalCount = await prisma.contract.count();

        // Fetch contracts with pagination
        const contracts = await prisma.contract.findMany({
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
    } catch (error) {
        console.error('Error fetching contracts:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

// POST /api/contracts
export async function POST(request: Request) {
    try {
        // Rate limiting
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        if (!(await rateLimiter.isAllowed(ip))) {
            return NextResponse.json(
                { error: 'Too many requests' },
                { status: 429 }
            );
        }

        // Authentication
        const session = await auth();
        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Input validation
        if (!body.clientId || !body.startDate || !body.endDate || !body.billingRate) {
            return NextResponse.json(
                { error: 'Missing required fields' },
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
                billingRate: parseFloat(body.billingRate),
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
        await cache.delete('contracts:1:10'); // Invalidate first page

        return NextResponse.json(newContract, { status: 201 });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2003') {
                return NextResponse.json(
                    { error: 'Client not found' },
                    { status: 404 }
                );
            }
        }
        console.error('Error creating contract:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
} 