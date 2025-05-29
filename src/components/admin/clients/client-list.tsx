// src/components/clients/client-list.tsx
'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

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

interface ClientListProps {
    clients: Client[];
}

export function ClientList({ clients }: ClientListProps) {
    const router = useRouter();

    const handleRowClick = (clientId: string) => {
        router.push(`/clients/${clientId}`);
    };

    return (
        <div className="w-full overflow-x-auto rounded-sm border border-border bg-background">
            <table className="min-w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-muted">
                    <tr>
                        <th className="px-6 py-4 font-semibold tracking-wide">Name</th>
                        <th className="px-6 py-4 font-semibold tracking-wide">Email</th>
                        <th className="px-6 py-4 font-semibold tracking-wide">Phone</th>
                        <th className="px-6 py-4 font-semibold tracking-wide">Industry</th>
                        <th className="px-6 py-4 font-semibold tracking-wide">Status</th>
                        <th className="px-6 py-4 font-semibold tracking-wide">Verified</th>
                        <th className="px-6 py-4 font-semibold tracking-wide text-right">Staff</th>
                    </tr>
                </thead>
                <tbody>
                    {clients.map((client) => (
                        <tr
                            key={client.id}
                            className={cn(
                                "hover:bg-muted/50 cursor-pointer transition-colors border-b border-border",
                            )}
                            onClick={() => handleRowClick(client.id)}
                        >
                            <td className="px-6 py-3 font-medium max-w-[180px] truncate">{client.name}</td>
                            <td className="px-6 py-3 max-w-[200px] truncate">{client.email || '-'}</td>
                            <td className="px-6 py-3 max-w-[140px] truncate">{client.phone || '-'}</td>
                            <td className="px-6 py-3 max-w-[140px] truncate">{client.industry?.name || '-'}</td>
                            <td className="px-6 py-3">
                                <Badge variant={client.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                    {client.status}
                                </Badge>
                            </td>
                            <td className="px-6 py-3">
                                {client.isVerified ? (
                                    <Badge variant="default" className="flex items-center gap-1">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        Verified
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="flex items-center gap-1 text-muted-foreground">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Not Verified
                                    </Badge>
                                )}
                            </td>
                            <td className="px-6 py-3 text-right">{client.totalStaff}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}