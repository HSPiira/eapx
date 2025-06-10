import * as emailService from './email.service';
import { Resend } from 'resend';
import { SessionMethod, SessionType } from '@/components/session-booking/sessionRequestSchema';

// Mock the Resend module
jest.mock('resend', () => {
    const mockSend = jest.fn().mockResolvedValue({ id: 'mock-email-id' });
    return {
        Resend: jest.fn().mockImplementation(() => ({
            emails: {
                send: mockSend
            }
        }))
    };
});

// Get the mock function after the module is mocked
const mockSend = (new Resend()).emails.send;

describe('email.service', () => {
    const mockRequestData = {
        companyId: 'company-123',
        staffId: 'staff-123',
        counselorId: 'counselor-123',
        interventionId: 'intervention-123',
        sessionMethod: 'online' as SessionMethod,
        date: '2024-03-20',
        startTime: '10:00',
        endTime: '11:00',
        sessionType: 'individual' as SessionType,
        companyName: 'Test Company',
        staffName: 'John Staff',
        counselorName: 'Jane Counselor',
        notes: 'Test notes',
        duration: 60,
        isGroupSession: false
    };

    const mockSessionData = {
        ...mockRequestData,
        date: new Date('2024-03-20')
    };

    const mockRecipients = {
        staff: {
            email: 'staff@test.com',
            name: 'John Staff'
        },
        counselor: {
            email: 'counselor@test.com',
            name: 'Jane Counselor'
        },
        admin: {
            email: 'admin@test.com',
            name: 'Admin User'
        }
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('sendSessionRequestEmail', () => {
        it('should send emails to staff, counselor, and admin', async () => {
            await emailService.sendSessionRequestEmail(mockRequestData, mockRecipients);

            expect(mockSend).toHaveBeenCalledTimes(3);

            // Verify staff email
            expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
                to: mockRecipients.staff.email,
                subject: 'Session Request Confirmation'
            }));

            // Verify counselor email
            expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
                to: mockRecipients.counselor.email,
                subject: 'New Session Request'
            }));

            // Verify admin email
            expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
                to: mockRecipients.admin.email,
                subject: 'New Session Request Notification'
            }));
        });
    });

    describe('sendSessionConfirmationEmail', () => {
        it('should send confirmation emails to staff and counselor', async () => {
            await emailService.sendSessionConfirmationEmail(
                mockSessionData,
                {
                    staff: mockRecipients.staff,
                    counselor: mockRecipients.counselor
                }
            );

            expect(mockSend).toHaveBeenCalledTimes(2);

            // Verify staff email
            expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
                to: mockRecipients.staff.email,
                subject: 'Session Confirmed'
            }));

            // Verify counselor email
            expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
                to: mockRecipients.counselor.email,
                subject: 'Session Confirmation'
            }));
        });
    });

    describe('sendSessionCancellationEmail', () => {
        it('should send cancellation emails to staff and counselor', async () => {
            const cancellationReason = 'Emergency situation';
            await emailService.sendSessionCancellationEmail(
                mockSessionData,
                {
                    staff: mockRecipients.staff,
                    counselor: mockRecipients.counselor
                },
                cancellationReason
            );

            expect(mockSend).toHaveBeenCalledTimes(2);

            // Verify staff email
            expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
                to: mockRecipients.staff.email,
                subject: 'Session Cancelled'
            }));

            // Verify counselor email
            expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
                to: mockRecipients.counselor.email,
                subject: 'Session Cancelled'
            }));
        });

        it('should handle cancellation without a reason', async () => {
            await emailService.sendSessionCancellationEmail(
                mockSessionData,
                {
                    staff: mockRecipients.staff,
                    counselor: mockRecipients.counselor
                }
            );

            expect(mockSend).toHaveBeenCalledTimes(2);
        });
    });
}); 