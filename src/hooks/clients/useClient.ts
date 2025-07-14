
import { fetchClient } from "@/api/clients";
import { useGenericQuery } from "../generic-create";
import { ClientResponse } from "@/types/client";

export function useClient(clientId: string) {
    return useGenericQuery<ClientResponse>(['client', clientId], () => fetchClient(clientId));
}
