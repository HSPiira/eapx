'use client';

import React, { useCallback, useState } from 'react';
import { ServiceTable } from '@/components/admin/services/service-table';
import { Button, LoadingSpinner } from '@/components/ui';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ServiceForm } from '@/components/admin/services/service-form';
import type { ServiceFormData } from '@/components/admin/services/service-form';
import { useServices, useCreateService } from '@/hooks/services/useServices';

export default function ServicesPage() {
    const [open, setOpen] = useState(false);

    const { data: services, refetch, isError, isLoading: isQueryLoading } = useServices();

    const createServiceMutation = useCreateService();

    const handleTryAgain = useCallback(async () => {
        try {
            await refetch();
        } catch (err) {
            console.error('Failed to fetch services:', err);
        }
    }, [refetch]);

    const handleSubmit = useCallback(async (data: ServiceFormData) => {
        createServiceMutation.mutate(data);
    }, [createServiceMutation]);

    if (isQueryLoading) {
        return (
            <div className="flex justify-center">
                <LoadingSpinner className="w-8 h-8" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center">
                <p className="text-red-500 mb-4">Failed to load services</p>
                <Button onClick={handleTryAgain}>Try Again</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Services</h2>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>Add New Service</Button>
                    </DialogTrigger>
                    <DialogContent onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                        <DialogHeader>
                            <DialogTitle>Add New Service</DialogTitle>
                            <DialogDescription>
                                Create a new service to offer to your clients.
                            </DialogDescription>
                        </DialogHeader>
                        <ServiceForm
                            onSubmit={handleSubmit}
                            isSubmitting={createServiceMutation.isPending}
                            onCancel={() => setOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>
            <ServiceTable services={services?.data || []} className="w-full table-fixed" />
        </div>
    );
} 