import { withRouteMiddleware } from '@/middleware/api-middleware';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { BaseStatus, Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    return withRouteMiddleware(request, async () => {
        const { searchParams } = new URL(request.url);
        const timeRange = searchParams.get('timeRange') || '30d'; // Default to last 30 days
        const industryId = searchParams.get('industryId') || undefined;

        const cacheKey = `clients:stats:${timeRange}:${industryId}`;
        const cached = await cache.get(cacheKey);
        if (cached) return NextResponse.json(cached);

        // Calculate date range
        const now = new Date();
        const startDate = new Date();
        switch (timeRange) {
            case '7d':
                startDate.setDate(now.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(now.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(now.getDate() - 90);
                break;
            case '1y':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                startDate.setDate(now.getDate() - 30);
        }

        // Base where clause
        const where: Prisma.ClientWhereInput = {
            deletedAt: null,
            industryId: industryId || undefined,
        };

        // Get total counts
        const [
            totalClients,
            activeClients,
            verifiedClients,
            newClients,
            clientsByStatus,
            clientsByIndustry,
            clientsByVerification,
        ] = await Promise.all([
            // Total clients
            prisma.client.count({ where }),
            // Active clients
            prisma.client.count({
                where: { ...where, status: 'ACTIVE' },
            }),
            // Verified clients
            prisma.client.count({
                where: { ...where, isVerified: true },
            }),
            // New clients in time range
            prisma.client.count({
                where: {
                    ...where,
                    createdAt: { gte: startDate },
                },
            }),
            // Clients by status
            prisma.client.groupBy({
                by: ['status'],
                where,
                _count: true,
            }),
            // Clients by industry
            prisma.client.groupBy({
                by: ['industryId'],
                where,
                _count: true,
            }),
            // Clients by verification status
            prisma.client.groupBy({
                by: ['isVerified'],
                where,
                _count: true,
            }),
        ]);

        const stats = {
            total: totalClients,
            active: activeClients,
            verified: verifiedClients,
            newInTimeRange: newClients,
            byStatus: clientsByStatus.reduce((acc, curr) => ({
                ...acc,
                [curr.status]: curr._count,
            }), {}),
            byIndustry: clientsByIndustry.reduce((acc, curr) => ({
                ...acc,
                [curr.industryId || 'unknown']: curr._count,
            }), {}),
            byVerification: clientsByVerification.reduce((acc, curr) => ({
                ...acc,
                [curr.isVerified ? 'verified' : 'unverified']: curr._count,
            }), {}),
        };

        await cache.set(cacheKey, stats);
        return NextResponse.json(stats);
    });
}

export async function POST(request: NextRequest) {
    return withRouteMiddleware(request, async () => {
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }

        if (!body.operation || !body.clients) {
            return NextResponse.json({
                error: 'Operation and clients array are required',
            }, { status: 400 });
        }

        const { operation, clients } = body;

        switch (operation) {
            case 'bulkUpdate': {
                if (!body.updates) {
                    return NextResponse.json({
                        error: 'Updates object is required for bulk update',
                    }, { status: 400 });
                }

                const results = await Promise.all(
                    clients.map(async (clientId: string) => {
                        try {
                            const updated = await prisma.client.update({
                                where: { id: clientId },
                                data: body.updates,
                            });
                            return { id: clientId, success: true, data: updated };
                        } catch (error) {
                            return { id: clientId, success: false, error: 'Update failed' };
                        }
                    })
                );

                await cache.deleteByPrefix('clients:');
                return NextResponse.json({ results });
            }

            case 'bulkDelete': {
                const results = await Promise.all(
                    clients.map(async (clientId: string) => {
                        try {
                            await prisma.client.update({
                                where: { id: clientId },
                                data: { deletedAt: new Date() },
                            });
                            return { id: clientId, success: true };
                        } catch (error) {
                            return { id: clientId, success: false, error: 'Delete failed' };
                        }
                    })
                );

                await cache.deleteByPrefix('clients:');
                return NextResponse.json({ results });
            }

            case 'bulkVerify': {
                const results = await Promise.all(
                    clients.map(async (clientId: string) => {
                        try {
                            const updated = await prisma.client.update({
                                where: { id: clientId },
                                data: { isVerified: true },
                            });
                            return { id: clientId, success: true, data: updated };
                        } catch (error) {
                            return { id: clientId, success: false, error: 'Verification failed' };
                        }
                    })
                );

                await cache.deleteByPrefix('clients:');
                return NextResponse.json({ results });
            }

            default:
                return NextResponse.json({
                    error: 'Invalid operation. Supported operations: bulkUpdate, bulkDelete, bulkVerify',
                }, { status: 400 });
        }
    });
} 