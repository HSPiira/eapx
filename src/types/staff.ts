export interface StaffApiResponse {
    id: string;
    name: string;
    email: string | null;
    companyId: string;
    jobTitle: string;
    status: string;
    startDate: string;
    client: {
        name: string;
    } | null;
} 