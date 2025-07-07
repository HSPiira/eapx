
import { fetchBeneficiaries } from "@/api/beneficiaries";
import { useGenericQuery } from "../generic-create";
import { Beneficiary } from "@/components/session-booking/sessionRequestSchema";

export function useBeneficiaries() {
    return useGenericQuery<Beneficiary[]>(['beneficiaries'], fetchBeneficiaries);
}
