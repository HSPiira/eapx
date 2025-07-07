import { CreateServiceProviderInput, UpdateServiceProviderInput } from "@/schema/provider";
import { Provider, ProvidersResponse } from "@/types/provider";

export async function fetchProviders(): Promise<ProvidersResponse> {
    const res = await fetch('/api/providers');
    if (!res.ok) {
        throw new Error('Failed to fetch providers');
    }
    return res.json();
}

export async function createProvider(data: CreateServiceProviderInput): Promise<Provider> {
    const res = await fetch('/api/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create provider');
    }
    return res.json();
}

export async function updateProvider(data: UpdateServiceProviderInput & { id: string }): Promise<Provider> {
    const { id, ...rest } = data;
    const res = await fetch(`/api/providers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rest),
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update provider');
    }
    return res.json();
}

export async function deleteProvider(id: string): Promise<void> {
    const res = await fetch(`/api/providers/${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete provider');
    }
}

export async function fetchProviderStaff(providerId: string) {
    const res = await fetch(`/api/providers/${providerId}/staff`);
    if (!res.ok) throw new Error('Failed to fetch provider staff');
    return res.json();
}