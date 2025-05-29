import fetch from 'node-fetch';

async function testEmail() {
    const emailData = {
        to: 'henry.ssekibo@minet.co.ug', // Replace with your email
        subject: 'Test Email from Microsoft Graph',
        body: `
            <h1>Test Email</h1>
            <p>This is a test email sent using Microsoft Graph API.</p>
            <p>If you're receiving this, the integration is working correctly!</p>
        `
    };

    try {
        const response = await fetch('http://localhost:3000/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailData),
        });

        const result = await response.json();
        console.log('Response:', result);
    } catch (error) {
        console.error('Error:', error);
    }
}

testEmail(); 