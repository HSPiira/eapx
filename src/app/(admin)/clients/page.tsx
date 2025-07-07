// src/app/(admin)/clients/page.tsx
'use client';

import React, { useCallback, useState } from 'react';
import { ClientHeader, ClientFilters, ClientStats, ClientList } from '@/components/admin/clients';
import { Button, LoadingSpinner } from '@/components/ui';
import { AddClientModal } from '@/components/admin/clients/add-client-modal';
import { useClientStats } from '@/hooks/clients/useClientStats';
import { useClients } from '@/hooks/clients/useClients';
import { ClientFiltersState } from '@/types/client';

export default function ClientsPage() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [filters, setFilters] = useState<ClientFiltersState>({
        search: '',
        status: undefined,
        industryId: undefined,
        isVerified: undefined,
        preferredContactMethod: undefined,
        createdAfter: undefined,
        createdBefore: undefined,
        hasContract: undefined,
        hasStaff: undefined,
    });

    const { data: clients, refetch: refetchClients, isError: isClientsError, isLoading: isClientsLoading } = useClients(filters);

    const { data: stats } = useClientStats(filters);

    const handleFilterChange = useCallback((newFilters: Partial<ClientFiltersState>) => {
        setFilters((prevFilters: ClientFiltersState) => ({
            ...prevFilters,
            ...newFilters,
        }));
    }, []);

    const handleTryAgain = useCallback(async () => {
        try {
            await refetchClients();
        } catch (err) {
            console.error('Failed to fetch clients:', err);
        }
    }, [refetchClients]);

    return (
        <div className="container mx-auto p-6 space-y-6">
            <ClientHeader onAddClick={() => setIsAddModalOpen(true)} />
            <ClientStats stats={stats} />
            <ClientFilters onFilterChangeAction={handleFilterChange} currentFilters={filters} />

            {isClientsLoading ? (
                <div className="flex justify-center py-8">
                    <LoadingSpinner className="w-8 h-8" />
                </div>
            ) : isClientsError ? (
                <div className="py-8 text-center">
                    <p className="text-red-500 mb-4">Failed to load clients</p>
                    <Button onClick={handleTryAgain}>Try Again</Button>
                </div>
            ) : (
                <ClientList clients={clients?.data || []} />
            )}

            <AddClientModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    refetchClients();
                    setIsAddModalOpen(false);
                }}
            />
        </div>
    );
}