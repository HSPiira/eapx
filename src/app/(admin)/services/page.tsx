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
import { ServiceForm, type ServiceFormData } from '@/components/admin/services/service-form';
import { toast } from "sonner"

interface Service {
    id: string;
    name: string;
    description: string | null;
    status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'ARCHIVED' | 'DELETED';
    duration: number | null;
    capacity: number | null;
    isPublic: boolean;
    price: number | null;
    category: {
        id: string;
        name: string;
    };
    ServiceProvider?: {
        id: string;
        name: string;
        type: string;
    } | null;
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

interface Category {
    id: string;
    name: string;
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

async function fetchCategories(): Promise<{ data: Category[] }> {
    const response = await fetch('/api/services/categories', {
        cache: 'no-store'
    });
    if (!response.ok) {
        throw new Error('Failed to fetch categories');
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
        throw new Error('Failed to create service');
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

    const { data: categoriesData } = useQuery({
        queryKey: ['service-categories'],
        queryFn: fetchCategories,
    });

    const createServiceMutation = useMutation({
        mutationFn: createService,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
            setOpen(false);
        },
    });

    const handleTryAgain = useCallback(async () => {
        try {
            await refetch();
        } catch (err) {
            console.error('Failed to fetch services:', err);
        }
    }, [refetch]);

    const handleSubmit = async (data: ServiceFormData) => {
        try {
            await createServiceMutation.mutateAsync(data);
            toast.success("Service created", {
                description: "The service has been created successfully.",
            });
        } catch (error) {
            console.error('Failed to create service:', error);
            toast.error("Failed to create service", {
                description: "An error occurred while creating the service. Please try again.",
            });
        }
    };

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
            <div className="flex justify-end">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>Add New Service</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Service</DialogTitle>
                            <DialogDescription>
                                Create a new service to offer to your clients.
                            </DialogDescription>
                        </DialogHeader>
                        <ServiceForm
                            onSubmitAction={handleSubmit}
                            isSubmitting={createServiceMutation.isPending}
                            onCancel={() => setOpen(false)}
                            categories={categoriesData?.data || []}
                        />
                    </DialogContent>
                </Dialog>
            </div>
            <ServiceTable services={services?.data || []} />
        </div>
    );
} 