import { useQuery } from "@tanstack/react-query";
import { fetchSessionWithDetails } from "@/api/sessions";
import { fetchStaff } from "@/api/staff";
import { fetchDependants } from "@/api/staff-dependants";

export function useSessionDetails(sessionId: string, clientId: string, staffId?: string) {
    // Main session data
    const sessionQuery = useQuery({
        queryKey: ['session', sessionId],
        queryFn: () => fetchSessionWithDetails(sessionId)
    });

    // Staff data - fetched in parallel
    const staffQuery = useQuery({
        queryKey: ['staff', clientId],
        queryFn: () => fetchStaff(),
        enabled: !!clientId
    });

    // Dependants data - fetched in parallel when staffId is available
    const dependantsQuery = useQuery({
        queryKey: ['dependants', clientId, staffId],
        queryFn: () => fetchDependants(clientId, staffId!),
        enabled: !!clientId && !!staffId
    });

    return {
        session: sessionQuery.data,
        staff: staffQuery.data,
        dependants: dependantsQuery.data,
        isLoading: sessionQuery.isLoading || staffQuery.isLoading || dependantsQuery.isLoading,
        isError: sessionQuery.isError || staffQuery.isError || dependantsQuery.isError,
        error: sessionQuery.error || staffQuery.error || dependantsQuery.error
    };
} 