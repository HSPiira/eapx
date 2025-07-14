
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/ui/data-table';
import { Client } from '@/types/client';
import { CheckCircle2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientListProps {
    clients: Client[];
}

export function ClientList({ clients }: ClientListProps) {
    const router = useRouter();

    const columns = [
        {
            header: 'Name',
            accessor: 'name',
        },
        {
            header: 'Email',
            accessor: 'email',
        },
        {
            header: 'Phone',
            accessor: 'phone',
        },
        {
            header: 'Industry',
            accessor: (client: Client) => client.industry?.name || '-',
        },
        {
            header: 'Status',
            cell: (client: Client) => (
                <div className="flex items-center gap-2">
                    {client.status === 'ACTIVE' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    <span className={cn(
                        client.status === 'ACTIVE' ? 'text-green-500' : 'text-gray-500'
                    )}>
                        {client.status.charAt(0) + client.status.slice(1).toLowerCase()}
                    </span>
                </div>
            ),
        },
        {
            header: 'Verified',
            cell: (client: Client) => (
                <div className="flex items-center gap-2">
                    {client.isVerified ? (
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                    ) : (
                        <ShieldAlert className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className={cn(
                        client.isVerified ? "text-green-500" : "text-yellow-500"
                    )}>
                        {client.isVerified ? "Verified" : "Pending"}
                    </span>
                </div>
            ),
        },
        {
            header: 'Staff',
            accessor: 'totalStaff',
        },
    ];

    const handleRowClick = (client: Client) => {
        router.push(`/clients/${client.id}`);
    };

    return (
        <DataTable
            data={clients}
            columns={columns}
            onRowClick={handleRowClick}
        />
    );
}
