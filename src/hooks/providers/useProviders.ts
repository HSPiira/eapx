
import { fetchProviders } from '@/api/providers';
import { ProvidersResponse } from '@/types';
import { useGenericQuery } from '../generic-create';

export function useProviders() {
    return useGenericQuery<ProvidersResponse>(['providers'], fetchProviders);
}
