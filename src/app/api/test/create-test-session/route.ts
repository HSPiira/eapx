import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/middleware/auth';

export async function POST() {
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

        // Create a test provider with a unique ID based on the user's email
        const providerId = `test-provider-${session.user.email?.replace(/[^a-zA-Z0-9]/g, '-')}`;
        const testProvider = await prisma.serviceProvider.upsert({
            where: { id: providerId },
            update: {
                name: 'Test Provider',
                contactEmail: session.user.email || 'test@example.com',
                type: 'COUNSELOR',
                entityType: 'INDIVIDUAL',
                status: 'ACTIVE',
                qualifications: ['MSc in Counseling'],
                specializations: ['Individual Counseling'],
            },
            create: {
                id: providerId,
                name: 'Test Provider',
                contactEmail: session.user.email || 'test@example.com',
                type: 'COUNSELOR',
                entityType: 'INDIVIDUAL',
                status: 'ACTIVE',
                qualifications: ['MSc in Counseling'],
                specializations: ['Individual Counseling'],
            },
        });

        // Create a test intervention
        const testIntervention = await prisma.intervention.upsert({
            where: {
                id: 'test-intervention-id'
            },
            update: {
                name: 'Individual Counseling',
                description: 'One-on-one counseling session',
                serviceId: testService.id,
                status: 'ACTIVE',
                duration: 60,
            },
            create: {
                id: 'test-intervention-id',
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

        // Verify the session was created with the provider
        const createdSession = await prisma.careSession.findUnique({
            where: { id: testSession.id },
            include: { provider: true }
        });

        if (!createdSession?.provider) {
            throw new Error('Failed to create session with provider');
        }

        return NextResponse.json({ sessionId: testSession.id });
    } catch (error) {
        console.error('Error creating test session:', error);
        return NextResponse.json(
            { error: 'Failed to create test session' },
            { status: 500 }
        );
    }
} 