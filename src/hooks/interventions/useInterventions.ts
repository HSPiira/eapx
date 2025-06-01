import { fetchInterventions } from "@/api/interventions";
import { InterventionsResponse } from "@/types/interventions";
import { createQuery } from "../generic-create";

export function useInterventions() {
    return createQuery<InterventionsResponse>(['interventions'], fetchInterventions);
}
