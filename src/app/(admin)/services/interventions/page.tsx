'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui';
import { LoadingSpinner } from '@/components/ui';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { InterventionForm, type InterventionFormData } from '@/components/admin/services/intervention-form';
import { InterventionsTable } from '@/components/admin/services/interventions-table';
import { toast } from "sonner"

interface Intervention {
    id: string;
    name: string;
    description: string | null;
    serviceId: string;
    service: {
        id: string;
        name: string;
    };
    status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'ARCHIVED' | 'DELETED';
    duration: number | null;
    capacity: number | null;
    prerequisites: string | null;
    isPublic: boolean;
    price: number | null;
    metadata: Record<string, unknown>;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
    serviceProviderId: string | null;
    ServiceProvider?: {
        id: string;
        name: string;
        type: string;
    } | null;
}

interface Category {
    id: string;
    name: string;
}

interface InterventionsResponse {
    data: Intervention[];
}

async function fetchCategories(): Promise<{ data: Category[] }> {
    const response = await fetch('/api/services');
    if (!response.ok) {
        throw new Error('Failed to fetch categories');
    }
    return response.json();
}

async function createIntervention(data: unknown): Promise<unknown> {
    const response = await fetch('/api/services/interventions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create intervention');
    }
    return response.json();
}

async function updateIntervention(data: unknown): Promise<unknown> {
    const { id, ...rest } = data as { id: string };
    const response = await fetch(`/api/services/interventions/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(rest),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update intervention');
    }
    return response.json();
}

async function deleteIntervention(id: unknown): Promise<unknown> {
    const response = await fetch(`/api/services/interventions/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete intervention');
    }
    return response.json();
}

export default function InterventionsPage() {
    const [open, setOpen] = React.useState(false);
    const queryClient = useQueryClient();

    // Prefetch categories data with error handling
    React.useEffect(() => {
        queryClient.prefetchQuery({
            queryKey: ['categories'],
            queryFn: fetchCategories,
            retry: 2,
            retryDelay: 1000,
        }).catch(error => {
            console.error('Error prefetching categories:', error);
            toast.error("Failed to load categories. Please refresh the page.");
        });
    }, [queryClient]);

    // Main interventions query with stale-while-revalidate and pagination
    const { data, isLoading, error } = useQuery<InterventionsResponse>({
        queryKey: ['interventions'],
        queryFn: async () => {
            const res = await fetch('/api/services/interventions?limit=50&page=1');
            if (!res.ok) {
                throw new Error('Failed to fetch interventions');
            }
            return res.json();
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        retry: 2,
        retryDelay: 1000,
    });

    // Prefetch services data with error handling
    const { error: servicesError } = useQuery({
        queryKey: ['services'],
        queryFn: async () => {
            const res = await fetch('/api/services?limit=50');
            if (!res.ok) {
                throw new Error('Failed to fetch services');
            }
            return res.json();
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        retry: 2,
        retryDelay: 1000,
    });

    // Categories query with stale-while-revalidate and error handling
    const { data: categoriesData, error: categoriesError } = useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        retry: 2,
        retryDelay: 1000,
    });

    // Optimistic updates for mutations with error handling
    const createInterventionMutation = useMutation({
        mutationFn: createIntervention,
        onMutate: async (newIntervention) => {
            await queryClient.cancelQueries({ queryKey: ['interventions'] });
            const previousInterventions = queryClient.getQueryData<InterventionsResponse>(['interventions']);

            queryClient.setQueryData<InterventionsResponse>(['interventions'], (old) => {
                if (!old) return { data: [newIntervention as Intervention] };
                return {
                    ...old,
                    data: [...old.data, newIntervention as Intervention],
                };
            });

            return { previousInterventions };
        },
        onError: (err, newIntervention, context) => {
            queryClient.setQueryData(['interventions'], context?.previousInterventions);
            toast.error("Failed to create intervention. Please try again.");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['interventions'] });
            setOpen(false);
            toast.success("Intervention created successfully!");
        },
    });

    const updateInterventionMutation = useMutation({
        mutationFn: updateIntervention,
        onMutate: async (updatedIntervention: { id: string } & Record<string, unknown>) => {
            await queryClient.cancelQueries({ queryKey: ['interventions'] });
            const previousInterventions = queryClient.getQueryData<InterventionsResponse>(['interventions']);

            queryClient.setQueryData<InterventionsResponse>(['interventions'], (old) => {
                if (!old) return { data: [] };
                return {
                    ...old,
                    data: old.data.map((item) =>
                        item.id === updatedIntervention.id ? { ...item, ...updatedIntervention } : item
                    ),
                };
            });

            return { previousInterventions };
        },
        onError: (err, newIntervention, context) => {
            queryClient.setQueryData(['interventions'], context?.previousInterventions);
            toast.error("Failed to update intervention. Please try again.");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['interventions'] });
            toast.success("Intervention updated successfully!");
        },
    });

    const deleteInterventionMutation = useMutation({
        mutationFn: deleteIntervention,
        onMutate: async (interventionId: string) => {
            await queryClient.cancelQueries({ queryKey: ['interventions'] });
            const previousInterventions = queryClient.getQueryData<InterventionsResponse>(['interventions']);

            queryClient.setQueryData<InterventionsResponse>(['interventions'], (old) => {
                if (!old) return { data: [] };
                return {
                    ...old,
                    data: old.data.filter((item) => item.id !== interventionId),
                };
            });

            return { previousInterventions };
        },
        onError: (err, interventionId, context) => {
            queryClient.setQueryData(['interventions'], context?.previousInterventions);
            toast.error("Failed to delete intervention. Please try again.");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['interventions'] });
            toast.success("Intervention deleted successfully!");
        },
    });

    const handleSubmit = React.useCallback(async (data: InterventionFormData) => {
        createInterventionMutation.mutate(data);
    }, [createInterventionMutation]);

    const handleEdit = React.useCallback((intervention: Intervention) => {
        updateInterventionMutation.mutate({
            id: intervention.id,
            name: intervention.name,
            description: intervention.description || '',
            serviceId: intervention.service.id,
            status: intervention.status as "ACTIVE" | "INACTIVE" | "PENDING" | "ARCHIVED",
            duration: intervention.duration || 0,
            capacity: intervention.capacity || 0,
            prerequisites: intervention.prerequisites || '',
            isPublic: intervention.isPublic,
            price: intervention.price || 0,
            metadata: intervention.metadata
        });
    }, [updateInterventionMutation]);

    const handleDelete = React.useCallback((intervention: Intervention) => {
        if (window.confirm(`Are you sure you want to delete the intervention "${intervention.name}"?`)) {
            deleteInterventionMutation.mutate(intervention.id);
        }
    }, [deleteInterventionMutation]);

    // Show error states
    if (error || servicesError || categoriesError) {
        return (
            <div className="text-center text-red-500 p-4">
                <p>Error loading data. Please try again later.</p>
                <Button
                    onClick={() => {
                        queryClient.invalidateQueries({ queryKey: ['interventions'] });
                        queryClient.invalidateQueries({ queryKey: ['services'] });
                        queryClient.invalidateQueries({ queryKey: ['categories'] });
                    }}
                    className="mt-4"
                >
                    Retry
                </Button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center text-red-500">
                Error loading interventions. Please try again later.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Service Interventions</h2>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>Add Intervention</Button>
                    </DialogTrigger>
                    <DialogContent onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                        <DialogHeader>
                            <DialogTitle>Add New Intervention</DialogTitle>
                            <DialogDescription>
                                Create a new service intervention to provide specific services.
                            </DialogDescription>
                        </DialogHeader>
                        <InterventionForm
                            onSubmit={handleSubmit}
                            isSubmitting={createInterventionMutation.isPending}
                            onCancel={() => setOpen(false)}
                            categories={categoriesData?.data || []}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <InterventionsTable
                interventions={data.data}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </div>
    );
} 