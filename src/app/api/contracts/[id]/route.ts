import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { withRouteMiddleware } from '@/middleware/api-middleware';
import { isAdmin } from '@/lib/auth-utils';
import { contractSelectFields } from '@/lib/select-fields';

type Params = Promise<{ id: string }>;

// GET /api/contracts/[id]
export async function GET(request: NextRequest, { params }: { params: Params }) {
    return withRouteMiddleware(request, async (session) => {
        // Authorization - Check if user is admin
        if (!(await isAdmin(session))) {
            return NextResponse.json(
                { error: 'Forbidden - Admin access required' },
                { status: 403 }
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
            select: contractSelectFields,
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
export async function PUT(request: NextRequest, { params }: { params: Params }) {
    return withRouteMiddleware(request, async (session) => {
        // Authorization - Check if user is admin
        if (!(await isAdmin(session))) {
            return NextResponse.json(
                { error: 'Forbidden - Admin access required' },
                { status: 403 }
            );
        }

        const { id } = await params;
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }

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

        try {
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
                select: contractSelectFields,
            });

            // Invalidate caches
            await cache.delete(`contract:${id}`);
            await cache.invalidateByTags(['contracts']);

            return NextResponse.json(updatedContract);
        } catch (error) {
            console.error('Error updating contract:', error);
            return NextResponse.json({ error: 'Failed to update contract' }, { status: 500 });
        }
    });
}

// DELETE /api/contracts/[id]
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
    return withRouteMiddleware(request, async (session) => {
        // Authorization - Check if user is admin
        if (!(await isAdmin(session))) {
            return NextResponse.json(
                { error: 'Forbidden - Admin access required' },
                { status: 403 }
            );
        }

        const { id } = await params;

        try {
            // Check if contract exists
            const contract = await prisma.contract.findUnique({
                where: { id },
                select: { id: true }
            });

            if (!contract) {
                return NextResponse.json(
                    { error: 'Contract not found' },
                    { status: 404 }
                );
            }

            // Soft delete contract
            await prisma.contract.update({
                where: { id },
                data: {
                    deletedAt: new Date()
                }
            });

            // Invalidate caches
            await cache.delete(`contract:${id}`);
            await cache.invalidateByTags(['contracts']);

            return new NextResponse(null, { status: 204 });
        } catch (error) {
            console.error('Error deleting contract:', error);
            return NextResponse.json({ error: 'Failed to delete contract' }, { status: 500 });
        }
    });
} 