import { FC } from "react";
import { InterventionDetails } from "./intervention-details";
import { ClientDetails } from "./client-details";
import { CounselorAvailabilityDetails } from "./counselor-availability";
import { LocationDetails } from "./location-details";

export interface ClientDetailsData {
    sessionFor?: 'organization' | 'staff';
    whoFor?: 'self' | 'dependant';
    sessionType?: 'individual' | 'group';
    numAttendees?: number;
    company?: string;
    staff?: string;
    notes?: string;
    dependant?: string;
    clientId?: string;
}

export interface InterventionData {
    service?: string;
    intervention?: string;
    notes?: string;
}

export interface CounselorAvailabilityData {
    provider?: string;
    staff?: string;
    date?: Date;
    timeFormat?: '12hr' | '24hr';
    selectedSlot?: string;
    duration?: string;
}

export interface LocationData {
    location?: string;
    requirements?: string;
}

export interface FormData {
    client: ClientDetailsData;
    intervention: InterventionData;
    counselor: CounselorAvailabilityData;
    location: LocationData;
}

export type SectionKey = keyof FormData;

export type SectionComponentProps<T extends SectionKey> = {
    data: FormData[T];
    setData: (d: FormData[T]) => void;
};

export const sectionComponents = {
    client: ClientDetails as FC<SectionComponentProps<'client'>>,
    intervention: InterventionDetails as FC<SectionComponentProps<'intervention'>>,
    counselor: CounselorAvailabilityDetails as FC<SectionComponentProps<'counselor'>>,
    location: LocationDetails as FC<SectionComponentProps<'location'>>,
} as const;

export interface SessionData {
    client?: {
        id: string;
        name: string;
    };
    staff?: {
        id: string;
        name: string;
        profile?: {
            fullName: string;
        };
    };
    beneficiary?: {
        id: string;
        name: string;
        profile?: {
            fullName: string;
        };
    };
    id: string;
    staffId?: string;
    clientId?: string;
    interventionId?: string;
    providerId?: string;
    beneficiaryId?: string;
    scheduledAt?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    completedAt?: string | null;
    feedback?: string | null;
    cancellationReason?: string | null;
    rescheduleCount: number;
    duration?: number;
    location?: string;
    metadata?: Record<string, any>;
}