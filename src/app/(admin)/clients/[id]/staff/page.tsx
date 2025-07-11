'use client';

import StaffList from '@/components/admin/clients/staff/staff-list';
import { useQuery } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { use } from 'react';

interface Params {
    id: string;
}

async function getClientStaff(clientId: string) {
    const response = await fetch(`/api/clients/${clientId}/staff`);
    if (!response.ok) {
        throw new Error(`Failed to fetch staff: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

export default function ClientStaffPage({
    params,
}: {
    params: Promise<Params>;
}) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    const { data, isLoading, error } = useQuery({
        queryKey: ['client-staff', id],
        queryFn: () => getClientStaff(id),
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <LoadingSpinner className="w-8 h-8" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-500 mb-4">Failed to load staff</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto">
            <StaffList clientId={id} data={data.data} />
        </div>
    );
} 