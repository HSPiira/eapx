import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = Promise<{ id: string }>;

export async function GET(request: NextRequest, { params }: { params: Params }) {
    try {
        const { id: providerId } = await params;
        const onboarding = await prisma.providerOnboardingStatus.findMany({
            where: {
                serviceProviderId: providerId
            },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(onboarding);
    } catch (error) {
        console.error('Error fetching provider onboarding status:', error);
        return NextResponse.json(
            { error: 'Failed to fetch provider onboarding status' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest, { params }: { params: Params }) {
    try {
        const { id: providerId } = await params;
        const body = await request.json();
        const onboarding = await prisma.providerOnboardingStatus.create({
            data: {
                serviceProviderId: providerId,
                hasSubmittedKYC: body.hasSubmittedKYC,
                hasSignedContract: body.hasSignedContract,
                servicesAligned: body.servicesAligned,
                documentsComplete: body.documentsComplete,
                metadata: body.metadata,
            },
        });
        return NextResponse.json(onboarding);
    } catch (error) {
        console.error('Error creating provider onboarding status:', error);
        return NextResponse.json(
            { error: 'Failed to create provider onboarding status' },
            { status: 500 }
        );
    }
} 