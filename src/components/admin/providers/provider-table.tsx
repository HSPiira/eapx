'use client';

import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui';
import { X, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Provider {
    id: string;
    name: string;
    type: string;
    entityType: string;
    contactEmail: string | null;
    contactPhone: string | null;
    location: string | null;
    qualifications: string[];
    specializations: string[];
    rating: number | null;
    isVerified: boolean;
    status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED' | 'SUSPENDED' | 'RESIGNED';
    createdAt: string;
    _count?: {
        services: number;
        sessions: number;
    };
}

interface ProviderTableProps {
    providers: Provider[];
    onEdit: (provider: Provider) => void;
    onDelete: (id: string) => void; // Assuming onDelete takes ID for now
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
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Entity Type</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Verified</TableHead>
                            <TableHead>Actions</TableHead>
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
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {provider.name}
                                        {provider.isVerified && (
                                            <Badge variant="outline" className="text-xs">Verified</Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>{toProperCase(provider.type)}</TableCell>
                                <TableCell>{toProperCase(provider.entityType)}</TableCell>
                                <TableCell>{provider.contactEmail}</TableCell>
                                <TableCell>{provider.contactPhone}</TableCell>
                                <TableCell>
                                    <Badge variant={provider.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                        {toProperCase(provider.status)}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {provider.isVerified ? 'Yes' : 'No'}
                                </TableCell>
                                <TableCell className="text-right">
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