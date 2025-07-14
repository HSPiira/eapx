
import { fetchIndustries } from "@/api/industries";
import { useGenericQuery } from "../generic-create";
import { IndustriesResponse } from "@/types/industries";

export function useIndustries(params: { page: number; limit: number; search: string; parentId: string | null }) {
    return useGenericQuery<IndustriesResponse>(['industries', params], () => fetchIndustries(params));
}
