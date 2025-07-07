'use client';

import React from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui';
import { MoreHorizontal } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Provider } from '@/types/provider';

interface ProviderTableProps {
    providers: Provider[];
    onEdit: (provider: Provider) => void;
    onDelete: (id: string) => void;
}

function toProperCase(str: string | null | undefined) {
    if (!str) return '';
    return str
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
}

export function ProviderTable({ providers, onEdit, onDelete }: ProviderTableProps) {
    const columns = [
        {
            header: 'Name',
            accessor: 'name',
        },
        {
            header: 'Type',
            accessor: (provider: Provider) => toProperCase(provider.type),
        },
        {
            header: 'Entity Type',
            accessor: (provider: Provider) => toProperCase(provider.entityType),
        },
        {
            header: 'Email',
            accessor: 'contactEmail',
        },
        {
            header: 'Phone',
            accessor: 'contactPhone',
        },
        {
            header: 'Status',
            cell: (provider: Provider) => (
                <Badge variant={provider.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {toProperCase(provider.status)}
                </Badge>
            ),
        },
        {
            header: 'Verified',
            accessor: (provider: Provider) => provider.isVerified ? 'Yes' : 'No',
        },
        {
            header: 'Actions',
            cell: (provider: Provider) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(provider.id)}>
                            Copy Provider ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit(provider)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(provider.id)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <DataTable
            data={providers}
            columns={columns}
        />
    );
} 