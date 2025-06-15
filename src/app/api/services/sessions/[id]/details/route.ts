import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRouteMiddleware } from '@/middleware/api-middleware';

type Params = Promise<{ id: string }>;

export async function GET(
    request: NextRequest,
    { params }: { params: Params }
) {
    return withRouteMiddleware(request, async () => {
        try {
            const { id } = await params;
            if (!id) {
                return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
            }
            const session = await prisma.careSession.findUnique({
                where: { id },
                include: {
                    client: true,
                    staff: true,
                    beneficiary: true,
                    intervention: true,
                    provider: true,
                    providerStaff: true,
                    providerService: true
                }
            });

            if (!session) {
                return NextResponse.json(
                    { error: 'Session not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json(session);
        } catch (error) {
            console.error('Error fetching session details:', error);
            return NextResponse.json(
                { error: 'Failed to fetch session details' },
                { status: 500 }
            );
        }
    });
} 