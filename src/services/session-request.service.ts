import { PrismaClient, type CareSession } from '@prisma/client';
import type { SessionRequest, SessionRequestStatus } from '../types/session-booking';

export class SessionRequestService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    /**
     * Creates a new session request
     * @param requestData - The session request data
     * @returns The created session request
     */
    async createRequest(requestData: Omit<SessionRequest, 'createdAt' | 'updatedAt'>): Promise<CareSession> {
        // Validate staff exists
        const staff = await this.prisma.staff.findUnique({
            where: { id: requestData.staffId }
        });

        if (!staff) {
            throw new Error('Staff member not found');
        }

        // Validate counselor if specified
        if (requestData.preferredCounselorId) {
            const counselor = await this.prisma.serviceProvider.findUnique({
                where: { id: requestData.preferredCounselorId }
            });

            if (!counselor) {
                throw new Error('Preferred counselor not found');
            }
        }

        // Get the default counseling service
        const counselingService = await this.prisma.service.findFirst({
            where: {
                name: 'Counseling Session'
            }
        });

        if (!counselingService) {
            throw new Error('Counseling service not found');
        }

        // Create the session request
        const session = await this.prisma.careSession.create({
            data: {
                staffId: requestData.staffId,
                clientId: requestData.clientId,
                providerId: requestData.preferredCounselorId || '',
                interventionId: counselingService.id,
                scheduledAt: requestData.preferredDate || new Date(),
                status: 'SCHEDULED',
                duration: 60, // Default 1-hour session
                metadata: {
                    requestMethod: requestData.requestMethod,
                    requestNotes: requestData.requestNotes
                }
            }
        });

        return session;
    }

    /**
     * Updates the status of a session request
     * @param requestId - The ID of the session request
     * @param status - The new status
     * @param adminId - The ID of the admin making the change
     * @returns The updated session request
     */
    async updateRequestStatus(
        requestId: string,
        status: SessionRequestStatus,
        adminId: string
    ): Promise<CareSession> {
        const session = await this.prisma.careSession.update({
            where: { id: requestId },
            data: {
                status: status === 'APPROVED' ? 'SCHEDULED' : 'CANCELED',
                updatedAt: new Date()
            }
        });

        // Log the status change
        await this.prisma.auditLog.create({
            data: {
                action: 'UPDATE',
                entityType: 'SessionRequest',
                entityId: requestId,
                userId: adminId,
                data: { status }
            }
        });

        return session;
    }

    /**
     * Retrieves all session requests for a staff member
     * @param staffId - The ID of the staff member
     * @returns Array of session requests
     */
    async getStaffRequests(staffId: string): Promise<CareSession[]> {
        return this.prisma.careSession.findMany({
            where: { staffId }
        });
    }

    /**
     * Retrieves all pending session requests
     * @returns Array of pending session requests
     */
    async getPendingRequests(): Promise<CareSession[]> {
        return this.prisma.careSession.findMany({
            where: { status: 'SCHEDULED' }
        });
    }
} 