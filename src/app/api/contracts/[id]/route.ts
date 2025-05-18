import { NextResponse } from 'next/server';
import { cache } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { withApiMiddleware } from '@/middleware/api-middleware';

// GET /api/contracts/[id]
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    return withApiMiddleware(_request, async () => {
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
    });
}

// PUT /api/contracts/[id]
export async function PUT(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    return withApiMiddleware(_request, async () => {
        const { id } = await params;
        const body = await _request.json();

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
                billingRate: body.billingRate !== undefined && body.billingRate !== null
                    ? parseFloat(body.billingRate)
                    : undefined,
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
        await cache.invalidateByTags(['contracts']);

        return NextResponse.json(updatedContract);
    });
}

// DELETE /api/contracts/[id]
export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    return withApiMiddleware(_request, async () => {
        const { id } = await params;

        // Delete contract
        await prisma.contract.delete({
            where: { id },
        });

        // Invalidate caches
        await cache.delete(`contract:${id}`);
        await cache.invalidateByTags(['contracts']);

        return new NextResponse(null, { status: 204 });
    });
} 