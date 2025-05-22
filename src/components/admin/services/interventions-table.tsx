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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from '@/lib/utils';
import { InterventionDetailsCard } from './intervention-details-card';

interface Intervention {
    id: string;
    name: string;
    description: string | null;
    serviceId: string;
    service: {
        id: string;
        name: string;
    };
    status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'ARCHIVED' | 'DELETED';
    duration: number | null;
    capacity: number | null;
    prerequisites: string | null;
    isPublic: boolean;
    price: number | null;
    metadata: Record<string, unknown>;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
    serviceProviderId: string | null;
    ServiceProvider?: {
        id: string;
        name: string;
        type: string;
    } | null;
}

interface InterventionsTableProps {
    interventions: Intervention[];
    onEdit: (intervention: Intervention) => void;
    onDelete: (intervention: Intervention) => void;
}

export function InterventionsTable({ interventions, onEdit, onDelete }: InterventionsTableProps) {
    const [selected, setSelected] = useState<Intervention | null>(null);

    const handleRowClick = (intervention: Intervention) => {
        setSelected(selected?.id === intervention.id ? null : intervention);
    };

    return (
        <div className="flex gap-6 w-full">
            <div className="flex-1 overflow-x-auto w-full">
                <div className="min-w-[900px]">
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="whitespace-nowrap min-w-[160px]">Name</TableHead>
                                <TableHead className="whitespace-nowrap min-w-[160px]">Service</TableHead>
                                <TableHead className="whitespace-nowrap min-w-[120px]">Status</TableHead>
                                <TableHead className="whitespace-nowrap min-w-[120px]">Capacity</TableHead>
                                <TableHead className="whitespace-nowrap min-w-[120px]">Price</TableHead>
                                <TableHead className="whitespace-nowrap min-w-[160px]">Created</TableHead>
                                <TableHead className="whitespace-nowrap min-w-[120px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {interventions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground whitespace-nowrap">
                                        No interventions found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                interventions.map((intervention) => (
                                    <TableRow
                                        key={intervention.id}
                                        className={`cursor-pointer hover:bg-muted/50 ${selected?.id === intervention.id ? 'bg-muted' : ''}`}
                                        onClick={() => handleRowClick(intervention)}
                                    >
                                        <TableCell className="font-medium whitespace-nowrap min-w-[160px]">{intervention.name}</TableCell>
                                        <TableCell className="whitespace-nowrap min-w-[160px]">{intervention.service.name}</TableCell>
                                        <TableCell className="whitespace-nowrap min-w-[120px]">
                                            <Badge variant={intervention.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                                {intervention.status.toLowerCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap min-w-[120px]">{intervention.capacity || '-'}</TableCell>
                                        <TableCell className="whitespace-nowrap min-w-[120px]">{intervention.price ? `$${intervention.price.toFixed(2)}` : '-'}</TableCell>
                                        <TableCell className="whitespace-nowrap min-w-[160px]">{formatDate(intervention.createdAt)}</TableCell>
                                        <TableCell className="whitespace-nowrap min-w-[120px] text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={e => { e.stopPropagation(); onEdit(intervention); }}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={e => { e.stopPropagation(); onDelete(intervention); }}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
            {selected && (
                <InterventionDetailsCard
                    intervention={selected}
                    onClose={() => setSelected(null)}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            )}
        </div>
    );
} 