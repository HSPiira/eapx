'use client';

import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
import { InterventionForm, InterventionFormData } from '@/components/admin/services/intervention-form';
import { InterventionsTable } from '@/components/admin/services/interventions-table';
import { Intervention, CreateInterventionInput, UpdateInterventionInput } from '@/schema/intervention';
import { useCreateIntervention, useDeleteIntervention, useInterventions, useServices, useUpdateIntervention } from '@/hooks/interventions';
import { ConfirmDeleteCard } from '@/components/admin/services/confirm-delete';

export default function InterventionsPage() {
    const [open, setOpen] = React.useState(false);
    const queryClient = useQueryClient();
    const [selected, setSelected] = React.useState<Intervention | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

    // Queries
    const { data: interventionsData, isLoading, error } = useInterventions();
    const { data: servicesData, error: servicesError } = useServices();

    // Mutations
    const createInterventionMutation = useCreateIntervention(servicesData?.data ?? [], () => setOpen(false));
    const updateInterventionMutation = useUpdateIntervention();
    const deleteInterventionMutation = useDeleteIntervention();

    // Error fallback
    if (error || servicesError) {
        return (
            <div className="text-center text-red-500 p-4">
                <p>Error loading data. Please try again later.</p>
                <Button
                    onClick={() => {
                        queryClient.invalidateQueries({ queryKey: ["interventions"] });
                        queryClient.invalidateQueries({ queryKey: ["services"] });
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

    if (!interventionsData) {
        return (
            <div className="text-center text-red-500">
                Error loading interventions. Please try again later.
            </div>
        );
    }

    const handleSubmit = (formData: InterventionFormData) => {
        const createData: CreateInterventionInput = {
            name: formData.name,
            serviceId: formData.serviceId,
            description: formData.description || null,
            status: formData.status,
            duration: formData.duration || null,
            capacity: formData.capacity || null,
            prerequisites: formData.prerequisites || null,
            isPublic: formData.isPublic,
            price: formData.price || null,
            metadata: formData.metadata || {},
            serviceProviderId: null,
        };
        createInterventionMutation.mutate(createData);
    };

    const handleEdit = (intervention: Intervention) => {
        const updateData: UpdateInterventionInput = {
            id: intervention.id,
            name: intervention.name,
            description: intervention.description || "",
            serviceId: intervention.service.id,
            status: intervention.status,
            duration: intervention.duration || 0,
            capacity: intervention.capacity || 0,
            prerequisites: intervention.prerequisites || "",
            isPublic: intervention.isPublic,
            price: intervention.price || 0,
            metadata: intervention.metadata,
            serviceProviderId: null,
        };
        updateInterventionMutation.mutate(updateData);
    };

    const handleDeleteClick = (intervention: Intervention) => {
        setSelected(intervention);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (selected) {
            deleteInterventionMutation.mutate(selected.id);
            setDeleteDialogOpen(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Service Interventions</h2>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild><Button>Add Intervention</Button></DialogTrigger>
                    <DialogContent
                        onPointerDownOutside={(e) => e.preventDefault()}
                        onEscapeKeyDown={(e) => e.preventDefault()}
                        className="sm:max-w-2xl max-h-[90vh] flex flex-col"
                    >
                        <DialogHeader className="flex-none">
                            <DialogTitle>Add New Intervention</DialogTitle>
                            <DialogDescription>Create a new service intervention to provide specific services.</DialogDescription>
                        </DialogHeader>
                        <div className="flex-1 overflow-y-auto py-4">
                            <InterventionForm
                                onSubmit={handleSubmit}
                                isSubmitting={createInterventionMutation.isPending}
                                onCancel={() => setOpen(false)}
                                services={servicesData?.data || []}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            <InterventionsTable
                interventions={interventionsData.data}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
            />
            <ConfirmDeleteCard
                open={deleteDialogOpen}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteDialogOpen(false)}
                itemName={selected?.name ?? ""}
            />
        </div>
    );
}
