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
    className?: string;
}

export function ServiceTable({ services = [], onEdit, onDelete, className }: ServiceTableProps) {
    const [searchQuery] = React.useState('');
    const [sortField] = React.useState<keyof Service>('name');
    const [sortDirection] = React.useState<'asc' | 'desc'>('asc');
    const [selectedService, setSelectedService] = React.useState<Service | null>(null);

    const filteredServices = React.useMemo(() => {
        return services.filter(service =>
            service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [services, searchQuery]);

    const sortedServices = React.useMemo(() => {
        return [...filteredServices].sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];

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
            <div className="flex-1 overflow-x-hidden w-full">
                <Table className={`w-full table-fixed divide-y divide-gray-200 dark:divide-gray-700 ${className}`}>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-60 whitespace-nowrap truncate">Name</TableHead>
                            <TableHead className="w-auto whitespace-nowrap truncate">Description</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedServices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={2} className="text-center py-6 text-muted-foreground whitespace-nowrap">
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
                                    <TableCell className="w-40 whitespace-nowrap truncate font-medium">{service.name}</TableCell>
                                    <TableCell className="w-auto whitespace-nowrap truncate">{service.description || '-'}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {selectedService && (
                <div className="w-[400px]">
                    <ServiceDetailsCard
                        service={selectedService}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onClose={() => setSelectedService(null)}
                    />
                </div>
            )}
        </div>
    );
} 