import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProvider } from "@/api/providers";
import { ProvidersResponse } from "@/types/provider";
import { toast } from "sonner";
import { UpdateServiceProviderInput } from "@/schema/provider";

type UpdateProviderContext = { previousData?: ProvidersResponse };

export function useUpdateProvider() {
    const queryClient = useQueryClient();

    return useMutation<unknown, Error, UpdateServiceProviderInput & { id: string }, UpdateProviderContext>({
        mutationFn: (data) => {
            const validated = UpdateServiceProviderInput.parse(data);
            return updateProvider(validated);
        },
        onMutate: async (updated) => {
            await queryClient.cancelQueries({ queryKey: ["providers"] });
            const previousData = queryClient.getQueryData<ProvidersResponse>(["providers"]);

            queryClient.setQueryData<ProvidersResponse>(["providers"], (old) => {
                if (!old) return { data: [] };
                return {
                    ...old,
                    data: old.data.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)),
                };
            });

            return { previousData };
        },
        onError: (_, __, context) => {
            queryClient.setQueryData(["providers"], context?.previousData);
            toast.error("Failed to update provider.");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["providers"] });
            toast.success("Provider updated.");
        },
    });
}
