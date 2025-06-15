import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateIntervention } from "@/api/interventions";
import { InterventionsResponse } from "@/types/interventions";
import { toast } from "sonner";
import { UpdateInterventionInput, UpdateInterventionInputSchema } from "@/schema/intervention";

type UpdateInterventionContext = { previousData?: InterventionsResponse };

export function useUpdateIntervention() {
    const queryClient = useQueryClient();

    return useMutation<unknown, Error, UpdateInterventionInput, UpdateInterventionContext>({
        mutationFn: (data) => {
            const validated = UpdateInterventionInputSchema.parse(data);
            return updateIntervention(validated);
        },
        onMutate: async (updated) => {
            await queryClient.cancelQueries({ queryKey: ["interventions"] });
            const previousData = queryClient.getQueryData<InterventionsResponse>(["interventions"]);

            queryClient.setQueryData<InterventionsResponse>(["interventions"], (old) => {
                if (!old) return { data: [] };
                return {
                    ...old,
                    data: old.data.map((i) => (i.id === updated.id ? { ...i, ...updated } : i)),
                };
            });

            return { previousData };
        },
        onError: (_, __, context) => {
            queryClient.setQueryData(["interventions"], context?.previousData);
            toast.error("Failed to update intervention.");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["interventions"] });
            toast.success("Intervention updated.");
        },
    });
}
