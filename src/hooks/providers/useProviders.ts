// /hooks/useProviders.ts
import { fetchProviders } from '@/api/providers';
import { ProvidersResponse } from '@/types';
import { createQuery } from '../generic-create';

export function useProviders() {
    return createQuery<ProvidersResponse>(['providers'], fetchProviders);
}
