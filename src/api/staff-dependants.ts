import { StaffDependantResponse } from "@/types/staff-dependants";

export async function fetchDependants(clientId: string, staffId: string): Promise<StaffDependantResponse> {
    const response = await fetch(`/api/clients/${clientId}/staff/${staffId}/beneficiaries`);
    if (!response.ok) throw new Error('Failed to fetch dependants');
    return response.json();
};