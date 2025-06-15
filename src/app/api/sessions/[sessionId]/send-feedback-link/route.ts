import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';
import { generateFeedbackToken } from '@/lib/feedback-token';
import { sendReactEmail } from '@/lib/email-utils';
import { SessionFeedbackRequest } from '@/emails';

export async function POST(request: NextRequest) {
    try {
        const sessionId = request.url.split('/').pop();
        if (!sessionId) {
            return NextResponse.json(
                { error: 'Session ID is required' },
                { status: 400 }
            );
        }

        const session = await auth();
        if (!session?.user?.access_token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get session details from database
        const careSession = await prisma.careSession.findUnique({
            where: { id: sessionId },
            include: {
                provider: true,
                intervention: true,
            },
        });

        if (!careSession || !careSession.provider) {
            return NextResponse.json(
                { error: 'Session not found or has no provider' },
                { status: 404 }
            );
        }

        if (!careSession.scheduledAt) {
            return NextResponse.json(
                { error: 'Session has no scheduled date' },
                { status: 400 }
            );
        }

        // Generate feedback token
        const token = generateFeedbackToken(sessionId, careSession.provider.id);
        const feedbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/session-feedback/${sessionId}?token=${token}`;

        // Send email to provider
        await sendReactEmail({
            to: 'sekiboh@gmail.com', // For testing, send to this address
            subject: `Feedback Request for Session: ${careSession.intervention?.name || 'Session'}`,
            accessToken: session.user.access_token,
            template: SessionFeedbackRequest({
                providerName: careSession.provider.name,
                sessionDate: careSession.scheduledAt,
                interventionName: careSession.intervention?.name,
                feedbackUrl,
            }),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error sending feedback link:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to send feedback link' },
            { status: 500 }
        );
    }
}
