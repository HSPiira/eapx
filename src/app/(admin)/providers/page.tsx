import { render } from '@react-email/render';
import CounselorSessionNotificationEmail from '@/components/session-booking/CounselorSessionNotificationEmail';

const sampleEmailData = {
    counselorName: "John Doe",
    clientName: "Jane Doe",
    date: "Friday, 23 May 2025",
    time: "11:00 AM",
    location: "Online",
    mode: "Online",
    link: "https://example.com/join-session",
    sessionType: "Topic/Intervention",
    bookedBy: "janedoe123",
    logo: "https://example.com/logo.png",
    supportEmail: "support@example.com",
};

export default async function ProvidersPage() {
    try {
        const html = await render(
            <CounselorSessionNotificationEmail {...sampleEmailData} />
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
    } catch (error) {
        console.error('Failed to render email:', error);
        return <div>Error rendering email preview</div>;
    }
}