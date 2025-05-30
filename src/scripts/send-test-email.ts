import { sendSessionRequestEmail } from '../services/email.service';

async function sendTestEmail() {
    try {
        console.log('Starting email test...');
        console.log('API Key:', process.env.RESEND_API_KEY ? 'Present' : 'Missing');

        const testData = {
            companyId: 'test-company',
            staffId: 'test-staff',
            counselorId: 'test-counselor',
            interventionId: 'test-intervention',
            sessionMethod: 'online',
            date: '2024-03-20',
            startTime: '10:00',
            endTime: '11:00',
            sessionType: 'individual',
            companyName: 'Test Company',
            staffName: 'Test Staff',
            counselorName: 'Test Counselor',
            notes: 'This is a test email',
            duration: 60,
            isGroupSession: false
        };

        // Using only the verified email address for testing
        const recipients = {
            staff: {
                email: 'sekiboh@gmail.com',
                name: 'Test Staff'
            },
            counselor: {
                email: 'sekiboh@gmail.com',
                name: 'Test Counselor'
            },
            admin: {
                email: 'sekiboh@gmail.com',
                name: 'Test Admin'
            }
        };

        console.log('Sending test email to:', recipients.staff.email);

        // Add a delay between each email send
        const result = await sendSessionRequestEmail(testData, recipients);
        console.log('Email sending result:', result);
        console.log('Email sent successfully!');
    } catch (error) {
        console.error('Error sending email:', error);
        if (error instanceof Error) {
            console.error('Error details:', error.message);
            console.error('Error stack:', error.stack);
        }
    }
}

// Run the function
sendTestEmail(); 