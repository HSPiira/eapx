import { fetchProviders } from "@/api/providers";
import { useGenericQuery } from "../generic-create";
import { ProvidersResponse } from "@/types/provider";

export function useProviders() {
    return useGenericQuery<ProvidersResponse>(['providers'], fetchProviders);
}