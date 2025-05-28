'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ClientForm } from './client-form';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

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
    // Fetch all industries by setting a large limit
    const response = await fetch('/api/industries?limit=1000');
    if (!response.ok) {
        throw new Error('Failed to fetch industries');
    }
    return response.json();
}

interface AddClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function AddClientModal({ isOpen, onClose, onSuccess }: AddClientModalProps) {
    const { data: industriesResponse, isLoading } = useQuery<IndustriesResponse>({
        queryKey: ['industries'],
        queryFn: fetchIndustries,
    });

    const handleSubmit = async (data: unknown) => {
        try {
            const response = await fetch('/api/clients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to create client');
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error creating client:', error);
            // You might want to show an error toast here
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="max-w-2xl max-h-[90vh] overflow-y-auto"
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Add New Client</DialogTitle>
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
                    />
                )}
            </DialogContent>
        </Dialog>
    );
} 