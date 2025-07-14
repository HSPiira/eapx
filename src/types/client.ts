import { BaseStatus, ContactMethod } from '@prisma/client';

export interface Client {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
    billingAddress?: string;
    taxId?: string;
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    industryId?: string;
    status: BaseStatus;
    preferredContactMethod?: ContactMethod;
    timezone?: string;
    isVerified: boolean;
    notes?: string;
    metadata?: Record<string, unknown>;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface ClientsResponse {
    data: Client[];
    metadata: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface ClientStatsResponse {
    total: number;
    active: number;
    verified: number;
    newInTimeRange: number;
    byStatus: Record<string, number>;
    byIndustry: Record<string, number>;
    byVerification: Record<string, number>;
}

export interface ClientFiltersState {
    search: string;
    status?: BaseStatus | 'all';
    industryId?: string | 'all';
    isVerified?: boolean;
    preferredContactMethod?: ContactMethod;
    createdAfter?: Date;
    createdBefore?: Date;
    hasContract?: boolean;
    hasStaff?: boolean;
} 