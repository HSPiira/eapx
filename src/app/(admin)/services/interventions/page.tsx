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
    service: {
        id: string;
        name: string;
    };
    status: string;
    duration: number | null;
    capacity: number | null;
    prerequisites: string | null;
    isPublic: boolean;
    price: number | null;
    metadata: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

interface Category {
    id: string;
    name: string;
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
    const { data, isLoading } = useQuery({
        queryKey: ['interventions'],
        queryFn: async () => {
            const res = await fetch('/api/services/interventions');
            if (!res.ok) {
                throw new Error('Failed to fetch interventions');
            }
            return res.json();
        },
    });

    const { data: categoriesData } = useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
    });

    const createInterventionMutation = useMutation({
        mutationFn: createIntervention,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['interventions'] });
            setOpen(false);
            toast.success("Intervention created successfully!")
        },
        onError: (error) => {
            console.error('Error creating intervention:', error);
            toast.error("Failed to create intervention.")
        }
    });

    const updateInterventionMutation = useMutation({
        mutationFn: updateIntervention,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['interventions'] });
            toast.success("Intervention updated successfully!")
        },
        onError: (error) => {
            console.error('Error updating intervention:', error);
            toast.error("Failed to update intervention.")
        }
    });

    const deleteInterventionMutation = useMutation({
        mutationFn: deleteIntervention,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['interventions'] });
            toast.success("Intervention deleted successfully!")
        },
        onError: (error) => {
            console.error('Error deleting intervention:', error);
            toast.error("Failed to delete intervention.")
        }
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
                interventions={data?.data || []}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </div>
    );
} 