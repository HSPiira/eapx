
import { Profile } from "@/types/profile";

export async function fetchProfile(): Promise<Profile> {
    const res = await fetch('/api/auth/profile');
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
};

export async function updateProfile(data: Partial<Profile>) {
    const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
};
