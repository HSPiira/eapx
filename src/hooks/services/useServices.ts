import { fetchServices } from "@/api/services";
import { ServicesResponse } from "@/types/services";
import { useGenericQuery } from "../generic-create";

export function useServices() {
    return useGenericQuery<ServicesResponse>(['services'], fetchServices);
}
