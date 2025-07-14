
import { fetchClientBeneficiaries } from "@/api/clients";
import { useGenericQuery } from "../generic-create";
import { Dependant } from "@/types/client";

export function useClientBeneficiaries(clientId: string, staffId: string) {
    return useGenericQuery<Dependant>(['client-beneficiaries', clientId, staffId], () => fetchClientBeneficiaries(clientId, staffId));
}
