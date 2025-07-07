export async function fetchBeneficiaries() {
    const response = await fetch('/api/beneficiaries');
    if (!response.ok) throw new Error('Failed to fetch beneficiaries');
    return response.json();
}