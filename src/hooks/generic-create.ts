import { useQuery } from "@tanstack/react-query";
import { defaultQueryOptions } from "@/config/query-options";

export function createQuery<T>(key: string[], fn: () => Promise<T>) {
  return useQuery<T>({
    queryKey: key,
    queryFn: fn,
    ...defaultQueryOptions,
  });
}