
import { fetchCounselors } from "@/api/counselors";
import { useGenericQuery } from "../generic-create";
import { ServiceProvider } from "@/components/session-booking/sessionRequestSchema";

export function useCounselors() {
    return useGenericQuery<ServiceProvider[]>(['counselors'], fetchCounselors);
}
