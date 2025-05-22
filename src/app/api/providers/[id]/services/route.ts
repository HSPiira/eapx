import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = Promise<{ id: string }>;

export async function GET(request: NextRequest, { params }: { params: Params }) {
    try {
        const { id: providerId } = await params;
        const services = await prisma.serviceProviderService.findMany({
            where: {
                serviceProviderId: providerId
            },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(services);
    } catch (error) {
        console.error('Error fetching provider services:', error);
        return NextResponse.json(
            { error: 'Failed to fetch provider services' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest, { params }: { params: Params }) {
    try {
        const { id: providerId } = await params;
        const body = await request.json();
        if (!body.serviceId) {
            return NextResponse.json({ error: 'serviceId is required' }, { status: 400 });
        }
        const service = await prisma.serviceProviderService.create({
            data: {
                serviceProviderId: providerId,
                serviceId: body.serviceId,
                notes: body.notes,
                isApproved: body.isApproved,
            },
        });
        return NextResponse.json(service);
    } catch (error) {
        console.error('Error creating provider service:', error);
        return NextResponse.json(
            { error: 'Failed to create provider service' },
            { status: 500 }
        );
    }
} 