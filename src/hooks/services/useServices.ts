import { fetchServices } from "@/api/services";
import { ServicesResponse } from "@/types/services";
import { createQuery } from "../generic-create";

export function useServices() {
    return createQuery<ServicesResponse>(['services'], fetchServices);
}
