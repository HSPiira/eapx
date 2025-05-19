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
    contactEmail: string | null;
    contactPhone: string | null;
    location: string | null;
    qualifications: string[];
    specializations: string[];
    rating: number | null;
    isVerified: boolean;
    status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED' | 'SUSPENDED' | 'RESIGNED';
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

export function ProviderTable({ providers, onEdit, onDelete }: ProviderTableProps) {
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

    const handleRowClick = (provider: Provider) => {
        setSelectedProvider(selectedProvider?.id === provider.id ? null : provider);
    };

    return (
        <div className="flex gap-6">
            <div className="flex-1">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead>Services</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {providers.map((provider) => (
                            <TableRow
                                key={provider.id}
                                className={cn(
                                    "cursor-pointer hover:bg-muted/50",
                                    selectedProvider?.id === provider.id && "bg-muted"
                                )}
                                onClick={() => handleRowClick(provider)}
                            >
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        {provider.name}
                                        {provider.isVerified && (
                                            <Badge variant="outline" className="text-xs">Verified</Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>{provider.type}</TableCell>
                                <TableCell>
                                    <Badge variant={provider.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                        {provider.status.toLowerCase()}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {provider.rating ? provider.rating.toFixed(1) : '-'}
                                </TableCell>
                                <TableCell>{provider._count?.services || 0}</TableCell>
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

            {selectedProvider && (
                <div className="w-[400px]">
                    <Card className="rounded-md">
                        <CardHeader className="relative">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                                onClick={() => setSelectedProvider(null)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                            <div className="flex items-center justify-between pr-8">
                                <CardTitle>{selectedProvider.name}</CardTitle>
                                <Badge variant={selectedProvider.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                    {selectedProvider.status.toLowerCase()}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex justify-between">
                                        <span>Type:</span>
                                        <span>{selectedProvider.type}</span>
                                    </div>
                                    {selectedProvider.contactEmail && (
                                        <div className="flex justify-between">
                                            <span>Email:</span>
                                            <span>{selectedProvider.contactEmail}</span>
                                        </div>
                                    )}
                                    {selectedProvider.contactPhone && (
                                        <div className="flex justify-between">
                                            <span>Phone:</span>
                                            <span>{selectedProvider.contactPhone}</span>
                                        </div>
                                    )}
                                    {selectedProvider.location && (
                                        <div className="flex justify-between">
                                            <span>Location:</span>
                                            <span>{selectedProvider.location}</span>
                                        </div>
                                    )}
                                    {selectedProvider.rating && (
                                        <div className="flex justify-between">
                                            <span>Rating:</span>
                                            <span>{selectedProvider.rating.toFixed(1)}</span>
                                        </div>
                                    )}
                                </div>

                                {selectedProvider.qualifications.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium">Qualifications</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedProvider.qualifications.map((qual, index) => (
                                                <Badge key={index} variant="secondary">
                                                    {qual}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedProvider.specializations.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium">Specializations</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedProvider.specializations.map((spec, index) => (
                                                <Badge key={index} variant="secondary">
                                                    {spec}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium">Activity</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Services</p>
                                            <p className="text-2xl font-bold">{selectedProvider._count?.services || 0}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Sessions</p>
                                            <p className="text-2xl font-bold">{selectedProvider._count?.sessions || 0}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
} 