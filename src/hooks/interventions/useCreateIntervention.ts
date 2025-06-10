import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createIntervention } from "@/api/interventions";
import { InterventionsResponse, Intervention } from "@/types/interventions";
import { toast } from "sonner";
import { CreateInterventionInput } from "@/schema/intervention";
import { Service } from "@/types/services";

export function useCreateIntervention(services: Service[], onClose: () => void) {
    const queryClient = useQueryClient();

    return useMutation<Intervention, Error, CreateInterventionInput>({
        mutationFn: createIntervention,
        onMutate: async (newData) => {
            await queryClient.cancelQueries({ queryKey: ["interventions"] });
            const previousData = queryClient.getQueryData<InterventionsResponse>(["interventions"]);

            const foundService = services.find(s => s.id === newData.serviceId);
            const service = { id: newData.serviceId, name: foundService?.name || "" };

            const optimisticIntervention: Intervention = {
                id: `optimistic-${Math.random().toString(36).substring(2, 9)}`,
                name: newData.name || "",
                description: newData.description || "",
                serviceId: newData.serviceId,
                service,
                status: (newData.status as Intervention["status"]) || "ACTIVE",
                duration: newData.duration ?? 0,
                capacity: newData.capacity ?? 0,
                prerequisites: newData.prerequisites || "",
                isPublic: newData.isPublic ?? false,
                price: newData.price ?? 0,
                metadata: newData.metadata || {},
                deletedAt: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                serviceProviderId: null,
                ServiceProvider: null,
            };

            queryClient.setQueryData<InterventionsResponse>(["interventions"], (old) => {
                if (!old) return { data: [optimisticIntervention] };
                return { ...old, data: [...old.data, optimisticIntervention] };
            });

            return { previousData };
        },
        onError: (_, __, context) => {
            const safeContext = context as { previousData?: InterventionsResponse } | undefined;
            if (safeContext?.previousData) {
                queryClient.setQueryData(["interventions"], safeContext.previousData);
            }
            toast.error("Failed to create intervention. Please try again.");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["interventions"] });
            toast.success("Intervention created successfully!");
            onClose();
        },
    });
}
