import { Html, Head, Preview, Container, Section, Text, Link, Hr, Img } from '@react-email/components';

const CounselorSessionNotificationEmail = ({
    counselorName = 'Counselor',
    clientName = 'Client Name',
    date = 'Day, Date',
    time = 'Start – End',
    location = 'Physical location',
    mode = 'Online', // or 'Physical'
    link = '',
    sessionType = 'Topic/Intervention',
    bookedBy = 'username',
    logo = 'https://placehold.co/120x40?text=LOGO',
    supportEmail = 'support@yourdomain.com',
}) => (
    <Html>
        <Head />
        <Preview>
            New session scheduled: {clientName} on {date} at {time} ({mode})
        </Preview>
        <Container style={{ maxWidth: 600, margin: '0 auto', fontFamily: 'Segoe UI, Arial, sans-serif', background: '#fff', padding: 0, borderRadius: 8, border: '1px solid #eee', boxShadow: '0 2px 8px #f0f0f0' }}>
            {/* Header Bar at the very top */}
            <Section style={{ background: '#0070f3', height: 6, borderTopLeftRadius: 8, borderTopRightRadius: 8, margin: 0, padding: 0 }} />
            {/* Logo below the blue bar */}
            <Section style={{ textAlign: 'center', padding: '24px 0 0 0' }}>
                <Img src={logo} width="120" alt="Your Brand" style={{ display: 'block', margin: '0 auto' }} />
            </Section>
            <Section style={{ padding: '28px 32px 24px 32px' }}>
                <Text style={{ fontSize: 22, fontWeight: 'bold', margin: '0 0 4px 0', color: '#222' }}>Session Scheduled Notification</Text>
                <Text style={{ fontSize: 16, margin: '0 0 18px 0', color: '#444' }}>Dear {counselorName},</Text>
                <Text style={{ margin: '0 0 18px 0', color: '#444' }}>I hope this message finds you well.<br />A session has been scheduled for you with the following details:</Text>
                <Section style={{ background: '#f6f8fa', borderRadius: 6, padding: 18, margin: '0 0 20px 0', border: '1px solid #eaeaea' }}>
                    <Text style={{ margin: '2px 0' }}><strong>Client:</strong> {clientName}</Text>
                    <Text style={{ margin: '2px 0' }}><strong>Date:</strong> {date}</Text>
                    <Text style={{ margin: '2px 0' }}><strong>Time:</strong> {time}</Text>
                    <Text style={{ margin: '2px 0' }}><strong>Location/Mode:</strong> {mode === 'Online' && link ? (<Link href={link} style={{ color: '#0070f3' }}>Online (Join Link)</Link>) : location}</Text>
                    <Text style={{ margin: '2px 0' }}><strong>Session Type:</strong> {sessionType}</Text>
                    <Text style={{ margin: '2px 0' }}><strong>Booked by:</strong> {bookedBy}</Text>
                </Section>
                <Text style={{ margin: '0 0 12px 0', color: '#444' }}>
                    Please let us know if you require any additional information, or if you are unable to attend this session as scheduled.
                </Text>
                <Text style={{ margin: '0 0 0 0', color: '#444' }}>
                    Thank you for your continued support and care.<br />
                    Warm regards,<br />Hope@Minet
                </Text>
            </Section>
            <Hr style={{ borderColor: '#eee', margin: '0 0 12px 0' }} />
            <Text style={{ fontSize: 12, color: '#888', textAlign: 'center', margin: '0 0 16px 0' }}>
                Need help? Contact us at <Link href={`mailto:${supportEmail}`}>{supportEmail}</Link><br />
                This is an automated message, please do not reply.
            </Text>
        </Container>
    </Html>
);

export default CounselorSessionNotificationEmail;
