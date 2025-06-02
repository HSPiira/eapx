import { StaffResponse } from "@/types/staff";

export async function fetchStaffList(clientId: string): Promise<StaffResponse> {
    const response = await fetch(`/api/clients/${clientId}/staff`);
    if (!response.ok) throw new Error('Failed to fetch staff');
    return response.json();
}
