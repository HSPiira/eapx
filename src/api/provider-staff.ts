import { ProviderStaff } from "@/types/provider-staff";

interface ProviderStaffResponse {
    data: ProviderStaff[];
}

interface CreateStaffInput {
    fullName: string;
    role: string | null;
    email: string | null;
    phone: string | null;
    serviceProviderId?: string;
    qualifications: string[];
    specializations: string[];
    isPrimaryContact: boolean;
}

interface UpdateStaffInput extends Partial<CreateStaffInput> {
    id: string;
}

export async function fetchProviderStaff(providerId?: string): Promise<ProviderStaffResponse> {
    if (providerId) {
        const response = await fetch(`/api/providers/${providerId}/staff`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch provider staff');
        }
        return response.json();
    } else {
        const response = await fetch(`/api/providers/staff`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch provider staff');
        }
        return response.json();
    }
}

export async function createProviderStaff(providerId: string, data: CreateStaffInput): Promise<ProviderStaff> {
    const response = await fetch(`/api/providers/${providerId}/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create staff member');
    }
    return response.json();
}

export async function updateProviderStaff(providerId: string, data: UpdateStaffInput): Promise<ProviderStaff> {
    const { id, ...updateData } = data;
    const response = await fetch(`/api/providers/${providerId}/staff/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update staff member');
    }
    return response.json();
}

export async function deleteProviderStaff(providerId: string, staffId: string): Promise<void> {
    const response = await fetch(`/api/providers/${providerId}/staff/${staffId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete staff member');
    }
}
