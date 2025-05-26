import { Html, Head, Preview, Container, Section, Text, Link, Hr, Img } from '@react-email/components';

const SessionConfirmationEmail = ({
    bookingPerson = 'Booking Person',
    date = 'Friday, 23 May 2025',
    time = '11:00 AM',
    duration = '2 hours',
    topic = 'Session Topic',
    attendees = 4,
    username = 'username',
    counselor = 'counselor.name',
    location = 'Online',
    link = '#',
    logo = 'https://placehold.co/120x40?text=LOGO', // Placeholder logo, replace with your own
    supportEmail = 'support@yourdomain.com',
}) => (
    <Html>
        <Head />
        <Preview>
            Your session on {topic} is confirmed for {date} at {time}.
        </Preview>
        <Container style={{ maxWidth: 600, margin: '0 auto', fontFamily: 'Segoe UI, Arial, sans-serif', background: '#fff', padding: 0, borderRadius: 8, border: '1px solid #eee', boxShadow: '0 2px 8px #f0f0f0' }}>
            {/* Header Bar at the very top */}
            <Section style={{ background: '#0070f3', height: 6, borderTopLeftRadius: 8, borderTopRightRadius: 8, margin: 0, padding: 0 }} />
            {/* Logo below the blue bar */}
            <Section style={{ textAlign: 'center', padding: '24px 0 0 0' }}>
                <Img src={logo} width="120" alt="Your Brand" style={{ display: 'block', margin: '0 auto' }} />
            </Section>
            <Section style={{ padding: '28px 32px 24px 32px' }}>
                <Text style={{ fontSize: 22, fontWeight: 'bold', margin: '0 0 4px 0', color: '#222' }}>Session Booking Confirmation</Text>
                <Text style={{ fontSize: 16, margin: '0 0 18px 0', color: '#444' }}>Dear {bookingPerson},</Text>
                <Section style={{ background: '#f6f8fa', borderRadius: 6, padding: 18, margin: '0 0 20px 0', border: '1px solid #eaeaea' }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16, margin: '0 0 8px 0', color: '#0070f3' }}>{topic}</Text>
                    <Text style={{ margin: '2px 0' }}><strong>Date:</strong> {date}</Text>
                    <Text style={{ margin: '2px 0' }}><strong>Time:</strong> {time}</Text>
                    <Text style={{ margin: '2px 0' }}><strong>Duration:</strong> {duration}</Text>
                    <Text style={{ margin: '2px 0' }}><strong>Number of Attendees:</strong> {attendees}</Text>
                    <Text style={{ margin: '2px 0' }}><strong>Booked by:</strong> {username}</Text>
                    <Text style={{ margin: '2px 0' }}><strong>Counselor:</strong> {counselor}</Text>
                    <Text style={{ margin: '2px 0' }}><strong>Location:</strong> {location}</Text>
                </Section>
                {location === 'Online' && link && (
                    <Section style={{ textAlign: 'center', margin: '0 0 18px 0' }}>
                        <Link
                            href={link}
                            style={{
                                display: 'inline-block',
                                background: '#0070f3',
                                color: '#fff',
                                padding: '12px 28px',
                                borderRadius: 6,
                                fontWeight: 'bold',
                                textDecoration: 'none',
                                fontSize: 16,
                                boxShadow: '0 2px 6px #e0e0e0',
                            }}
                        >
                            Join Session
                        </Link>
                    </Section>
                )}
                <Text style={{ margin: '0 0 12px 0', color: '#444' }}>
                    If you have any questions, please contact us.
                </Text>
                <Text style={{ margin: '0 0 0 0', color: '#444' }}>
                    Best regards,<br />Hope@Minet
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

export default SessionConfirmationEmail; 