'use client';

import React, { useCallback, useState } from 'react';
import { ServiceTable } from '@/components/admin/services/service-table';
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
import { ServiceForm } from '@/components/admin/services/service-form';
import type { ServiceFormData } from '@/components/admin/services/service-form';
import { toast } from "sonner"

interface Service {
    id: string;
    name: string;
    description: string | null;
    metadata: Record<string, unknown>;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
    interventions: Array<{
        id: string;
        name: string;
    }>;
}

interface ServicesResponse {
    data: Service[];
    metadata: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

async function fetchServices(): Promise<ServicesResponse> {
    const response = await fetch('/api/services', {
        cache: 'no-store'
    });
    if (!response.ok) {
        throw new Error('Failed to fetch services');
    }
    return response.json();
}

async function createService(data: ServiceFormData): Promise<Service> {
    const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        cache: 'no-store'
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create service');
    }

    return response.json();
}

export default function ServicesPage() {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: services, refetch, isError, isLoading: isQueryLoading } = useQuery<ServicesResponse>({
        queryKey: ['services'],
        queryFn: fetchServices,
        retry: false,
    });

    const createServiceMutation = useMutation({
        mutationFn: createService,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
            setOpen(false);
            toast.success("Service created successfully!")
        },
        onError: (error) => {
            console.error('Error creating service:', error);
            toast.error("Failed to create service.")
        }
    });

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
            <ServiceTable services={services?.data || []} />
        </div>
    );
} 