export interface ProviderStaff {
    id: string;
    serviceProviderId?: string;
    fullName: string;
    email: string | null;
    phone: string | null;
    role: string | null;
    status?: string;
    qualifications: string[];
    specializations: string[];
    isPrimaryContact: boolean;
}

export interface ProviderStaffResponse {
    data: ProviderStaff[];
} 