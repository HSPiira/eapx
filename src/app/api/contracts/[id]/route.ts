import { NextResponse } from 'next/server';
import { auth } from '@/middleware/auth';
import { cache } from '@/lib/cache';
import { rateLimiter } from '@/lib/rate-limiter';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET /api/contracts/[id]
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;

        // Try to get from cache first
        const cacheKey = `contract:${id}`;
        const cachedContract = await cache.get(cacheKey);
        if (cachedContract) {
            return NextResponse.json(cachedContract);
        }

        // Fetch contract from database
        const contract = await prisma.contract.findUnique({
            where: { id },
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

        if (!contract) {
            return NextResponse.json(
                { error: 'Contract not found' },
                { status: 404 }
            );
        }

        // Cache the result
        await cache.set(cacheKey, contract);

        return NextResponse.json(contract);
    } catch (error) {
        console.error('Error fetching contract:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

// PUT /api/contracts/[id]
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;
        const body = await request.json();

        // Validate dates if provided
        const startDate = body.startDate ? new Date(body.startDate) : undefined;
        const endDate = body.endDate ? new Date(body.endDate) : undefined;
        const renewalDate = body.renewalDate ? new Date(body.renewalDate) : undefined;

        if (startDate && isNaN(startDate.getTime())) {
            return NextResponse.json(
                { error: 'Invalid start date format' },
                { status: 400 }
            );
        }

        if (endDate && isNaN(endDate.getTime())) {
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

        if (startDate && endDate && endDate <= startDate) {
            return NextResponse.json(
                { error: 'End date must be after start date' },
                { status: 400 }
            );
        }

        if (endDate && renewalDate && renewalDate <= endDate) {
            return NextResponse.json(
                { error: 'Renewal date must be after end date' },
                { status: 400 }
            );
        }

        // Update contract
        const updatedContract = await prisma.contract.update({
            where: { id },
            data: {
                clientId: body.clientId,
                startDate,
                endDate,
                renewalDate,
                billingRate: body.billingRate ? parseFloat(body.billingRate) : undefined,
                isRenewable: body.isRenewable,
                isAutoRenew: body.isAutoRenew,
                paymentStatus: body.paymentStatus,
                paymentFrequency: body.paymentFrequency,
                paymentTerms: body.paymentTerms,
                currency: body.currency,
                status: body.status,
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

        // Invalidate caches
        await cache.delete(`contract:${id}`);
        await cache.delete('contracts:1:10'); // Invalidate first page of contracts list

        return NextResponse.json(updatedContract);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return NextResponse.json(
                    { error: 'Contract not found' },
                    { status: 404 }
                );
            }
            if (error.code === 'P2003') {
                return NextResponse.json(
                    { error: 'Client not found' },
                    { status: 404 }
                );
            }
        }
        console.error('Error updating contract:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

// DELETE /api/contracts/[id]
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;

        // Delete contract
        await prisma.contract.delete({
            where: { id },
        });

        // Invalidate caches
        await cache.delete(`contract:${id}`);
        await cache.delete('contracts:1:10'); // Invalidate first page of contracts list

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return NextResponse.json(
                    { error: 'Contract not found' },
                    { status: 404 }
                );
            }
        }
        console.error('Error deleting contract:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
} 