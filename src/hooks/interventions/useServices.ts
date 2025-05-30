import { useQuery } from "@tanstack/react-query";
import { fetchServices } from "@/api/interventions";

export function useServices() {
    return useQuery({
        queryKey: ["services"],
        queryFn: fetchServices,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        retry: 2,
        retryDelay: 1000,
    });
}
