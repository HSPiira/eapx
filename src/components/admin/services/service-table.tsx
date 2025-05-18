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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Service {
    id: string;
    name: string;
    description: string | null;
    status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'ARCHIVED' | 'DELETED';
    duration: number | null;
    capacity: number | null;
    isPublic: boolean;
    price: number | null;
    category: {
        id: string;
        name: string;
    };
    ServiceProvider?: {
        id: string;
        name: string;
        type: string;
    } | null;
}

interface ServiceTableProps {
    services: Service[];
}

export function ServiceTable({ services }: ServiceTableProps) {
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    const handleRowClick = (service: Service) => {
        setSelectedService(selectedService?.id === service.id ? null : service);
    };

    return (
        <div className="flex gap-6">
            <div className="flex-1">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Price</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {services.map((service) => (
                            <TableRow
                                key={service.id}
                                className={cn(
                                    "cursor-pointer hover:bg-muted/50",
                                    selectedService?.id === service.id && "bg-muted"
                                )}
                                onClick={() => handleRowClick(service)}
                            >
                                <TableCell className="font-medium">{service.name}</TableCell>
                                <TableCell>{service.category.name}</TableCell>
                                <TableCell>
                                    <Badge variant={service.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                        {service.status.toLowerCase()}
                                    </Badge>
                                </TableCell>
                                <TableCell>{service.duration ? `${service.duration} min` : '-'}</TableCell>
                                <TableCell>{service.price ? `$${service.price.toFixed(2)}` : '-'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {selectedService && (
                <div className="w-[400px]">
                    <Card className="rounded-md">
                        <CardHeader className="relative">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                                onClick={() => setSelectedService(null)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                            <div className="flex items-center justify-between pr-8">
                                <CardTitle>{selectedService.name}</CardTitle>
                                <Badge variant={selectedService.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                    {selectedService.status.toLowerCase()}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="text-base mb-4">
                                {selectedService.description}
                            </CardDescription>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex justify-between">
                                    <span>Category:</span>
                                    <span>{selectedService.category.name}</span>
                                </div>
                                {selectedService.duration && (
                                    <div className="flex justify-between">
                                        <span>Duration:</span>
                                        <span>{selectedService.duration} minutes</span>
                                    </div>
                                )}
                                {selectedService.capacity && (
                                    <div className="flex justify-between">
                                        <span>Capacity:</span>
                                        <span>{selectedService.capacity} people</span>
                                    </div>
                                )}
                                {selectedService.price && (
                                    <div className="flex justify-between">
                                        <span>Price:</span>
                                        <span>${selectedService.price.toFixed(2)}</span>
                                    </div>
                                )}
                                {selectedService.ServiceProvider && (
                                    <div className="flex justify-between">
                                        <span>Provider:</span>
                                        <span>{selectedService.ServiceProvider.name}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>Visibility:</span>
                                    <span>{selectedService.isPublic ? 'Public' : 'Private'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
} 