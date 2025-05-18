import { NextResponse } from 'next/server';
import { auth } from '@/middleware/auth';
import { IndustryProvider } from '@/providers/industry-provider';

const industryProvider = new IndustryProvider();

export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const parentId = searchParams.get('parentId');

        const result = await industryProvider.list({
            page,
            limit,
            search,
            filters: {
                parentId: parentId || null
            }
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Failed to fetch industries:', error);
        return NextResponse.json(
            { error: 'Failed to fetch industries' },
            { status: 500 }
        );
    }
} 