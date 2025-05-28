import * as emailService from './email.service';

describe('email.service', () => {
    new Date().toISOString();
    it('should have sendSessionRequestEmail defined', () => {
        expect(typeof emailService.sendSessionRequestEmail).toBe('function');
    });

    it('should have sendSessionConfirmationEmail defined', () => {
        expect(typeof emailService.sendSessionConfirmationEmail).toBe('function');
    });

    it('should have sendSessionCancellationEmail defined', () => {
        expect(typeof emailService.sendSessionCancellationEmail).toBe('function');
    });

    // Optionally, you can add tests that call the functions with mock data but mock resend.emails.send
}); 