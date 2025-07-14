import { Service } from "@/types/services";
import { CreateServiceInput } from "@/schema/service";

export async function fetchServices(): Promise<{ data: Service[] }> {
    const res = await fetch('/api/services');
    if (!res.ok) throw new Error('Failed to fetch services');
    return res.json();
}

export async function createService(data: CreateServiceInput): Promise<Service> {
    const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        cache: 'no-store'
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create service');
    }

    return response.json();
}