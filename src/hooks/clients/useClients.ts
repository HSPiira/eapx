import { fetchClients } from "@/api/clients";
import { useGenericQuery } from "../generic-create";
import { ClientsResponse, ClientFiltersState } from "@/types/client";

export function useClients(filters: ClientFiltersState) {
    return useGenericQuery<ClientsResponse>(['clients', filters], () => fetchClients(filters));
} 