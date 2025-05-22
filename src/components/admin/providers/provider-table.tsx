'use client';

import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type ProviderType = 'COUNSELOR' | 'CLINIC' | 'HOTLINE' | 'COACH' | 'OTHER';
type ProviderEntityType = 'INDIVIDUAL' | 'COMPANY';
type ProviderStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED' | 'SUSPENDED' | 'RESIGNED';

interface Provider {
    id: string;
    name: string;
    type: ProviderType;
    entityType: ProviderEntityType;
    contactEmail: string;
    contactPhone: string | null;
    location: string | null;
    qualifications: string[];
    specializations: string[];
    status: ProviderStatus;
    isVerified: boolean;
    rating: number | null;
    createdAt: string;
    updatedAt?: string;
    _count?: {
        services: number;
        sessions: number;
    };
}

interface ProviderTableProps {
    providers: Provider[];
    onEdit: (provider: Provider) => void;
    onDelete: (id: string) => void;
}

// Utility function to convert ENUM_STRING to Proper Case
function toProperCase(str: string | null | undefined) {
    if (!str) return '';
    return str
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
}

export function ProviderTable({ providers, onEdit, onDelete }: ProviderTableProps) {
    return (
        <div className="w-full overflow-x-auto">
            <div className="min-w-[900px]">
                <Table className="w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="px-2 text-left">Name</TableHead>
                            <TableHead className="px-2 text-left">Type</TableHead>
                            <TableHead className="px-2 text-left">Entity Type</TableHead>
                            <TableHead className="px-2 text-left">Email</TableHead>
                            <TableHead className="px-2 text-left">Phone</TableHead>
                            <TableHead className="px-2 text-left">Status</TableHead>
                            <TableHead className="px-2 text-left">Verified</TableHead>
                            <TableHead className="px-2 text-left">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {providers.map((provider) => (
                            <TableRow
                                key={provider.id}
                                className={cn(
                                    "cursor-pointer hover:bg-muted/50"
                                )}
                            >
                                <TableCell className="pl-2">{provider.name}
                                    {provider.isVerified && (
                                        <Badge variant="outline" className="text-xs ml-2">Verified</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="pl-2">{toProperCase(provider.type)}</TableCell>
                                <TableCell className="pl-2">{toProperCase(provider.entityType)}</TableCell>
                                <TableCell className="pl-2">{provider.contactEmail}</TableCell>
                                <TableCell className="pl-2">{provider.contactPhone}</TableCell>
                                <TableCell className="pl-2">
                                    <Badge variant={provider.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                        {toProperCase(provider.status)}
                                    </Badge>
                                </TableCell>
                                <TableCell className="pl-2">{provider.isVerified ? 'Yes' : 'No'}</TableCell>
                                <TableCell className="pl-2 text-right">
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
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
} 