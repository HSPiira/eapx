import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Section,
    Text,
} from '@react-email/components';
import * as React from 'react';

interface SessionFeedbackRequestProps {
    providerName: string;
    sessionDate: Date;
    interventionName?: string;
    feedbackUrl: string;
}

export const SessionFeedbackRequest = ({
    providerName,
    sessionDate,
    interventionName,
    feedbackUrl,
}: SessionFeedbackRequestProps) => {
    const previewText = `Please provide feedback for your ${interventionName || 'recent'} session`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Session Feedback Request</Heading>
                    <Text style={text}>Hello {providerName},</Text>
                    <Text style={text}>
                        We would appreciate your feedback for the {interventionName || 'session'} that took place on{' '}
                        {new Date(sessionDate).toLocaleDateString()}.
                    </Text>
                    <Text style={text}>
                        Your feedback helps us improve our services and better support our clients.
                    </Text>
                    <Section style={buttonContainer}>
                        <Button style={button} href={feedbackUrl}>
                            Provide Feedback
                        </Button>
                    </Section>
                    <Text style={{ ...text, fontSize: '15px', margin: '8px 0 0 0' }}>
                        If the button above does not work, copy and paste this link into your browser:
                    </Text>
                    <Section style={{ padding: '8px 0' }}>
                        <Link href={feedbackUrl} style={{ color: '#0070f3', wordBreak: 'break-all', fontSize: '15px' }}>
                            {feedbackUrl}
                        </Link>
                    </Section>
                    <Text style={text}>
                        This link is unique to you and will expire in 7 days.
                    </Text>
                    <Text style={text}>
                        Thank you for your time and valuable input!
                    </Text>
                    <Text style={footer}>
                        If you did not request this feedback form, you can safely ignore this email.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

const main = {
    backgroundColor: '#ffffff',
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: '0 auto',
    padding: '20px 0 48px',
    maxWidth: '560px',
};

const h1 = {
    color: '#333',
    fontSize: '24px',
    fontWeight: '600',
    lineHeight: '1.3',
    margin: '16px 0',
};

const text = {
    color: '#444',
    fontSize: '16px',
    lineHeight: '1.5',
    margin: '16px 0',
};

const buttonContainer = {
    padding: '24px 0',
};

const button = {
    backgroundColor: '#0070f3',
    borderRadius: '5px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    padding: '12px 24px',
};

const footer = {
    color: '#898989',
    fontSize: '14px',
    lineHeight: '1.5',
    margin: '32px 0 0',
}; 