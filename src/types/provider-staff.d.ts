export interface ProviderStaff {
    id: string;
    fullName: string;
    email: string | null;
    phone: string | null;
    role: string | null;
    qualifications: string[];
    specializations: string[];
    isPrimaryContact: boolean;
}

export interface ProviderStaffResponse {
    data: ProviderStaff[];
} 