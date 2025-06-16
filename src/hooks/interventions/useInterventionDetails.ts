import { useQuery } from "@tanstack/react-query";

interface InterventionDetails {
    service: {
        id: string;
        name: string;
    };
}

export function useInterventionDetails(interventionId: string | undefined) {
    return useQuery<InterventionDetails, Error>({
        queryKey: ['intervention-details', interventionId],
        queryFn: async () => {
            if (!interventionId) throw new Error('No intervention ID provided');
            const res = await fetch(`/api/services/interventions/${interventionId}`);
            if (!res.ok) throw new Error('Failed to fetch intervention details');
            return res.json();
        },
        enabled: !!interventionId,
        retry: false
    });
} 