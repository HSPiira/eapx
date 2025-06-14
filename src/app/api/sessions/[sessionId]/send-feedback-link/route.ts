import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateFeedbackToken } from '@/lib/feedback-token';
import { sendReactEmail } from '@/lib/email-utils';
import { SessionFeedbackRequest } from '@/emails';
import { auth } from '@/middleware/auth';

export async function POST(req: NextRequest, context: { params: { sessionId: string } }) {
    try {
        const { params } = context;
        const session = await auth();
        if (!session?.user?.access_token) {
            return NextResponse.json(
                { error: 'No access token found. Please sign in again.' },
                { status: 401 }
            );
        }

        const sessionId = params.sessionId;

        // Get session details
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
            { error: 'Failed to send feedback link' },
            { status: 500 }
        );
    }
} 