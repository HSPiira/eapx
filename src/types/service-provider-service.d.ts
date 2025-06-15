export interface ServiceProviderService {
    id: string;
    serviceId: string;
    notes: string | null;
    isApproved: boolean;
}

export interface ServiceProviderServicesResponse {
    data: ServiceProviderService[];
} 