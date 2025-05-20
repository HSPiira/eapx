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
import { Button } from '@/components/ui';
import { Input } from "@/components/ui/input";
import { Search, ArrowUpDown } from 'lucide-react';
import { ServiceDetailsCard } from './service-details-card';

interface Service {
    id: string;
    name: string;
    description: string | null;
    metadata: Record<string, unknown>;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
    interventions: Array<{
        id: string;
        name: string;
    }>;
}

interface ServiceTableProps {
    services?: Service[];
    onEdit?: (service: Service) => void;
    onDelete?: (service: Service) => void;
}

export function ServiceTable({ services = [], onEdit, onDelete }: ServiceTableProps) {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [sortField, setSortField] = React.useState<keyof Service>('name');
    const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
    const [selectedService, setSelectedService] = React.useState<Service | null>(null);

    const filteredServices = React.useMemo(() => {
        return services.filter(service =>
            service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [services, searchQuery]);

    const sortedServices = React.useMemo(() => {
        return [...filteredServices].sort((a, b) => {
            let aValue = a[sortField];
            let bValue = b[sortField];

            // Handle null/undefined values
            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return sortDirection === 'asc' ? -1 : 1;
            if (bValue == null) return sortDirection === 'asc' ? 1 : -1;

            // Handle string comparison
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortDirection === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            return 0;
        });
    }, [filteredServices, sortField, sortDirection]);

    const handleServiceClick = (service: Service) => {
        if (selectedService?.id === service.id) {
            setSelectedService(null);
        } else {
            setSelectedService(service);
        }
    };

    return (
        <div className="flex gap-6 w-full">
            <div className="flex-1 overflow-x-auto w-full">
                <div className="min-w-[600px]">
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="whitespace-nowrap min-w-[160px]">Name</TableHead>
                                <TableHead className="whitespace-nowrap min-w-[280px]">Description</TableHead>
                                <TableHead className="whitespace-nowrap min-w-[120px]">Interventions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedServices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-6 text-muted-foreground whitespace-nowrap">
                                        No services found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sortedServices.map((service) => (
                                    <TableRow
                                        key={service.id}
                                        className={`cursor-pointer hover:bg-muted/50 ${selectedService?.id === service.id ? 'bg-muted' : ''}`}
                                        onClick={() => handleServiceClick(service)}
                                    >
                                        <TableCell className="font-medium whitespace-nowrap min-w-[160px]">{service.name}</TableCell>
                                        <TableCell className="max-w-md whitespace-nowrap min-w-[280px]">
                                            <div className="truncate">
                                                {service.description || '-'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap min-w-[120px]">{service.interventions?.length || 0}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {selectedService && (
                <ServiceDetailsCard
                    service={selectedService}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onClose={() => setSelectedService(null)}
                />
            )}
        </div>
    );
} 