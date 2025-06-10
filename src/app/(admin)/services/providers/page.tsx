'use client';

import React, { useState } from 'react';
import { ProviderTable } from '@/components/admin/providers/provider-table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ProviderForm } from '@/components/admin/providers/provider-form';
import { ProviderEditModal } from '@/components/admin/providers/provider-edit-modal';
import { useProviders } from '@/hooks/providers/useProviders';
import { useInterventions } from '@/hooks/interventions';
import { useServices } from '@/hooks/services';
import { useCreateProvider } from '@/hooks/providers/useCreateProvider';
import { useUpdateProvider } from '@/hooks/providers/useUpdateProvider';
import { useDeleteProvider } from '@/hooks/providers/useDeleteProvider';
import { Provider } from '@/types/provider';
import { CreateServiceProviderInput, UpdateServiceProviderInput } from '@/schema/provider';
import { ConfirmDeleteCard } from '@/components/admin/services/confirm-delete';

export default function ProvidersListPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const { data: providersData, isLoading, error: providersError } = useProviders();
    const { data: servicesData, error: servicesError } = useServices();
    const { data: interventionsData, error: interventionsError } = useInterventions();

    const createProviderMutation = useCreateProvider(() => setIsDialogOpen(false));
    const updateProviderMutation = useUpdateProvider();
    const deleteProviderMutation = useDeleteProvider();

    const handleCreateProvider = async (data: CreateServiceProviderInput) => {
        try {
            const { ...payload } = data;
            createProviderMutation.mutate(payload);
        } catch (error) {
            console.error('Failed to add provider:', error);
            alert('Failed to add provider');
        }
    };

    const handleEdit = (provider: Provider) => {
        setEditingProvider(provider);
        setIsEditDialogOpen(true);
    };

    const handleUpdateProvider = async (data: CreateServiceProviderInput) => {
        if (!editingProvider) return;
        try {
            const updateData: UpdateServiceProviderInput = {
                id: editingProvider.id,
                ...data
            };
            updateProviderMutation.mutate(updateData);
            setIsEditDialogOpen(false);
            setEditingProvider(null);
        } catch (error) {
            console.error('Failed to update provider:', error);
            alert('Failed to update provider');
        }
    };

    const handleDeleteClick = (id: string) => {
        const provider = providersData?.data.find(p => p.id === id);
        if (provider) {
            setEditingProvider(provider);
            setDeleteDialogOpen(true);
        }
    };

    const confirmDelete = () => {
        if (editingProvider) {
            deleteProviderMutation.mutate(editingProvider.id);
            setDeleteDialogOpen(false);
        }
    };

    if (providersError || servicesError || interventionsError) {
        return (
            <div className="text-center text-red-500 p-4">
                <p>Error loading data. Please try again later.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold">Providers</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            onClick={() => setIsDialogOpen(true)}
                        >
                            Add Provider
                        </button>
                    </DialogTrigger>
                    <DialogContent onInteractOutside={e => e.preventDefault()}>
                        <DialogHeader>
                            <DialogTitle>Add New Provider</DialogTitle>
                            <DialogDescription>
                                Add a new provider to the system.
                            </DialogDescription>
                        </DialogHeader>
                        <ProviderForm
                            onSubmitAction={handleCreateProvider}
                            isSubmitting={createProviderMutation.isPending}
                            onCancel={() => setIsDialogOpen(false)}
                            services={servicesData?.data || []}
                            interventions={interventionsData?.data || []}
                        />
                    </DialogContent>
                </Dialog>
            </div>
            <ProviderTable
                providers={providersData?.data || []}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
            />
            <ProviderEditModal
                open={isEditDialogOpen}
                onOpenChange={open => {
                    setIsEditDialogOpen(open);
                    if (!open) setEditingProvider(null);
                }}
                provider={editingProvider}
                onSubmit={handleUpdateProvider}
                isSubmitting={updateProviderMutation.isPending}
            />
            <ConfirmDeleteCard
                open={deleteDialogOpen}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteDialogOpen(false)}
                itemName={editingProvider?.name ?? ""}
            />
        </div>
    );
} 