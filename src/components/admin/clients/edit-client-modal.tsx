'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ClientForm } from './client-form';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/components/ui/use-toast';

interface Industry {
    id: string;
    name: string;
}

interface IndustriesResponse {
    data: Industry[];
    metadata: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

async function fetchIndustries(): Promise<IndustriesResponse> {
    const response = await fetch('/api/industries?limit=1000');
    if (!response.ok) {
        throw new Error('Failed to fetch industries');
    }
    return response.json();
}

interface EditClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    clientId: string;
}

export function EditClientModal({ isOpen, onClose, onSuccess, clientId }: EditClientModalProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { data: industriesResponse, isLoading: isLoadingIndustries } = useQuery<IndustriesResponse>({
        queryKey: ['industries'],
        queryFn: fetchIndustries,
    });

    const { data: client, isLoading: isLoadingClient } = useQuery({
        queryKey: ['client', clientId],
        queryFn: async () => {
            const response = await fetch(`/api/clients/${clientId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch client');
            }
            return response.json();
        },
        enabled: isOpen,
    });

    const handleSubmit = async (data: unknown) => {
        try {
            setIsSubmitting(true);
            console.log('data', data);
            const response = await fetch(`/api/clients/${clientId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to update client');
            }

            toast({
                title: "Success",
                description: "Client updated successfully",
            });

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error updating client:', error);
            toast({
                title: "Error",
                description: "Failed to update client",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const isLoading = isLoadingIndustries || isLoadingClient;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                onClose();
            }
        }}>
            <DialogContent
                className="max-w-2xl max-h-[90vh] overflow-y-auto"
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Edit Client</DialogTitle>
                </DialogHeader>
                {isLoading ? (
                    <div className="flex justify-center items-center min-h-[200px]">
                        <LoadingSpinner className="w-8 h-8" />
                    </div>
                ) : (
                    <ClientForm
                        onSubmit={handleSubmit}
                        onCancel={onClose}
                        industries={industriesResponse?.data || []}
                        defaultValues={client}
                        isSubmitting={isSubmitting}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
} 