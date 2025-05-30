import { useQuery } from "@tanstack/react-query";
import { fetchInterventions } from "@/api/interventions";
import { InterventionsResponse } from "@/types/interventions";

export function useInterventions() {
    return useQuery<InterventionsResponse>({
        queryKey: ["interventions"],
        queryFn: fetchInterventions,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        retry: 2,
        retryDelay: 1000,
    });
}
