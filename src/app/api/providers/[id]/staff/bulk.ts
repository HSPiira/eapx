import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logEntityChange } from '@/lib/audit/logger';
import { withAuth } from '@/middleware/auth';

type Params = { id: string };

export const POST = withAuth(async (request: NextRequest, ...args: unknown[]) => {
    try {
        const userId = request.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: 'User ID not found' }, { status: 401 });
        }
        const { id: providerId } = (args[0] as { params: Params }).params;
        const body = await request.json();
        if (!Array.isArray(body)) {
            return NextResponse.json({ error: 'Array of staff required' }, { status: 400 });
        }
        const created = await prisma.$transaction(
            body.map(staff =>
                prisma.providerStaff.create({
                    data: { ...staff, serviceProviderId: providerId }
                })
            )
        );

        // Do audit logging after the transaction
        await Promise.all(
            created.map((staff) =>
                logEntityChange({
                    entityType: 'ProviderStaff',
                    entityId: staff.id,
                    changeType: 'CREATE',
                    newData: staff,
                    changedBy: userId, // make sure userId is defined
                    metadata: { bulkOperation: true }
                })
            )
        );

        return NextResponse.json({
            message: 'Staff records processed successfully',
            createdCount: created.length,
            createdIds: created.map(s => s.id),
        });

    } catch (error) {
        console.error('Error bulk creating provider staff:', error);
        return NextResponse.json(
            { error: 'Failed to bulk create provider staff' },
            { status: 500 }
        );
    }
});

export const PUT = withAuth(async (request: NextRequest, ...args: unknown[]) => {
    try {
        const userId = request.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: 'User ID not found' }, { status: 401 });
        }

        const { id: providerId } = (args[0] as { params: Params }).params;
        const body = await request.json();
        if (!Array.isArray(body)) {
            return NextResponse.json({ error: 'Array of staff required' }, { status: 400 });
        }
        const updated = await prisma.$transaction(
            body.map(staff =>
                prisma.providerStaff.update({
                    where: { id: staff.id, serviceProviderId: providerId },
                    data: staff
                })
            )
        );

        await Promise.all(
            updated.map((staff) =>
                logEntityChange({
                    entityType: 'ProviderStaff',
                    entityId: staff.id,
                    changeType: 'UPDATE',
                    newData: staff,
                    changedBy: userId, // make sure userId is defined
                    metadata: { bulkOperation: true }
                })
            )
        );

        return NextResponse.json({
            message: 'Staff records updated successfully',
            updatedCount: updated.length,
            updatedIds: updated.map(s => s.id),
        });
    } catch (error) {
        console.error('Error bulk updating provider staff:', error);
        return NextResponse.json(
            { error: 'Failed to bulk update provider staff' },
            { status: 500 }
        );
    }
});

export const DELETE = withAuth(async (request: NextRequest, ...args: unknown[]) => {
    try {
        const userId = request.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: 'User ID not found' }, { status: 401 });
        }

        const { id: providerId } = (args[0] as { params: Params }).params;
        const body = await request.json();
        if (!Array.isArray(body)) {
            return NextResponse.json({ error: 'Array of ids required' }, { status: 400 });
        }
        const deleted = await prisma.$transaction(
            body.map(id =>
                prisma.providerStaff.delete({ where: { id, serviceProviderId: providerId } })
            )
        );

        await Promise.all(
            deleted.map((staff) =>
                logEntityChange({
                    entityType: 'ProviderStaff',
                    entityId: staff.id,
                    changeType: 'DELETE',
                    newData: staff,
                    changedBy: userId, // make sure userId is defined
                    metadata: { bulkOperation: true }
                })
            )
        );

        return NextResponse.json({
            message: 'Staff records deleted successfully',
            deletedCount: deleted.length,
            deletedIds: deleted.map(s => s.id),
        });
    } catch (error) {
        console.error('Error bulk deleting provider staff:', error);
        return NextResponse.json(
            { error: 'Failed to bulk delete provider staff' },
            { status: 500 }
        );
    }
}); 
