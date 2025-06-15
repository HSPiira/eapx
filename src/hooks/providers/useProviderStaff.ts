import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
    fetchProviderStaff,
    createProviderStaff,
    updateProviderStaff,
    deleteProviderStaff
} from "@/api/provider-staff";

const QUERY_KEYS = {
    all: ['provider-staff'],
    list: () => ['provider-staff', 'list'],
    detail: (id: string) => ['provider-staff', 'detail', id],
};

interface CreateStaffInput {
    fullName: string;
    role: string | null;
    email: string | null;
    phone: string | null;
    serviceProviderId?: string;
    qualifications: string[];
    specializations: string[];
    isPrimaryContact: boolean;
}

interface UpdateStaffInput extends Partial<CreateStaffInput> {
    id: string;
}

export function useProviderStaff() {
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: QUERY_KEYS.list(),
        queryFn: async () => {
            const response = await fetchProviderStaff();
            return response;
        },
    });

    const createMutation = useMutation({
        mutationFn: ({ providerId, data }: { providerId: string; data: CreateStaffInput }) =>
            createProviderStaff(providerId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.list() });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ providerId, data }: { providerId: string; data: UpdateStaffInput }) =>
            updateProviderStaff(providerId, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.list() });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(data.id) });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: ({ providerId, id }: { providerId: string; id: string }) =>
            deleteProviderStaff(providerId, id),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.list() });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(id) });
        },
    });

    return {
        staff: data?.data || [],
        isLoading,
        error,
        createStaff: createMutation.mutate,
        updateStaff: updateMutation.mutate,
        deleteStaff: deleteMutation.mutate,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
} 