import { useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query";
import { deleteProvider } from "@/api/providers";
import { ProvidersResponse } from "@/types/provider";
import { toast } from "sonner";

type DeleteProviderContext = { previousData?: ProvidersResponse };

export function useDeleteProvider(
    options: Partial<UseMutationOptions<unknown, Error, string, DeleteProviderContext>> = {}
) {
    const queryClient = useQueryClient();

    return useMutation<unknown, Error, string, DeleteProviderContext>({
        mutationFn: deleteProvider,
        onMutate: async (id: string) => {
            await queryClient.cancelQueries({ queryKey: ["providers"] });
            const previousData = queryClient.getQueryData<ProvidersResponse>(["providers"]);

            queryClient.setQueryData<ProvidersResponse>(["providers"], (old) => {
                if (!old) return { data: [] };
                return { ...old, data: old.data.filter(p => p.id !== id) };
            });

            return { previousData };
        },
        onError: (_, __, context) => {
            queryClient.setQueryData(["providers"], context?.previousData);
            toast.error("Failed to delete provider.");
            if (typeof options.onError === "function") {
                options.onError(_, __, context);
            }
        },
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: ["providers"] });
            toast.success("Provider deleted.");
            if (typeof options.onSuccess === "function") {
                options.onSuccess(...args);
            }
        },
        ...options,
    });
}
