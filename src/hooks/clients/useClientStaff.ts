
import { fetchClientStaff } from "@/api/clients";
import { useGenericQuery } from "../generic-create";
import { StaffResponse } from "@/types/staff";

export function useClientStaff(clientId: string) {
    return useGenericQuery<StaffResponse>(['client-staff', clientId], () => fetchClientStaff(clientId));
}
