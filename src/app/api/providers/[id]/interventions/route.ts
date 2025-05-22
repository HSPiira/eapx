import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = Promise<{ id: string }>;

export async function GET(request: NextRequest, { params }: { params: Params }) {
    try {
        const { id: providerId } = await params;
        const interventions = await prisma.intervention.findMany({
            where: {
                serviceProviderId: providerId
            },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(interventions);
    } catch (error) {
        console.error('Error fetching provider interventions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch provider interventions' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest, { params }: { params: Params }) {
    try {
        const { id: providerId } = await params;
        const body = await request.json();
        if (!body.name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }
        const intervention = await prisma.intervention.create({
            data: {
                serviceProviderId: providerId,
                name: body.name,
                description: body.description,
                serviceId: body.serviceId,
                status: body.status,
                duration: body.duration,
                capacity: body.capacity,
                prerequisites: body.prerequisites,
                isPublic: body.isPublic,
                price: body.price,
                metadata: body.metadata,
            },
        });
        return NextResponse.json(intervention);
    } catch (error) {
        console.error('Error creating provider intervention:', error);
        return NextResponse.json(
            { error: 'Failed to create provider intervention' },
            { status: 500 }
        );
    }
} 