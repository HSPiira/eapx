
import { IndustriesResponse } from "@/types/industries";

export const fetchIndustries = async (params: { page: number; limit: number; search: string; parentId: string | null }): Promise<IndustriesResponse> => {
    const queryParams = new URLSearchParams({
        page: params.page.toString(),
        limit: params.limit.toString(),
        ...(params.search && { search: params.search }),
        ...(params.parentId && { parentId: params.parentId }),
    });

    const response = await fetch(`/api/industries?${queryParams}`);

    if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.details || errorBody.error || 'Failed to fetch industries');
    }

    return response.json();
};
