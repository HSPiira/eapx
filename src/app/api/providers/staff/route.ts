import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const staff = await prisma.providerStaff.findMany({
            where: {
                serviceProvider: {
                    entityType: 'COMPANY',
                },
            },
            include: {
                serviceProvider: true,
            },
        });
        return NextResponse.json({ data: staff });
    } catch (error) {
        console.error('Error fetching provider staff:', error);
        return NextResponse.json({ error: 'Failed to fetch provider staff' }, { status: 500 });
    }
} 