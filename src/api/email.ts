import { EmailInput } from "@/schema/email";
import { EmailResponse, BulkEmailResponse } from "@/types/email";

type EmailTemplate = 'vercel-invite-user' | 'session-feedback-request';

interface TemplateEmailInput extends Omit<EmailInput, 'body'> {
    template: EmailTemplate;
    templateProps: Record<string, unknown>;
}

export async function sendEmail(data: EmailInput | TemplateEmailInput): Promise<EmailResponse> {
    const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to send email');
    }

    return {
        id: Date.now().toString(), // Since MS Graph doesn't return an ID
        status: 'sent' as const
    };
}

export async function sendBulkEmails(emails: (EmailInput | TemplateEmailInput)[]): Promise<BulkEmailResponse> {
    const results = await Promise.all(
        emails.map(async (email) => {
            try {
                await sendEmail(email);
                return {
                    id: Date.now().toString(),
                    status: 'sent' as const
                };
            } catch (error) {
                return {
                    id: null,
                    status: 'failed' as const,
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
            }
        })
    );

    const successful = results.filter(r => r.status === 'sent').length;
    const failed = results.filter(r => r.status === 'failed').length;

    return {
        emails: results,
        total: results.length,
        successful,
        failed
    };
}

export async function getEmailStatus(emailId: string): Promise<EmailResponse> {
    // Since MS Graph doesn't provide email status tracking,
    // we'll return a default response
    return {
        id: emailId,
        status: 'sent' as const
    };
}
