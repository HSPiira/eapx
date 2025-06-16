import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRouteMiddleware } from '@/middleware/api-middleware';

type Params = Promise<{ id: string, serviceProviderServiceId: string }>;

export async function GET(request: NextRequest, { params }: { params: Params }) {
    return withRouteMiddleware(request, async () => {
        try {
            const { id: providerId, serviceProviderServiceId } = await params;
            const service = await prisma.serviceProviderService.findFirst({
                where: {
                    id: serviceProviderServiceId,
                    serviceProviderId: providerId
                }
            });
            if (!service) {
                return NextResponse.json({ error: 'Provider service not found' }, { status: 404 });
            }
            return NextResponse.json(service);
        } catch (error) {
            console.error('Error fetching provider service:', error);
            return NextResponse.json(
                { error: 'Failed to fetch provider service' },
                { status: 500 }
            );
        }
    });
}

export async function PUT(request: NextRequest, { params }: { params: Params }) {
    try {
        const { id: providerId, serviceProviderServiceId } = await params;
        const body = await request.json();
        if (!body.serviceId) {
            return NextResponse.json({ error: 'serviceId is required' }, { status: 400 });
        }
        const updated = await prisma.serviceProviderService.update({
            where: { id: serviceProviderServiceId, serviceProviderId: providerId },
            data: {
                serviceId: body.serviceId,
                notes: body.notes,
                isApproved: body.isApproved,
            },
        });
        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating provider service:', error);
        return NextResponse.json(
            { error: 'Failed to update provider service' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Params }) {
    try {
        const { id: providerId, serviceProviderServiceId } = await params;
        await prisma.serviceProviderService.update({
            where: { id: serviceProviderServiceId, serviceProviderId: providerId },
            data: { deletedAt: new Date() }
        });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting provider service:', error);
        return NextResponse.json(
            { error: 'Failed to delete provider service' },
            { status: 500 }
        );
    }
} 