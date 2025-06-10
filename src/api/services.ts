import { Service } from "@/types/services";

export async function fetchServices(): Promise<{ data: Service[] }> {
    const res = await fetch('/api/services');
    if (!res.ok) throw new Error('Failed to fetch services');
    return res.json();
}