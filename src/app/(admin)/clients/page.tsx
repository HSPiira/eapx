// src/app/(admin)/clients/page.tsx
'use client';

import React, { useCallback } from 'react';
import { ClientHeader, ClientFilters, ClientStats, ClientList } from '@/components/admin/clients';
import { Button, LoadingSpinner } from '@/components/ui';
import { useQuery } from '@tanstack/react-query';

interface Client {
    id: string;
    name: string;
    email: string;
    industry: string;
    status: string;
    isVerified: boolean;
    activeContracts: number;
    totalStaff: number;
    updatedAt: Date;
}

interface ClientsResponse {
    data: Client[];
    metadata: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

async function fetchClients(): Promise<ClientsResponse> {
    const response = await fetch('/api/clients');
    if (!response.ok) {
        throw new Error('Failed to fetch clients');
    }
    return response.json();
}

export default function ClientsPage() {
    const { data: clients, refetch, isError, isLoading: isQueryLoading } = useQuery<ClientsResponse>({
        queryKey: ['clients'],
        queryFn: fetchClients,
        retry: false,
    });

    const handleTryAgain = useCallback(async () => {
        try {
            await refetch();
        } catch (err) {
            console.error('Failed to fetch clients:', err);
        }
    }, [refetch]);

    return (
        <div className="container mx-auto p-6 space-y-6">
            <ClientHeader />
            <ClientStats />
            <ClientFilters />

            {isQueryLoading ? (
                <div className="flex justify-center py-8">
                    <LoadingSpinner className="w-8 h-8" />
                </div>
            ) : isError ? (
                <div className="py-8 text-center">
                    <p className="text-red-500 mb-4">Failed to load clients</p>
                    <Button onClick={handleTryAgain}>Try Again</Button>
                </div>
            ) : (
                <ClientList clients={clients?.data || []} />
            )}
        </div>
    );
}