import { fetchInterventions } from "@/api/interventions";
import { useGenericQuery } from "../generic-create";
import { InterventionsResponse } from "@/types/interventions";

export function useInterventions() {
    return useGenericQuery<InterventionsResponse>(['interventions'], fetchInterventions);
}