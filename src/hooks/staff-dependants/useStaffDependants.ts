import { StaffDependantResponse } from "@/types/staff-dependants";
import { createQuery } from "../generic-create";
import { fetchDependants } from "@/api/staff-dependants";

export function useStaffDependants(clientId: string | undefined, staffId: string | undefined) {
    const safeClientId = clientId ?? "";
    const safeStaffId = staffId ?? "";
    return createQuery<StaffDependantResponse>(['staffDependants', safeClientId, safeStaffId], () => fetchDependants(safeClientId, safeStaffId));
};