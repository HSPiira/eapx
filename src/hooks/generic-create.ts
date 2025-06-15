import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { defaultQueryOptions } from "@/config/query-options";

export function useGenericQuery<T>(
  key: string[],
  fn: () => Promise<T>,
  options?: Partial<UseQueryOptions<T>>
) {
  return useQuery<T>({
    queryKey: key,
    queryFn: fn,
    ...defaultQueryOptions,
    ...options,
  });
}

export function useGenericMutation<T>(
  key: string[],
  fn: () => Promise<T>,
  options?: Partial<UseMutationOptions<T>>
) {
  return useMutation<T>({
    mutationKey: key,
    mutationFn: fn,
    ...defaultQueryOptions,
    ...options,
  });
}