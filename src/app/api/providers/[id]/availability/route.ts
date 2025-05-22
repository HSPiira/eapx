import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = Promise<{ id: string }>;

export async function GET(request: NextRequest, { params }: { params: Params }) {
    try {
        const { id: providerId } = await params;
        const slots = await prisma.counselorAvailability.findMany({
            where: {
                counselorId: providerId
            },
            orderBy: { startTime: 'asc' },
        });
        return NextResponse.json(slots);
    } catch (error) {
        console.error('Error fetching provider availability:', error);
        return NextResponse.json(
            { error: 'Failed to fetch provider availability' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest, { params }: { params: Params }) {
    try {
        const { id: providerId } = await params;
        const body = await request.json();
        if (!body.startTime || !body.endTime) {
            return NextResponse.json({ error: 'startTime and endTime are required' }, { status: 400 });
        }
        const slot = await prisma.counselorAvailability.create({
            data: {
                counselorId: providerId,
                startTime: body.startTime,
                endTime: body.endTime,
                isAvailable: body.isAvailable,
                notes: body.notes,
                metadata: body.metadata,
            },
        });
        return NextResponse.json(slot);
    } catch (error) {
        console.error('Error creating provider availability:', error);
        return NextResponse.json(
            { error: 'Failed to create provider availability' },
            { status: 500 }
        );
    }
} 