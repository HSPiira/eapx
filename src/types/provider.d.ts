import { Intervention, ServiceProviderService, ProviderOnboardingStatus, ProviderStaff, CareSession, Document } from '@/types';

export interface Provider {
    id: string;
    name: string;
    type: 'COUNSELOR' | 'CLINIC' | 'HOTLINE' | 'COACH' | 'OTHER';
    contactEmail: string;
    contactPhone: string | null;
    location: string | null;
    entityType: 'INDIVIDUAL' | 'COMPANY';
    qualifications: string[];
    specializations: string[];
    rating: number | null;
    isVerified: boolean;
    metadata: Record<string, unknown>;
    status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED' | 'SUSPENDED' | 'RESIGNED';
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
    interventions: Intervention[];
    CareSession: CareSession[];
    documents: Document[];
    ProviderStaff: ProviderStaff[];
    ServiceProviderService: ServiceProviderService[];
    ProviderOnboardingStatus: ProviderOnboardingStatus[];
}

export interface ProvidersResponse {
    data: Provider[];
}