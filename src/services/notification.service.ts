import { PrismaClient, type ServiceSession } from '@prisma/client';
import type { SessionNotification } from '@/types/session-booking';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// Create a transporter using environment variables
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

export class NotificationService {
    async sendSessionNotification(notification: Omit<SessionNotification, 'sentAt'>) {
        try {
            // Get recipient details
            const recipient = notification.recipientType === 'STAFF'
                ? await prisma.staff.findUnique({
                    where: { id: notification.recipientId },
                    include: {
                        user: {
                            select: {
                                email: true
                            }
                        }
                    }
                })
                : await prisma.serviceProvider.findUnique({
                    where: { id: notification.recipientId },
                    select: {
                        contactEmail: true
                    }
                });

            if (!recipient) {
                throw new Error('Recipient not found');
            }

            // Get session details
            const session = await prisma.serviceSession.findUnique({
                where: { id: notification.sessionId },
                include: {
                    staff: {
                        include: {
                            profile: true
                        }
                    },
                    provider: true,
                    service: true
                }
            });

            if (!session) {
                throw new Error('Session not found');
            }

            // Prepare email content based on notification type
            const emailContent = this.prepareEmailContent(notification.type, session);

            // Send the email
            const recipientEmail = 'contactEmail' in recipient ? recipient.contactEmail : recipient.user?.email;
            if (!recipientEmail) {
                throw new Error('No email address found for recipient');
            }

            await transporter.sendMail({
                from: process.env.SMTP_FROM_EMAIL,
                to: recipientEmail,
                subject: emailContent.subject,
                text: emailContent.body,
                html: emailContent.body.replace(/\n/g, '<br>'),
            });

            // Create notification record
            const notificationRecord = await prisma.auditLog.create({
                data: {
                    action: 'CREATE',
                    entityType: 'SESSION',
                    entityId: notification.sessionId,
                    userId: notification.recipientId,
                    data: {
                        notificationType: notification.type,
                        recipientType: notification.recipientType,
                        emailContent,
                        sentTo: recipientEmail
                    }
                }
            });

            return notificationRecord;
        } catch (error) {
            console.error('Error sending session notification:', error);
            throw error;
        }
    }

    private prepareEmailContent(type: SessionNotification['type'], session: ServiceSession) {
        const sessionDate = new Date(session.scheduledAt).toLocaleString();
        const staffName = session.staff?.profile?.name || 'Staff member';
        const counselorName = session.provider?.name || 'Counselor';

        switch (type) {
            case 'CONFIRMATION':
                return {
                    subject: 'Session Confirmation',
                    body: `
            Dear ${staffName},
            
            Your counseling session has been confirmed for ${sessionDate}.
            Counselor: ${counselorName}
            Service: ${session.service.name}
            
            Please arrive 5 minutes before your scheduled time.
            
            Best regards,
            The Counseling Team
          `
                };

            case 'REMINDER':
                return {
                    subject: 'Session Reminder',
                    body: `
            Dear ${staffName},
            
            This is a reminder that you have a counseling session scheduled for ${sessionDate}.
            Counselor: ${counselorName}
            Service: ${session.service.name}
            
            Please arrive 5 minutes before your scheduled time.
            
            Best regards,
            The Counseling Team
          `
                };

            case 'FORM_SUBMITTED':
                return {
                    subject: 'Session Form Submitted',
                    body: `
            Dear ${counselorName},
            
            A session form has been submitted for the session on ${sessionDate}.
            Staff: ${staffName}
            Service: ${session.service.name}
            
            Please review the form at your earliest convenience.
            
            Best regards,
            The Counseling Team
          `
                };

            default:
                throw new Error('Invalid notification type');
        }
    }
} 