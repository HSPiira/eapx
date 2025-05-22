import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ActionType } from '@prisma/client';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const userId = searchParams.get('userId');
        const entityType = searchParams.get('entityType');
        const entityId = searchParams.get('entityId');
        const action = searchParams.get('action');
        const skip = (page - 1) * limit;
        const where = {
            ...(userId ? { userId } : {}),
            ...(entityType ? { entityType } : {}),
            ...(entityId ? { entityId } : {}),
            ...(action ? { action: action as ActionType } : {}),
        };
        const total = await prisma.auditLog.count({ where });
        const logs = await prisma.auditLog.findMany({
            where,
            orderBy: { timestamp: 'desc' },
            skip,
            take: limit,
        });
        return NextResponse.json({
            data: logs,
            metadata: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch audit logs' },
            { status: 500 }
        );
    }
} 