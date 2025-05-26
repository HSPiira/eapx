import { render } from '@react-email/render';
import CounselorSessionNotificationEmail from '@/components/session-booking/CounselorSessionNotificationEmail';

export default async function ProvidersPage() {
    const html = await render(
        <CounselorSessionNotificationEmail
            counselorName="John Doe"
            clientName="Jane Doe"
            date="Friday, 23 May 2025"
            time="11:00 AM"
            location="Online"
            mode="Online"
            link="https://example.com/join-session"
            sessionType="Topic/Intervention"
            bookedBy="janedoe123"
            logo="https://example.com/logo.png"
            supportEmail="support@example.com"
        />
    );

    return (
        <div style={{ background: '#f0f0f0', minHeight: '100vh', padding: 40 }}>
            <iframe
                srcDoc={html}
                style={{ width: '100%', height: '90vh', border: '1px solid #ccc', background: '#fff' }}
                title="Email Preview"
            />
        </div>
    );
}