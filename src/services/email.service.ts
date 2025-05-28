import { Resend } from 'resend';
import { SessionRequestFormData } from '@/components/session-booking/sessionRequestSchema';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailRecipient {
    email: string;
    name: string;
}

interface SessionEmailData extends SessionRequestFormData {
    companyName: string;
    staffName: string;
    counselorName: string;
}

export async function sendSessionRequestEmail(
    data: {
        companyId: string;
        staffId: string;
        counselorId: string;
        interventionId: string;
        sessionMethod: string;
        date: string;
        startTime: string;
        endTime: string;
        sessionType: string;
        companyName: string;
        staffName: string;
        counselorName: string;
        notes: string;
        duration: number;
        isGroupSession: boolean
    },
    recipients: { staff: EmailRecipient; counselor: EmailRecipient; admin: EmailRecipient }
) {
    const { staff, counselor, admin } = recipients;
    const sessionDate = new Date(data.date).toLocaleDateString();
    const sessionTime = `${data.startTime} - ${data.endTime}`;

    // Email to staff member
    await resend.emails.send({
        from: 'Axis Counseling <sessions@axis.com>',
        to: staff.email,
        subject: 'Session Request Confirmation',
        html: `
            <h2>Session Request Confirmation</h2>
            <p>Dear ${staff.name},</p>
            <p>Your session request has been received and is pending confirmation.</p>
            <p><strong>Session Details:</strong></p>
            <ul>
                <li>Type: ${data.sessionType}</li>
                <li>Date: ${sessionDate}</li>
                <li>Time: ${sessionTime}</li>
                <li>Counselor: ${data.counselorName}</li>
                <li>Company: ${data.companyName}</li>
            </ul>
            ${data.notes ? `<p><strong>Additional Notes:</strong><br>${data.notes}</p>` : ''}
            <p>You will receive another email once the session is confirmed.</p>
        `,
    });

    // Email to counselor
    await resend.emails.send({
        from: 'Axis Counseling <sessions@axis.com>',
        to: counselor.email,
        subject: 'New Session Request',
        html: `
            <h2>New Session Request</h2>
            <p>Dear ${counselor.name},</p>
            <p>You have received a new session request that requires your attention.</p>
            <p><strong>Session Details:</strong></p>
            <ul>
                <li>Type: ${data.sessionType}</li>
                <li>Date: ${sessionDate}</li>
                <li>Time: ${sessionTime}</li>
                <li>Staff Member: ${data.staffName}</li>
                <li>Company: ${data.companyName}</li>
            </ul>
            ${data.notes ? `<p><strong>Additional Notes:</strong><br>${data.notes}</p>` : ''}
            <p>Please log in to your dashboard to confirm or reschedule this session.</p>
        `,
    });

    // Email to admin
    await resend.emails.send({
        from: 'Axis Counseling <sessions@axis.com>',
        to: admin.email,
        subject: 'New Session Request Notification',
        html: `
            <h2>New Session Request</h2>
            <p>A new session request has been submitted and requires attention.</p>
            <p><strong>Session Details:</strong></p>
            <ul>
                <li>Type: ${data.sessionType}</li>
                <li>Date: ${sessionDate}</li>
                <li>Time: ${sessionTime}</li>
                <li>Staff Member: ${data.staffName}</li>
                <li>Counselor: ${data.counselorName}</li>
                <li>Company: ${data.companyName}</li>
            </ul>
            ${data.notes ? `<p><strong>Additional Notes:</strong><br>${data.notes}</p>` : ''}
            <p>Please review this request in the admin dashboard.</p>
        `,
    });
}

export async function sendSessionConfirmationEmail(
    data: SessionEmailData,
    recipients: {
        staff: EmailRecipient;
        counselor: EmailRecipient;
    }
) {
    const { staff, counselor } = recipients;
    const sessionDate = new Date(data.date).toLocaleDateString();
    const sessionTime = `${data.startTime} - ${data.endTime}`;

    // Email to staff member
    await resend.emails.send({
        from: 'Axis Counseling <sessions@axis.com>',
        to: staff.email,
        subject: 'Session Confirmed',
        html: `
            <h2>Session Confirmed</h2>
            <p>Dear ${staff.name},</p>
            <p>Your session request has been confirmed.</p>
            <p><strong>Session Details:</strong></p>
            <ul>
                <li>Type: ${data.sessionType}</li>
                <li>Date: ${sessionDate}</li>
                <li>Time: ${sessionTime}</li>
                <li>Counselor: ${data.counselorName}</li>
                <li>Company: ${data.companyName}</li>
            </ul>
            ${data.notes ? `<p><strong>Additional Notes:</strong><br>${data.notes}</p>` : ''}
            <p>Please make sure to join the session on time.</p>
        `,
    });

    // Email to counselor
    await resend.emails.send({
        from: 'Axis Counseling <sessions@axis.com>',
        to: counselor.email,
        subject: 'Session Confirmation',
        html: `
            <h2>Session Confirmation</h2>
            <p>Dear ${counselor.name},</p>
            <p>You have confirmed a new session.</p>
            <p><strong>Session Details:</strong></p>
            <ul>
                <li>Type: ${data.sessionType}</li>
                <li>Date: ${sessionDate}</li>
                <li>Time: ${sessionTime}</li>
                <li>Staff Member: ${data.staffName}</li>
                <li>Company: ${data.companyName}</li>
            </ul>
            ${data.notes ? `<p><strong>Additional Notes:</strong><br>${data.notes}</p>` : ''}
            <p>Please make sure to prepare for the session.</p>
        `,
    });
}

export async function sendSessionCancellationEmail(
    data: SessionEmailData,
    recipients: {
        staff: EmailRecipient;
        counselor: EmailRecipient;
    },
    reason?: string
) {
    const { staff, counselor } = recipients;
    const sessionDate = new Date(data.date).toLocaleDateString();
    const sessionTime = `${data.startTime} - ${data.endTime}`;

    const emailContent = `
        <h2>Session Cancelled</h2>
        <p>Dear {recipient},</p>
        <p>The following session has been cancelled:</p>
        <p><strong>Session Details:</strong></p>
        <ul>
            <li>Type: ${data.sessionType}</li>
            <li>Date: ${sessionDate}</li>
            <li>Time: ${sessionTime}</li>
            <li>Staff Member: ${data.staffName}</li>
            <li>Counselor: ${data.counselorName}</li>
            <li>Company: ${data.companyName}</li>
        </ul>
        ${reason ? `<p><strong>Cancellation Reason:</strong><br>${reason}</p>` : ''}
    `;

    // Email to staff member
    await resend.emails.send({
        from: 'Axis Counseling <sessions@axis.com>',
        to: staff.email,
        subject: 'Session Cancelled',
        html: emailContent.replace('{recipient}', staff.name),
    });

    // Email to counselor
    await resend.emails.send({
        from: 'Axis Counseling <sessions@axis.com>',
        to: counselor.email,
        subject: 'Session Cancelled',
        html: emailContent.replace('{recipient}', counselor.name),
    });
} 