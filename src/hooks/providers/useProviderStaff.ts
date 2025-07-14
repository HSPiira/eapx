import { fetchProviderStaff } from "@/api/providers";
import { useGenericQuery } from "../generic-create";
import { ProviderStaff } from "@/types/provider-staff";

export function useProviderStaff(providerId: string) {
    return useGenericQuery<ProviderStaff>(['provider-staff', providerId], () => fetchProviderStaff(providerId));
}