export async function fetchCounselors() {
    const response = await fetch('/api/counselors');
    if (!response.ok) throw new Error('Failed to fetch counselors');
    return response.json();
}