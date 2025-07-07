
'use client';

import React from 'react';
import { DataTable } from '@/components/ui/data-table';
import { ServiceDetailsCard } from './service-details-card';
import { Service } from '@/types/services';

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

            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return sortDirection === 'asc' ? -1 : 1;
            if (bValue == null) return sortDirection === 'asc' ? 1 : -1;

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

    const columns = [
        {
            header: 'Name',
            accessor: 'name',
        },
        {
            header: 'Description',
            accessor: 'description',
        },
    ];

    return (
        <div className="flex gap-6 w-full">
            <div className="flex-1 overflow-x-hidden w-full">
                <DataTable
                    data={sortedServices}
                    columns={columns}
                    onRowClick={handleServiceClick}
                    className={className}
                />
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
 