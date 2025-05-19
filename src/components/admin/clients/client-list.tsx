// src/components/clients/client-list.tsx
'use client';

import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface Client {
    id: string;
    name: string;
    email: string;
    industry: {
        id: string;
        name: string;
        code: string;
    };
    status: string;
    isVerified: boolean;
    activeContracts: number;
    totalStaff: number;
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
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Industry</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Active Contracts</TableHead>
                        <TableHead>Staff</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {clients.map((client) => (
                        <TableRow
                            key={client.id}
                            className={cn(
                                "cursor-pointer hover:bg-muted/50",
                                "transition-colors"
                            )}
                            onClick={() => handleRowClick(client.id)}
                        >
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <div>
                                        <div className="font-medium">{client.name}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {client.email}
                                        </div>
                                    </div>
                                    {client.isVerified && (
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Verified
                                        </Badge>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>{client.industry.name}</TableCell>
                            <TableCell>
                                <Badge variant={client.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                    {client.status}
                                </Badge>
                            </TableCell>
                            <TableCell>{client.activeContracts}</TableCell>
                            <TableCell>{client.totalStaff}</TableCell>
                            <TableCell>
                                {format(new Date(client.updatedAt), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // TODO: Implement actions menu
                                    }}
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}