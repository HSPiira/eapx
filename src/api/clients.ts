export const fetchClients = async () => {
    const response = await fetch('/api/clients');
    if (!response.ok) throw new Error('Failed to fetch clients');
    return response.json();
};

export const fetchClientStats = async (filters: Record<string, string>) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`/api/clients/stats?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch client stats');
    return response.json();
};

export const fetchClientBeneficiaries = async (clientId: string, staffId: string) => {
    const response = await fetch(`/api/clients/${clientId}/staff/${staffId}/beneficiaries`);
    if (!response.ok) throw new Error(`Failed to fetch beneficiaries: ${response.status} ${response.statusText}`);
    return response.json();
};