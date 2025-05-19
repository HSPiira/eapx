import { NextResponse } from 'next/server';
import { auth } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
        where: { userId: session.user.id },
        select: { fullName: true, image: true },
    });

    if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
}