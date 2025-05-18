import { NextResponse } from 'next/server';
import { auth } from '@/middleware/auth';
import { IndustryProvider } from '@/providers/industry-provider';

const industryProvider = new IndustryProvider();

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const industry = await industryProvider.get(params.id);
        if (!industry) {
            return NextResponse.json(
                { error: 'Industry not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(industry);
    } catch (error) {
        console.error('Failed to fetch industry:', error);
        return NextResponse.json(
            { error: 'Failed to fetch industry' },
            { status: 500 }
        );
    }
} 