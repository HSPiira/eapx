import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProvider } from "@/api/providers";
import { ProvidersResponse, Provider } from "@/types/provider";
import { toast } from "sonner";
import { CreateServiceProviderInput } from "@/schema/provider";

export function useCreateProvider(onClose: () => void) {
    const queryClient = useQueryClient();

    return useMutation<Provider, Error, CreateServiceProviderInput>({
        mutationFn: createProvider,
        onMutate: async (newData) => {
            await queryClient.cancelQueries({ queryKey: ["providers"] });
            const previousData = queryClient.getQueryData<ProvidersResponse>(["providers"]);

            const optimisticProvider: Provider = {
                id: `optimistic-${Math.random().toString(36).substring(2, 9)}`,
                name: newData.name,
                type: newData.type || "OTHER",
                contactEmail: newData.contactEmail,
                contactPhone: newData.contactPhone || null,
                location: newData.location || null,
                entityType: newData.entityType || "INDIVIDUAL",
                qualifications: newData.qualifications || [],
                specializations: newData.specializations || [],
                rating: newData.rating || null,
                isVerified: newData.isVerified || false,
                metadata: newData.metadata || {},
                status: newData.status || "ACTIVE",
                deletedAt: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                interventions: [],
                CareSession: [],
                documents: [],
                ProviderStaff: [],
                ServiceProviderService: [],
                ProviderOnboardingStatus: []
            };

            queryClient.setQueryData<ProvidersResponse>(["providers"], (old) => {
                if (!old) return { data: [optimisticProvider] };
                return { ...old, data: [...old.data, optimisticProvider] };
            });

            return { previousData };
        },
        onError: (_, __, context) => {
            const safeContext = context as { previousData?: ProvidersResponse } | undefined;
            if (safeContext?.previousData) {
                queryClient.setQueryData(["providers"], safeContext.previousData);
            }
            toast.error("Failed to create provider. Please try again.");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["providers"] });
            toast.success("Provider created successfully!");
            onClose();
        },
    });
}
