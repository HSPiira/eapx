// Request method for session booking
export type RequestMethod = 'EMAIL' | 'PHONE';

// Status for session requests
export type SessionRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// Status for session forms
export type SessionFormStatus = 'PENDING' | 'SUBMITTED' | 'EXPIRED';

// Interface for session request data
export interface SessionRequest {
    clientId: string;
    staffId: string;
    preferredDate?: Date;
    preferredCounselorId?: string;
    requestMethod: RequestMethod;
    requestNotes?: string;
    status: SessionRequestStatus;
    createdAt: Date;
    updatedAt: Date;
}

// Interface for session form data
export interface SessionFormData {
    sessionId: string;
    counselorId: string;
    formData: {
        notes: string;
        recommendations: string;
        followUpRequired: boolean;
        followUpNotes?: string;
        riskAssessment?: {
            level: 'LOW' | 'MEDIUM' | 'HIGH';
            notes?: string;
        };
    };
    status: SessionFormStatus;
    submittedAt?: Date;
    expiresAt: Date;
}

// Interface for counselor availability
export interface CounselorAvailability {
    id?: string;
    counselorId: string;
    startTime: Date;
    endTime: Date;
    isAvailable: boolean;
    notes?: string;
    metadata?: Record<string, unknown>;
    deletedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    counselor?: {
        id: string;
        name: string;
        type: string;
        profile?: {
            id: string;
            fullName: string;
            email?: string;
            phone?: string;
        };
    };
}

// Interface for session notification
export interface SessionNotification {
    type: 'CONFIRMATION' | 'REMINDER' | 'FORM_SUBMITTED';
    sessionId: string;
    recipientId: string;
    recipientType: 'STAFF' | 'COUNSELOR';
    status: 'PENDING' | 'SENT' | 'FAILED';
    sentAt?: Date;
} 