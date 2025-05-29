// lib/microsoftGraph.ts
import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';

const tenantId = process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID!;
const clientId = process.env.AUTH_MICROSOFT_ENTRA_ID_ID!;
const clientSecret = process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!;
const senderEmail = "noreply@minet.co.ug"; // e.g., noreply@yourdomain.com

export async function sendEmailGraph({ to, subject, body }: {
    to: string;
    subject: string;
    body: string;
}) {
    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    const token = await credential.getToken('https://graph.microsoft.com/.default');

    const client = Client.init({
        authProvider: done => done(null, token.token),
    });

    const email = {
        message: {
            subject,
            body: {
                contentType: 'HTML',
                content: body,
            },
            toRecipients: [
                {
                    emailAddress: {
                        address: to,
                    },
                },
            ],
        },
        saveToSentItems: false,
    };

    return await client.api(`/users/${senderEmail}/sendMail`).post(email);
}
