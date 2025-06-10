import { StaffDependantResponse } from "@/types/staff-dependants";
import { useGenericQuery } from "../generic-create";
import { fetchDependants } from "@/api/staff-dependants";

export function useStaffDependants(clientId: string | undefined, staffId: string | undefined, whoFor?: 'self' | 'dependant') {
    const safeClientId = clientId ?? "";
    const safeStaffId = staffId ?? "";
    const shouldFetch = !!safeClientId && !!safeStaffId && whoFor === 'dependant';

    return useGenericQuery<StaffDependantResponse>(
        ['staffDependants', safeClientId, safeStaffId],
        () => fetchDependants(safeClientId, safeStaffId),
        { enabled: shouldFetch }
    );
};