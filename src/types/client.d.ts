import { BaseStatus, ContactMethod } from './enums';

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
    metadata?: Record<string, any>;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface ClientResponse {
    data: Client[];
}