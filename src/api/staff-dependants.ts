
export async function fetchDependants(clientId: string, staffId: string) {
    const response = await fetch(`/api/clients/${clientId}/staff/${staffId}/beneficiaries`);
    if (!response.ok) throw new Error(`Failed to fetch dependants: ${response.status} ${response.statusText}`);
    return response.json();
}
