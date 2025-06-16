import { useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query";
import { deleteIntervention } from "@/api/interventions";
import { InterventionsResponse } from "@/types/interventions";
import { toast } from "sonner";

type DeleteInterventionContext = { previousData?: InterventionsResponse };

export function useDeleteIntervention(
    options: Partial<UseMutationOptions<unknown, Error, string, DeleteInterventionContext>> = {}
) {
    const queryClient = useQueryClient();

    return useMutation<unknown, Error, string, DeleteInterventionContext>({
        mutationFn: deleteIntervention,
        onMutate: async (id: string) => {
            await queryClient.cancelQueries({ queryKey: ["interventions"] });
            const previousData = queryClient.getQueryData<InterventionsResponse>(["interventions"]);

            queryClient.setQueryData<InterventionsResponse>(["interventions"], (old) => {
                if (!old) return { data: [] };
                return { ...old, data: old.data.filter(i => i.id !== id) };
            });

            return { previousData };
        },
        onError: (_, __, context) => {
            queryClient.setQueryData(["interventions"], context?.previousData);
            toast.error("Failed to delete intervention.");
            if (typeof options.onError === "function") {
                options.onError(_, __, context);
            }
        },
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: ["interventions"] });
            toast.success("Intervention deleted.");
            if (typeof options.onSuccess === "function") {
                options.onSuccess(...args);
            }
        },
        ...options,
    });
}
