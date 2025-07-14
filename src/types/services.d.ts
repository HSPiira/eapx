export * from '../../components/admin/services/service-form';

export interface Service {
    id: string;
    name: string;
    description: string | null;
    status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'ARCHIVED' | 'DELETED';
    duration: number | null;
    capacity: number | null;
    isPublic: boolean;
    price: number | null;
    intervention: {
        id: string;
        name: string;
    };
    ServiceProvider?: {
        id: string;
        name: string;
        type: string;
    } | null;
}

export interface ServicesResponse {
    data: Service[];
}