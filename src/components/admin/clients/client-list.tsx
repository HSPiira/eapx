// src/components/clients/client-list.tsx
'use client';

import React from 'react';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, CheckCircle2, Globe, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';
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
        <div className="w-full">
            <Table>
                <TableCaption>A list of your clients and their details.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[300px]">Client</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Industry</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Active Contracts</TableHead>
                        <TableHead className="text-right">Staff</TableHead>
                        <TableHead className="text-right">Last Updated</TableHead>
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
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    <div>
                                        <div>{client.name}</div>
                                        {client.contactPerson && (
                                            <div className="text-sm text-muted-foreground">
                                                Contact: {client.contactPerson}
                                            </div>
                                        )}
                                    </div>
                                    {client.isVerified && (
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Verified
                                        </Badge>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col gap-1">
                                    {client.email && (
                                        <div className="flex items-center gap-1 text-sm">
                                            <Mail className="h-3 w-3" />
                                            {client.email}
                                        </div>
                                    )}
                                    {client.phone && (
                                        <div className="flex items-center gap-1 text-sm">
                                            <Phone className="h-3 w-3" />
                                            {client.phone}
                                        </div>
                                    )}
                                    {client.website && (
                                        <div className="flex items-center gap-1 text-sm">
                                            <Globe className="h-3 w-3" />
                                            {client.website}
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>{client.industry?.name || '-'}</TableCell>
                            <TableCell>
                                <Badge variant={client.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                    {client.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">{client.activeContracts}</TableCell>
                            <TableCell className="text-right">{client.totalStaff}</TableCell>
                            <TableCell className="text-right">
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