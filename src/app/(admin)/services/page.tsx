'use client';

import React, { useCallback } from 'react';
import { ServiceList } from '@/components/admin/services';
import { Button, LoadingSpinner } from '@/components/ui';
import { useQuery } from '@tanstack/react-query';

interface Service {
    id: string;
    title: string;
    description: string;
    icon: string;
    status: 'active' | 'inactive';
    enrolledUsers: number;
    category: string;
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
    const response = await fetch('/api/services');
    if (!response.ok) {
        throw new Error('Failed to fetch services');
    }
    return response.json();
}

export default function ServicesPage() {
    const { data: services, refetch, isError, isLoading: isQueryLoading } = useQuery<ServicesResponse>({
        queryKey: ['services'],
        queryFn: fetchServices,
        retry: false,
    });

    const handleTryAgain = useCallback(async () => {
        try {
            await refetch();
        } catch (err) {
            console.error('Failed to fetch services:', err);
        }
    }, [refetch]);

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
                <Button>Add New Service</Button>
            </div>
            <ServiceList services={services?.data || []} />
        </div>
    );
} 