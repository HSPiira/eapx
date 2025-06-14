// lib/microsoftGraph.ts
import { Client } from '@microsoft/microsoft-graph-client';

// Microsoft Graph API Scopes
export const MS_GRAPH_SCOPES = {
    // Authentication scopes
    auth: [
        'openid',
        'profile',
        'email',
        'offline_access'
    ],
    // Mail related scopes
    mail: [
        'Mail.Read',
        'Mail.ReadWrite',
        'Mail.ReadWrite.Shared',
        'Mail.Send',
        'Mail.Send.Shared'
    ],
    // Teams/Meetings related scopes
    meetings: [
        'OnlineMeetings.Read',
        'OnlineMeetings.ReadWrite'
    ],

    // Calendar related scopes
    calendar: [
        'Calendars.Read',
        'Calendars.ReadWrite',
        'Calendars.Read.Shared',
        'Calendars.ReadWrite.Shared',
        'Calendars.ReadBasic',
    ],

    // User related scopes
    user: [
        'User.Read'
    ]
} as const;

// Helper function to get all scopes as a space-separated string
export const getAllScopes = () => {
    return Object.values(MS_GRAPH_SCOPES)
        .flat()
        .join(' ');
};

type SendEmailOptions = {
    to: string;
    subject: string;
    body: string;
    accessToken: string;
    sendAs?: string; // Email address to send as
    sendOnBehalfOf?: string; // Email address to send on behalf of
    cc?: string[];
    bcc?: string[];
};

export async function sendEmailGraph({
    to,
    subject,
    body,
    accessToken,
    sendAs,
    sendOnBehalfOf,
    cc,
    bcc
}: SendEmailOptions) {
    const client = Client.init({
        authProvider: done => done(null, accessToken),
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
            ...(cc && {
                ccRecipients: cc.map(address => ({
                    emailAddress: { address }
                }))
            }),
            ...(bcc && {
                bccRecipients: bcc.map(address => ({
                    emailAddress: { address }
                }))
            }),
        },
        saveToSentItems: true,
    };

    // Determine the API endpoint based on the sending options
    let endpoint = '/me/sendMail';

    if (sendAs) {
        // Send as another user (requires Mail.Send.Shared permission)
        endpoint = `/users/${sendAs}/sendMail`;
    } else if (sendOnBehalfOf) {
        // Send on behalf of another user (requires Mail.Send.Shared permission)
        endpoint = `/users/${sendOnBehalfOf}/sendMail`;
    }

    return await client.api(endpoint).post(email);
}
