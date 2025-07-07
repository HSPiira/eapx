import { fetchClientStats } from "@/api/clients";
import { useGenericQuery } from "../generic-create";
import { ClientStatsResponse, ClientFiltersState } from "@/types/client";

const convertFiltersToParams = (filters: ClientFiltersState): Record<string, string> => {
    const params: Record<string, string> = {};

    if (filters.search) params.search = filters.search;
    if (filters.status && filters.status !== 'all') params.status = filters.status;
    if (filters.industryId && filters.industryId !== 'all') params.industryId = filters.industryId;
    if (filters.isVerified !== undefined) params.isVerified = filters.isVerified.toString();
    if (filters.preferredContactMethod) params.preferredContactMethod = filters.preferredContactMethod;
    if (filters.createdAfter) params.createdAfter = filters.createdAfter.toISOString();
    if (filters.createdBefore) params.createdBefore = filters.createdBefore.toISOString();
    if (filters.hasContract !== undefined) params.hasContract = filters.hasContract.toString();
    if (filters.hasStaff !== undefined) params.hasStaff = filters.hasStaff.toString();

    return params;
};

export function useClientStats(filters: ClientFiltersState) {
    const queryKey = ['client-stats', JSON.stringify(filters)];
    return useGenericQuery<ClientStatsResponse>(
        queryKey,
        () => fetchClientStats(convertFiltersToParams(filters))
    );
}
