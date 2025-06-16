import { prisma } from '../src/lib/prisma';

async function testFeedbackEmail() {
    try {
        // Create a test service first
        const service = await prisma.service.upsert({
            where: {
                name: 'Counseling',
            },
            update: {},
            create: {
                name: 'Counseling',
                description: 'Professional counseling services',
            },
        });

        // Create a test provider if not exists
        const provider = await prisma.serviceProvider.upsert({
            where: {
                id: 'test-provider-id', // Using a fixed ID for testing
            },
            update: {
                name: 'Henry Ssekibo',
                contactEmail: 'henry.ssekibo@minet.co.ug',
                type: 'COUNSELOR',
                entityType: 'INDIVIDUAL',
                status: 'ACTIVE',
                qualifications: ['MSc in Counseling'],
                specializations: ['Individual Counseling'],
            },
            create: {
                id: 'test-provider-id', // Using a fixed ID for testing
                name: 'Henry Ssekibo',
                contactEmail: 'henry.ssekibo@minet.co.ug',
                type: 'COUNSELOR',
                entityType: 'INDIVIDUAL',
                status: 'ACTIVE',
                qualifications: ['MSc in Counseling'],
                specializations: ['Individual Counseling'],
            },
        });

        // Create a test intervention
        const intervention = await prisma.intervention.create({
            data: {
                name: 'Individual Counseling',
                description: 'One-on-one counseling session',
                serviceId: service.id,
                status: 'ACTIVE',
                duration: 60,
            },
        });

        // Create a test client
        const client = await prisma.client.upsert({
            where: { name: 'Test Client' },
            update: {},
            create: {
                name: 'Test Client',
                status: 'ACTIVE',
            },
        });

        // Create a test session
        const session = await prisma.careSession.create({
            data: {
                clientId: client.id,
                providerId: provider.id,
                interventionId: intervention.id,
                scheduledAt: new Date(),
                status: 'COMPLETED',
                duration: 60,
                sessionType: 'INDIVIDUAL',
            },
            include: {
                provider: true,
                intervention: true,
            },
        });

        // Send feedback request
        const response = await fetch(`http://localhost:3000/api/sessions/${session.id}/send-feedback-link`, {
            method: 'POST',
        });

        const result = await response.json();
        console.log('Response:', result);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testFeedbackEmail(); 