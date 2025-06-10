import { fetchStaffList } from "@/api/staff";
import { useGenericQuery } from "../generic-create";
import { StaffResponse } from "@/types/staff";

export function useStaff(clientId: string) {
    return useGenericQuery<StaffResponse>(['staff', clientId], () => fetchStaffList(clientId));
};

