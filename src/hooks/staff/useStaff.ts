import { fetchStaffList } from "@/api/staff";
import { createQuery } from "../generic-create";
import { StaffResponse } from "@/types/staff";

export function useStaff(clientId: string) {
    return createQuery<StaffResponse>(['staff', clientId], () => fetchStaffList(clientId));
};

