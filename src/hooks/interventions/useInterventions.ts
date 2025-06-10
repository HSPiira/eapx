import { fetchInterventions } from "@/api/interventions";
import { InterventionsResponse } from "@/types/interventions";
import { useGenericQuery } from "../generic-create";

export function useInterventions() {
    return useGenericQuery<InterventionsResponse>(['interventions'], fetchInterventions);
}
