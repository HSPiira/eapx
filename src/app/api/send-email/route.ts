// app/api/send-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendEmailGraph } from '@/lib/ms-graph';
import { sendReactEmail } from '@/lib/email-utils';
import { auth } from '@/middleware/auth';
import { VercelInviteUserEmail } from '@/emails/vercel-invite-user';
import { createElement } from 'react';

const emailTemplates = {
    'vercel-invite-user': VercelInviteUserEmail,
} as const;

export async function POST(req: NextRequest) {
    const session = await auth();

    if (!session?.user?.access_token) {
        return NextResponse.json(
            { success: false, error: 'No access token found. Please sign in again.' },
            { status: 401 }
        );
    }

    const {
        to,
        subject,
        body,
        template,
        templateProps,
        sendAs,
        sendOnBehalfOf,
        cc,
        bcc
    } = await req.json();

    try {
        if (template && template in emailTemplates) {
            // Use React email template
            const Template = emailTemplates[template as keyof typeof emailTemplates];
            await sendReactEmail({
                template: createElement(Template, templateProps),
                to,
                subject,
                accessToken: session.user.access_token,
                sendAs,
                sendOnBehalfOf,
                cc,
                bcc
            });
        } else {
            // Use plain text/HTML body
            await sendEmailGraph({
                to,
                subject,
                body,
                accessToken: session.user.access_token,
                sendAs,
                sendOnBehalfOf,
                cc,
                bcc
            });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Email sending error:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}
