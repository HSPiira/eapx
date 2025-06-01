import { CreateInterventionInput, Intervention, UpdateInterventionInput } from "@/schema/intervention";
import { InterventionsResponse } from "@/types/interventions";

export async function fetchInterventions(): Promise<InterventionsResponse> {
    const res = await fetch('/api/services/interventions?limit=50&page=1');
    if (!res.ok) {
        throw new Error('Failed to fetch interventions');
    }
    return res.json();
}

export async function createIntervention(data: CreateInterventionInput): Promise<Intervention> {
    const res = await fetch('/api/services/interventions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create intervention');
    }
    const result = await res.json();
    return result as Intervention;
}

export async function updateIntervention(data: UpdateInterventionInput): Promise<Intervention> {
    const { id, ...rest } = data;
    const res = await fetch(`/api/services/interventions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rest),
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update intervention');
    }
    return res.json();
}

export async function deleteIntervention(id: string): Promise<unknown> {
    const res = await fetch(`/api/services/interventions/${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete intervention');
    }
    return res.json();
}
