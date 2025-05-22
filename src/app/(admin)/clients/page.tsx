// src/app/(admin)/clients/page.tsx
'use client';

import React, { useCallback, useState } from 'react';
import { ClientHeader, ClientFilters, ClientStats, ClientList } from '@/components/admin/clients';
import { Button, LoadingSpinner } from '@/components/ui';
import { useQuery } from '@tanstack/react-query';
import { BaseStatus, ContactMethod } from '@prisma/client';
import { AddClientModal } from '@/components/admin/clients/add-client-modal';

interface Client {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    website: string | null;
    industry: {
        id: string;
        name: string;
        code: string;
    } | null;
    status: string;
    isVerified: boolean;
    activeContracts: number;
    totalStaff: number;
    contactPerson: string | null;
    preferredContactMethod: string | null;
    timezone: string | null;
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

interface ClientStatsResponse {
    total: number;
    active: number;
    verified: number;
    newInTimeRange: number;
    byStatus: Record<string, number>;
    byIndustry: Record<string, number>;
    byVerification: Record<string, number>;
}

interface ClientFiltersState {
    search: string;
    status?: BaseStatus | 'all';
    industryId?: string | 'all';
    isVerified?: boolean;
    preferredContactMethod?: ContactMethod;
    createdAfter?: Date;
    createdBefore?: Date;
    hasContract?: boolean;
    hasStaff?: boolean;
}

async function fetchClients(filters: ClientFiltersState): Promise<ClientsResponse> {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.industryId) params.set('industryId', filters.industryId);
    if (filters.isVerified !== undefined) params.set('isVerified', filters.isVerified.toString());
    if (filters.preferredContactMethod) params.set('preferredContactMethod', filters.preferredContactMethod);
    if (filters.createdAfter) params.set('createdAfter', filters.createdAfter.toISOString());
    if (filters.createdBefore) params.set('createdBefore', filters.createdBefore.toISOString());
    if (filters.hasContract !== undefined) params.set('hasContract', filters.hasContract.toString());
    if (filters.hasStaff !== undefined) params.set('hasStaff', filters.hasStaff.toString());

    const response = await fetch(`/api/clients?${params.toString()}`);
    if (!response.ok) {
        throw new Error('Failed to fetch clients');
    }
    return response.json();
}

async function fetchClientStats(filters: ClientFiltersState): Promise<ClientStatsResponse> {
    const params = new URLSearchParams();
    // Currently, stats API only supports industryId filtering for the total count accurately
    // We might need to update the stats API to handle all filters for accurate filtered stats
    if (filters.industryId && filters.industryId !== 'all') params.set('industryId', filters.industryId);

    const response = await fetch(`/api/clients/stats?${params.toString()}`);
    if (!response.ok) {
        throw new Error('Failed to fetch client stats');
    }
    return response.json();
}

export default function ClientsPage() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [filters, setFilters] = useState<ClientFiltersState>({
        search: '',
        status: 'all',
        industryId: 'all',
        isVerified: undefined,
        preferredContactMethod: undefined,
        createdAfter: undefined,
        createdBefore: undefined,
        hasContract: undefined,
        hasStaff: undefined,
    });

    const { data: clients, refetch: refetchClients, isError: isClientsError, isLoading: isClientsLoading } = useQuery<ClientsResponse>({
        queryKey: ['clients', filters], // Include filters in query key
        queryFn: () => fetchClients(filters),
        retry: false,
    });

    const { data: stats } = useQuery<ClientStatsResponse>({
        queryKey: ['client-stats', { industryId: filters.industryId }], // Include relevant filters in query key for stats
        queryFn: () => fetchClientStats(filters),
        retry: false,
    });

    const handleFilterChange = useCallback((newFilters: Partial<ClientFiltersState>) => {
        setFilters(prevFilters => ({
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