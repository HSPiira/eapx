import { fetchClients } from "@/api/clients";
import { useGenericQuery } from "../generic-create";
import { ClientResponse } from "@/types/client";

export function useClients() {
    return useGenericQuery<ClientResponse>(['clients'], fetchClients);
} 