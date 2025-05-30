export interface Intervention {
    id: string;
    name: string;
    description: string | null;
    serviceId: string;
    service: {
        id: string;
        name: string;
    };
    status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'ARCHIVED' | 'DELETED';
    duration: number | null;
    capacity: number | null;
    prerequisites: string | null;
    isPublic: boolean;
    price: number | null;
    metadata: Record<string, unknown>;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
    serviceProviderId: string | null;
    ServiceProvider?: {
        id: string;
        name: string;
        type: string;
    } | null;
}

export interface Service {
    id: string;
    name: string;
}

export interface InterventionsResponse {
    data: Intervention[];
}
