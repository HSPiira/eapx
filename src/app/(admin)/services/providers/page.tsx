'use client';

import React, { useCallback, useState } from 'react';
import { ProviderTable } from '@/components/admin/providers/provider-table';
import { Button, LoadingSpinner } from '@/components/ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ProviderForm, type ProviderFormData } from '@/components/admin/providers/provider-form';
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search } from 'lucide-react';
import { toast } from "sonner"

interface Provider {
    id: string;
    name: string;
    type: string;
    contactEmail: string | null;
    contactPhone: string | null;
    location: string | null;
    qualifications: string[];
    specializations: string[];
    rating: number | null;
    isVerified: boolean;
    status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED' | 'SUSPENDED' | 'RESIGNED';
    _count?: {
        services: number;
        sessions: number;
    };
}

async function fetchProviders() {
    const res = await fetch('/api/services/providers');
    if (!res.ok) {
        throw new Error('Failed to fetch providers');
    }
    return res.json();
}

async function createProvider(data: ProviderFormData) {
    const response = await fetch('/api/services/providers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create provider');
    }

    return response.json();
}

async function updateProvider({ id, ...data }: ProviderFormData & { id: string }) {
    const response = await fetch(`/api/services/providers/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update provider');
    }

    return response.json();
}

async function deleteProvider(id: string) {
    const response = await fetch(`/api/services/providers/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete provider');
    }

    return response.json();
}

export default function ProvidersPage() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
    const queryClient = useQueryClient();

    const { data: providers, isLoading } = useQuery({
        queryKey: ['providers'],
        queryFn: fetchProviders,
    });

    const createProviderMutation = useMutation({
        mutationFn: createProvider,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['providers'] });
            setIsCreateDialogOpen(false);
            toast.success("Provider created successfully!")
        },
        onError: (error) => {
            console.error('Error creating provider:', error);
            toast.error("Failed to create provider.")
        }
    })

    const updateProviderMutation = useMutation({
        mutationFn: updateProvider,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['providers'] });
            setIsEditDialogOpen(false);
            setEditingProvider(null);
            toast.success("Provider updated successfully!")
        },
        onError: (error) => {
            console.error('Error updating provider:', error);
            toast.error("Failed to update provider.")
        }
    })

    const deleteProviderMutation = useMutation({
        mutationFn: deleteProvider,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['providers'] });
            toast.success("Provider deleted successfully!")
        },
        onError: (error) => {
            console.error('Error deleting provider:', error);
            toast.error("Failed to delete provider.")
        }
    })

    const handleCreateProvider = useCallback(async (data: ProviderFormData) => {
        createProviderMutation.mutate(data);
    }, [createProviderMutation]);

    const handleEditProvider = useCallback(async (data: ProviderFormData) => {
        if (!editingProvider) return;
        updateProviderMutation.mutate({ id: editingProvider.id, ...data });
    }, [updateProviderMutation, editingProvider]);

    const handleDeleteProvider = useCallback(async (id: string) => {
        if (window.confirm('Are you sure you want to delete this provider?')) {
            deleteProviderMutation.mutate(id);
        }
    }, [deleteProviderMutation]);


    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Service Providers</h1>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setIsCreateDialogOpen(true)}>Add Provider</Button>
                    </DialogTrigger>
                    <DialogContent
                        onPointerDownOutside={() => { }}
                        onEscapeKeyDown={() => { }}
                    >
                        <DialogHeader>
                            <DialogTitle>Add New Provider</DialogTitle>
                            <DialogDescription>
                                Create a new service provider in the system.
                            </DialogDescription>
                        </DialogHeader>
                        <ProviderForm
                            onSubmit={handleCreateProvider}
                            isSubmitting={createProviderMutation.isPending}
                            onCancel={() => setIsCreateDialogOpen(false)}
                        />
                    </DialogContent>
                </Dialog>

                {/* Edit Dialog */}
                {editingProvider && (
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogContent
                            onPointerDownOutside={() => { }}
                            onEscapeKeyDown={() => { }}
                        >
                            <DialogHeader>
                                <DialogTitle>Edit Provider</DialogTitle>
                                <DialogDescription>
                                    Update the service provider's information.
                                </DialogDescription>
                            </DialogHeader>
                            <ProviderForm
                                onSubmit={handleEditProvider}
                                isSubmitting={updateProviderMutation.isPending}
                                onCancel={() => {
                                    setIsEditDialogOpen(false);
                                    setEditingProvider(null);
                                }}
                                initialData={editingProvider}
                            />
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <ProviderTable
                providers={providers?.data || []}
                onEdit={(provider) => {
                    setEditingProvider(provider);
                    setIsEditDialogOpen(true);
                }}
                onDelete={handleDeleteProvider}
            />
        </div>
    );
} 