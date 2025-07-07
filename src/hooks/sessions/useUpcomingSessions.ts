
import { fetchUpcomingSessions } from "@/api/sessions";
import { useGenericQuery } from "../generic-create";
import { SessionsResponse } from "@/types/sessions";

export function useUpcomingSessions() {
    return useGenericQuery<SessionsResponse>(['upcoming-sessions'], fetchUpcomingSessions);
}
