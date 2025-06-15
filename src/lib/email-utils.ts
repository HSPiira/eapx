import { render } from '@react-email/render';
import { sendEmailGraph } from './ms-graph';
import type { ReactElement } from 'react';

export async function sendReactEmail({
    template,
    to,
    subject,
    accessToken,
    sendAs,
    sendOnBehalfOf,
    cc,
    bcc,
}: {
    template: ReactElement;
    to: string;
    subject: string;
    accessToken: string;
    sendAs?: string;
    sendOnBehalfOf?: string;
    cc?: string[];
    bcc?: string[];
}) {
    // Render the React email template to HTML
    const html = await render(template);

    // Send the email using Microsoft Graph
    return sendEmailGraph({
        to,
        subject,
        body: html,
        accessToken,
        sendAs,
        sendOnBehalfOf,
        cc,
        bcc,
    });
} 