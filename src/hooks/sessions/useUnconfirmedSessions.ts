
import { fetchUnconfirmedSessions } from "@/api/sessions";
import { useGenericQuery } from "../generic-create";
import { UnconfirmedSession } from "@/types/sessions";

export function useUnconfirmedSessions() {
    return useGenericQuery<UnconfirmedSession>(['unconfirmed-sessions'], fetchUnconfirmedSessions);
}
