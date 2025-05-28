import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = Promise<{ id: string, onboardingId: string }>;

export async function GET(request: NextRequest, { params }: { params: Params }) {
    try {
        const { id: providerId, onboardingId } = await params;
        const onboarding = await prisma.providerOnboardingStatus.findFirst({
            where: {
                id: onboardingId,
                serviceProviderId: providerId
            }
        });
        if (!onboarding) {
            return NextResponse.json({ error: 'Onboarding status not found' }, { status: 404 });
        }
        return NextResponse.json(onboarding);
    } catch (error) {
        console.error('Error fetching provider onboarding status:', error);
        return NextResponse.json(
            { error: 'Failed to fetch provider onboarding status' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest, { params }: { params: Params }) {
    try {
        const { id: providerId, onboardingId } = await params;
        const body = await request.json();
        const updated = await prisma.providerOnboardingStatus.update({
            where: { id: onboardingId, serviceProviderId: providerId },
            data: {
                hasSubmittedKYC: body.hasSubmittedKYC,
                hasSignedContract: body.hasSignedContract,
                servicesAligned: body.servicesAligned,
                documentsComplete: body.documentsComplete,
                metadata: body.metadata,
            },
        });
        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating provider onboarding status:', error);
        return NextResponse.json(
            { error: 'Failed to update provider onboarding status' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Params }) {
    try {
        const { id: providerId, onboardingId } = await params;
        await prisma.providerOnboardingStatus.update({
            where: { id: onboardingId, serviceProviderId: providerId },
            data: { deletedAt: new Date() }
        });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting provider onboarding status:', error);
        return NextResponse.json(
            { error: 'Failed to delete provider onboarding status' },
            { status: 500 }
        );
    }
} 