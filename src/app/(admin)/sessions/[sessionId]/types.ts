import { FC } from "react";
import { InterventionDetails } from "./intervention-details";
import { ClientDetails } from "./client-details";
import { CounselorAvailabilityDetails } from "./counselor-availability";
import { LocationDetails } from "./location-details";
import { SessionType as PrismaSessionType } from "@prisma/client";

export type SessionType = PrismaSessionType;

export interface ClientDetailsData {
    clientId?: string;
    company?: string;
    sessionFor?: 'organization' | 'staff';
    whoFor?: 'self' | 'dependant';
    sessionType?: SessionType;
    numAttendees?: number;
    staff?: string;
    dependant?: string;
    notes?: string;
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

export interface SessionMetadata {
    numAttendees?: number;
    sessionFor?: 'organization' | 'individual' | 'staff';
    whoFor?: 'self' | 'dependant' | 'other';
    requirements?: string;
    clientNotes?: string;
    interventionNotes?: string;
}

export interface SessionData {
    id: string;
    clientId: string;
    client?: {
        id: string;
        name: string;
    };
    staffId?: string;
    beneficiaryId?: string;
    isGroupSession: boolean;
    notes?: string;
    interventionId?: string;
    providerId?: string;
    providerStaffId?: string;
    scheduledAt?: string;
    duration?: number;
    location?: string;
    metadata?: SessionMetadata;
    status: string;
}