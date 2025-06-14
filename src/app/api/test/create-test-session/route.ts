import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/middleware/auth';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.access_token) {
            return NextResponse.json(
                { error: 'No access token found. Please sign in again.' },
                { status: 401 }
            );
        }

        // Create a test service
        const testService = await prisma.service.upsert({
            where: { name: 'Counseling' },
            update: {},
            create: {
                name: 'Counseling',
                description: 'Professional counseling services',
            },
        });

        // Create a test provider
        const testProvider = await prisma.serviceProvider.upsert({
            where: { id: 'test-provider-id' },
            update: {
                name: 'Henry Ssekibo',
                contactEmail: session.user.email || 'henry.ssekibo@minet.co.ug',
                type: 'COUNSELOR',
                entityType: 'INDIVIDUAL',
                status: 'ACTIVE',
                qualifications: ['MSc in Counseling'],
                specializations: ['Individual Counseling'],
            },
            create: {
                id: 'test-provider-id',
                name: 'Henry Ssekibo',
                contactEmail: session.user.email || 'henry.ssekibo@minet.co.ug',
                type: 'COUNSELOR',
                entityType: 'INDIVIDUAL',
                status: 'ACTIVE',
                qualifications: ['MSc in Counseling'],
                specializations: ['Individual Counseling'],
            },
        });

        // Create a test intervention
        const testIntervention = await prisma.intervention.create({
            data: {
                name: 'Individual Counseling',
                description: 'One-on-one counseling session',
                serviceId: testService.id,
                status: 'ACTIVE',
                duration: 60,
            },
        });

        // Create a test client
        const testClient = await prisma.client.upsert({
            where: { name: 'Test Client' },
            update: {},
            create: {
                name: 'Test Client',
                status: 'ACTIVE',
            },
        });

        // Create a test session
        const testSession = await prisma.careSession.create({
            data: {
                clientId: testClient.id,
                providerId: testProvider.id,
                interventionId: testIntervention.id,
                scheduledAt: new Date(),
                status: 'COMPLETED',
                duration: 60,
                sessionType: 'INDIVIDUAL',
            },
        });

        return NextResponse.json({ sessionId: testSession.id });
    } catch (error) {
        console.error('Error creating test session:', error);
        return NextResponse.json(
            { error: 'Failed to create test session' },
            { status: 500 }
        );
    }
} 