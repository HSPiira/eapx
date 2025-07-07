import { fetchStaff } from "@/api/staff";
import { useGenericQuery } from "../generic-create";
import { StaffApiResponse } from "@/types/staff";

export function useStaffList() {
    return useGenericQuery<StaffApiResponse[]>(['staff-list'], fetchStaff);
}
